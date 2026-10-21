#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_rendered.py — 渲染后网页审计（task #16；补上「看网页最终结果」这一层）

两种模式：
  （默认）本地构建产物：解析 out/books/*.html 的最终渲染文本
  --live            线上实际页面：直接下载已部署的书籍页再审计
                      （「构建产物对」≠「部署上去对」——中间隔着一层投递，需单独验）

检查项（标题 + 正文）：页码混入、省略号不规范、MD 残留、OCR 错别字(象→像)…
与 check_typeset.py（数据侧）互补：数据侧绿 ≠ 渲染正确。

用法：
    python3 scripts/check_rendered.py            # 需先 npm run build
    python3 scripts/check_rendered.py --live     # 验线上（建议周度抽查；可 --host 指定域名）
    python3 scripts/check_rendered.py --live --host https://lukethecat.github.io

退出码：0=通过；1=发现缺陷
"""
import glob, re, html as H, sys, os, ssl
from collections import Counter
from urllib.request import urlopen, Request
from urllib.error import URLError


def _ssl_ctx():
    """优先用 certifi CA（macOS 系统证书库常常不完整）。"""
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()

KEEP = re.compile(r'意象|象牙|想象|现象|象征|大象|气象|卦象|天象|星象|形象|迹象|象限|象棋|抽象|对象|表象|征象|象形')
PAGENUM = re.compile(r'[（(]\d{1,4}[）)]')
BADELL = re.compile(r'·{2,}|(?<!…)\.{2}(?!\.)')
BOOKS = ['hanxuema1995', 'heiyingsushangjuan1998', 'heiyingsuxiajuan1998',
         'weileaiqingbagedabuxianyuan1991', 'zhungaer1984']
DEFAULT_HOST = 'https://www.liyupoetry.com'


def get_pages_local(root):
    files = sorted(glob.glob(os.path.join(root, 'out/books/*.html')))
    if not files:
        print('✗ 未找到 out/books/*.html，请先 npm run build')
        sys.exit(1)
    return [(os.path.basename(f), open(f, encoding='utf-8').read()) for f in files]


def get_pages_live(host):
    pages = []
    for b in BOOKS:
        url = f'{host}/books/{b}'
        try:
            req = Request(url, headers={'User-Agent': 'check_rendered/1.0'})
            with urlopen(req, timeout=60, context=_ssl_ctx()) as r:
                pages.append((f'{b}.html', r.read().decode('utf-8', 'replace')))
        except (URLError, Exception) as e:
            print(f'✗ 拉取失败 {url}: {e}')
            sys.exit(1)
    return pages


def audit(pages, label):
    c = Counter(); samples = {}; n = 0
    for name, h in pages:
        arts = re.finditer(r'<article[^>]*data-poem-id="([^"]*)"[^>]*data-poem-title="([^"]*)"(.*?)</article>', h, re.S)
        arts = list(arts) or list(re.finditer(
            r'<article[^>]*data-poem-title="([^"]*)"[^>]*data-poem-id="([^"]*)"(.*?)</article>', h, re.S))
        for m in arts:
            n += 1
            g1, g2 = H.unescape(m.group(1)), H.unescape(m.group(2))
            pid, title = (g1, g2) if 'poem' in g1 else (g2, g1)
            txt = H.unescape(re.sub(r'<[^>]+>', '\n', m.group(3)))
            lines = [l.strip() for l in txt.split('\n') if l.strip()]

            def note(k, s):
                c[k] += 1
                samples.setdefault(k, (pid, title[:26], s[:30]))

            if PAGENUM.search(title):
                note('标题含页码', title)
            if BADELL.search(title):
                note('标题省略号不规范', title)
            if len(title) > 30:
                note('标题过长/疑似粘连', title)
            for l in lines:
                if PAGENUM.search(l):
                    note('正文含页码', l)
                if re.match(r'^#', l):
                    note('正文MD残留', l)
            for l in [title] + lines:
                for mm in re.finditer('象', l):
                    ctx = l[max(0, mm.start() - 2): mm.start() + 3]
                    if not KEEP.search(ctx):
                        note('错别字 象→像', ctx)

    print(f'=== {label}：{n} 首诗，{len(pages)} 个页面 ===')
    if not c:
        print('  ✅ 未发现缺陷')
        return 0
    for k, v in c.most_common():
        pid, t, s = samples[k]
        print(f'  {v:4d}  {k}   例: {pid} 「{t}」 {s!r}')
    return 1


def main():
    root = os.path.join(os.path.dirname(__file__), '..')
    if '--live' in sys.argv:
        host = DEFAULT_HOST
        if '--host' in sys.argv:
            host = sys.argv[sys.argv.index('--host') + 1]
        sys.exit(audit(get_pages_live(host), f'线上渲染审计（{host}）'))
    sys.exit(audit(get_pages_local(root), '本地构建产物渲染审计（out/）'))


if __name__ == '__main__':
    main()
