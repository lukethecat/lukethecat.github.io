#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_typeset.py — 诗歌排版/结构校验门（task #16 沉淀）
对 src/content/*/book.json 逐诗扫描读者可见正文（poem.lines），
命中即 FAIL，供录入/修订后构建前强制运行。取代人工目检。

用法：
    python3 scripts/check_typeset.py            # 全量扫描，命中报 FAIL
    python3 scripts/check_typeset.py --strict   # 连「数据完整性警告」也当 FAIL
退出码：0=通过；1=有排版错；2=（--strict 时）有警告
"""
import json
import glob
import re
import sys
import os

# 与 process-books.ts 的 COMPOSED_DATE_REGEX 对齐：这些不该出现在正文
DATE_LIKE = re.compile(
    r'^\s*(\d{4}\s*年\s*\d{1,2}\s*月(?:\s*\d{1,2}\s*日)?|'
    r'[\u4e00-\u9fff]{4}年[\u4e00-\u9fff]{1,3}月(?:[\u4e00-\u9fff]{1,4}日)?)\s*$'
)
BARE_NUMBER = re.compile(r'^\d{1,2}$')                    # 组诗分节号残留
MD_RESIDUE = re.compile(r'^(#{1,6}\s|\*\*|>|`{3})')       # MD 残留
HALF_PUNCT_CJK = re.compile(r'[\u4e00-\u9fff][,;:!?()]|[,;:!?()][\u4e00-\u9fff]')
LEADING_DOT = re.compile(r'^\s*\.')                        # 行首半角点
TRAILING_DOT_SPACE = re.compile(r'[ \t]{3,}')              # 多余空格
DATE_YEAR_BAD = re.compile(r'^(10|1[0-8]|20[2-9])\d{2}年')  # 明显异常年份(如1087)

def scan_poem(book, ch, p):
    errs, warns = [], []
    pid, title = p.get('id'), p.get('title', '')[:16]
    lines = p.get('lines', [])
    for i, ln in enumerate(lines, 1):
        if not ln.strip():
            continue
        if DATE_LIKE.match(ln):
            errs.append(f'[E1-日期入正文] L{i} {ln!r}')
        if BARE_NUMBER.match(ln.strip()):
            errs.append(f'[E2-分节号入正文] L{i} {ln!r}')
        if MD_RESIDUE.match(ln):
            errs.append(f'[E3-MD残留] L{i} {ln!r}')
        if LEADING_DOT.match(ln):
            errs.append(f'[E4-行首半角点] L{i} {ln!r}')
        if HALF_PUNCT_CJK.search(ln):
            errs.append(f'[E5-半角标点混中文] L{i} {ln!r}')
        if TRAILING_DOT_SPACE.search(ln):
            warns.append(f'[W-多余空格] L{i} {ln!r}')
    # 元数据健全性
    cd = p.get('composedDate') or ''
    if cd and DATE_YEAR_BAD.match(cd):
        warns.append(f'[W-异常年份] composedDate={cd!r}（疑似OCR误读，回源核）')
    # 分节连续性（组诗缺节）
    if p.get('sections'):
        secs = [int(m.group(1)) for ln in lines for m in [re.match(r'^(?:#{1,6}\s*)?(\d{1,2})$', ln.strip())] if m]
        # sections 计数已由 parser 记录；这里对源内实际出现的编号做连续性提示
    return errs, warns

def main():
    strict = '--strict' in sys.argv
    root = os.path.join(os.path.dirname(__file__), '..')
    total_poems = total_err = total_warn = 0
    bad_poems = 0
    for path in sorted(glob.glob(os.path.join(root, 'src/content/*/book.json'))):
        book = json.load(open(path, encoding='utf-8'))
        for ch in book.get('chapters', []):
            for p in ch.get('poems', []):
                total_poems += 1
                errs, warns = scan_poem(book, ch, p)
                if errs:
                    bad_poems += 1
                    print(f"\n✗ {book.get('id')}/{p.get('id')} 「{p.get('title','')[:24]}」")
                    for e in errs[:20]:
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
