#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_rendered.py — 渲染后网页审计（task #16，2026-10-14 新增；补上「看网页最终结果」这一层）
直接解析构建产物 out/books/*.html 的最终渲染文本（读者所见），逐首诗检查：
  标题/正文中的页码混入、省略号不规范、MD 残留、OCR 错别字(象→像)…
与 check_typeset.py（数据侧）互补：数据侧绿 ≠ 渲染正确，本脚本才是「网页最终结果」把关。

用法（需先 npm run build）：
    python3 scripts/check_rendered.py
退出码：0=通过；1=发现缺陷
"""
import glob, re, html as H, sys, os
from collections import Counter

KEEP = re.compile(r'意象|象牙|想象|现象|象征|大象|气象|卦象|天象|星象|形象|迹象|象限|象棋|抽象|对象|表象|征象|象形')
PAGENUM = re.compile(r'[（(]\d{1,4}[）)]')
BADELL = re.compile(r'·{2,}|(?<!…)\.{2}(?!\.)')


def main():
    root = os.path.join(os.path.dirname(__file__), '..')
    files = sorted(glob.glob(os.path.join(root, 'out/books/*.html')))
    if not files:
        print('✗ 未找到 out/books/*.html，请先 npm run build')
        sys.exit(1)
    c = Counter(); samples = {}; n_articles = 0
    for f in files:
        h = open(f, encoding='utf-8').read()
        for m in re.finditer(r'<article[^>]*data-poem-id="([^"]*)"[^>]*data-poem-title="([^"]*)"(.*?)</article>', h, re.S) or \
                     re.finditer(r'<article[^>]*data-poem-title="([^"]*)"[^>]*data-poem-id="([^"]*)"(.*?)</article>', h, re.S):
            n_articles += 1
            a, b = H.unescape(m.group(1)), H.unescape(m.group(2))
            pid, title = (a, b) if 'poem' in a else (b, a)
            body = m.group(3)
            txt = H.unescape(re.sub(r'<[^>]+>', '\n', body))
            lines = [l.strip() for l in txt.split('\n') if l.strip()]

            def note(k, s):
                c[k] += 1
                samples.setdefault(k, (pid, title[:30], s[:40]))

            if PAGENUM.search(title):
                note('标题含页码', title)
            if BADELL.search(title):
                note('标题省略号不规范', title)
            if len(title) > 30:
                note('标题过长/疑似粘连', title)
            for l in lines:
                if PAGENUM.search(l):
                    note('正文含页码', l)
                if BADELL.search(l):
                    note('正文省略号不规范', l)
                if re.match(r'^#', l):
                    note('正文MD残留', l)
            for l in [title] + lines:
                for mm in re.finditer('象', l):
                    ctx = l[max(0, mm.start() - 2): mm.start() + 3]
                    if not KEEP.search(ctx):
                        note('错别字 象→像', ctx)

    print(f'=== 渲染后网页审计（{n_articles} 首诗，{len(files)} 个页面）===')
    if not c:
        print('  ✅ 未发现缺陷')
        sys.exit(0)
    for k, v in c.most_common():
        pid, t, s = samples[k]
        print(f'  {v:4d}  {k}   例: {pid} 「{t}」 {s!r}')
    sys.exit(1)


if __name__ == '__main__':
    main()
