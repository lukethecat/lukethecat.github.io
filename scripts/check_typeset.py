#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_typeset.py — 诗歌排版/结构校验门（task #16，2026-10-14 扩充：标题盲区）
对 src/content/*/book.json 逐诗扫描【标题 + 正文行】，命中即 FAIL。
取代人工目检；接入 website-update-sop 构建验证环节。

用法：
    python3 scripts/check_typeset.py            # FAIL 仅限硬错
    python3 scripts/check_typeset.py --strict   # 警告也当 FAIL
退出码：0=通过；1=有硬错；2=（--strict）有警告
"""
import json, glob, re, sys, os

# ---- 正文行规则 ----
DATE_LIKE = re.compile(r'^\s*(\d{4}\s*年\s*\d{1,2}\s*月(?:\s*\d{1,2}\s*日)?|[\u4e00-\u9fff]{4}年[\u4e00-\u9fff]{1,3}月(?:[\u4e00-\u9fff]{1,4}日)?)\s*$')
BARE_NUMBER = re.compile(r'^\d{1,2}$')
MD_RESIDUE = re.compile(r'^(#{1,6}\s|\*\*|>|`{3})')
HALF_PUNCT_CJK = re.compile(r'[\u4e00-\u9fff][,;:!?()]|[,;:!?()][\u4e00-\u9fff]')
LEADING_DOT = re.compile(r'^\s*\.')
DATE_YEAR_BAD = re.compile(r'^(10|1[0-8]|20[2-9])\d{2}年')

# ---- 标题规则（2026-10-14 新增：上一轮漏检的盲区）----
PAGE_NUM_IN_TEXT = re.compile(r'[（(]\s*\d{1,4}\s*[）)]')          # 页码混入（半/全角）
BAD_ELLIPSIS = re.compile(r'·{2,}|(?<!…)\.{2}(?!\.)|。{3,}')       # ··· / .. / 。。。
BRACKET_MIX = re.compile(r'(?:\([^）)]*[）)])|(?:（[^)]*\))')        # 半全角括号混用
MULTI_TITLE = re.compile(r'／.*／')                                 # 多标题粘连（≥3段）
# 象→像 白名单（这些词里的「象」是正确用法，不算错）
XIANG_KEEP = re.compile(r'意象|象牙|想象|现象|象征|大象|气象|卦象|天象|星象|形象|迹象|象限|象棋|抽象|对象|表象|征象|象形')


def xiang_typo(text):
    """返回『象』用作『像』的疑似错字列表（排除白名单词）。"""
    hits = []
    for m in re.finditer('象', text):
        ctx = text[max(0, m.start() - 2): m.start() + 3]
        if not XIANG_KEEP.search(ctx):
            hits.append(ctx)
    return hits


def scan_poem(p):
    errs, warns = [], []
    title = p.get('title', '') or ''
    lines = p.get('lines', [])

    # ---------- 标题 ----------
    if PAGE_NUM_IN_TEXT.search(title):
        errs.append(f'[T1-标题含页码] {title[:50]!r}')
    if BAD_ELLIPSIS.search(title):
        errs.append(f'[T2-标题省略号不规范] {title[:50]!r}')
    if ('(' in title and '）' in title) or ('（' in title and ')' in title):
        errs.append(f'[T3-标题半全角括号混用] {title[:50]!r}')
    if MULTI_TITLE.search(title):
        errs.append(f'[T4-标题多首粘连] {title[:50]!r}')
    if len(title) > 30:
        warns.append(f'[W-标题过长({len(title)}字)] {title[:50]!r}')
    for ctx in xiang_typo(title):
        errs.append(f'[T5-疑错别字 象→像] 标题片段 {ctx!r}')

    # ---------- 正文行 ----------
    for i, ln in enumerate(lines, 1):
        if not ln.strip():
            continue
        low = ln.strip()
        if DATE_LIKE.match(low):
            errs.append(f'[E1-日期入正文] L{i} {ln[:40]!r}')
        if BARE_NUMBER.match(low):
            errs.append(f'[E2-分节号入正文] L{i} {ln[:40]!r}')
        if MD_RESIDUE.match(ln):
            errs.append(f'[E3-MD残留] L{i} {ln[:40]!r}')
        if LEADING_DOT.match(ln):
            errs.append(f'[E4-行首半角点] L{i} {ln[:40]!r}')
        if HALF_PUNCT_CJK.search(ln):
            errs.append(f'[E5-半角标点混中文] L{i} {ln[:40]!r}')
        if PAGE_NUM_IN_TEXT.search(ln):
            errs.append(f'[E6-页码混入正文] L{i} {ln[:40]!r}')
        if BAD_ELLIPSIS.search(ln):
            warns.append(f'[W-省略号不规范] L{i} {ln[:40]!r}')
        for ctx in xiang_typo(ln):
            errs.append(f'[E7-疑错别字 象→像] L{i} 片段 {ctx!r}')
        # 行合并疑似：单行超长（>40字）且含重复短语 → 提示人工看
        if len(ln) > 45:
            warns.append(f'[W-超长行疑似合并] L{i} {ln[:40]!r}')

    # ---------- 元数据 ----------
    cd = p.get('composedDate') or ''
    if cd and DATE_YEAR_BAD.match(cd):
        warns.append(f'[W-异常年份] composedDate={cd!r}（疑似OCR误读，回源核）')
    return errs, warns


def main():
    strict = '--strict' in sys.argv
    root = os.path.join(os.path.dirname(__file__), '..')
    total_poems = total_err = total_warn = bad_poems = 0
    for path in sorted(glob.glob(os.path.join(root, 'src/content/*/book.json'))):
        book = json.load(open(path, encoding='utf-8'))
        for ch in book.get('chapters', []):
            for p in ch.get('poems', []):
                total_poems += 1
                errs, warns = scan_poem(p)
                if errs:
                    bad_poems += 1
                    print(f"\n✗ {book.get('id')}/{p.get('id')} 「{(p.get('title') or '')[:24]}」")
                    for e in errs[:25]:
                        print('   ', e)
                total_err += len(errs)
                total_warn += len(warns)
                if warns and not errs:
                    for w in warns[:5]:
                        print(f"⚠ {book.get('id')}/{p.get('id')} {w}")

    print(f"\n========== check_typeset ==========")
    print(f"  扫描诗数 : {total_poems}")
    print(f"  排版错误 : {total_err}  （命中即 FAIL）")
    print(f"  警告     : {total_warn}")
    if total_err == 0 and (not strict or total_warn == 0):
        print("✅ 排版门通过")
        sys.exit(0)
    elif total_err == 0:
        print("⚠ 仅警告（--strict 视为 FAIL）")
        sys.exit(2)
    else:
        print("❌ 排版门 FAIL — 请按 docs/golden-rules + editorial-review 修正源或解析器")
        sys.exit(1)


if __name__ == '__main__':
    main()
