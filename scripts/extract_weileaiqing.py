#!/usr/bin/env python3
import docx
import re
import sys
import difflib

doc_path = 'books/weileaiqingbagedabuxianyuan1991/为了爱情，巴格达不嫌远+2026-07-01+16.39.docx'
out_path = 'books/weileaiqingbagedabuxianyuan1991/source.md'

doc = docx.Document(doc_path)
paras = doc.paragraphs

DATE_PATTERN = re.compile(r'^\d{4}年')

def normalize(t):
    t = t.replace('罌', '罂').replace('的', '').replace('了', '').replace('之', '')
    return re.sub(r'[，。！？；：“”‘’「」\s]+', '', t)

def first_line(title):
    return title.split('／')[0].strip() if '／' in title else title.strip()

def match_score(s1, s2):
    s1n, s2n = normalize(s1), normalize(s2)
    if not s1n or not s2n: return 0.0
    if s1n == s2n: return 1.0
    if (s1n in s2n or s2n in s1n) and min(len(s1n), len(s2n)) >= 6: return 0.9
    return difflib.SequenceMatcher(None, s1n, s2n).ratio()

def parse_page(text):
    m = re.search(r'[\t\s]*[\(（]?(\d+)[）\)·\s.]*$', text)
    if m: return m.group(1), text[:m.start()].strip()
    return None, text.strip()

vol1_toc = []
for i in range(13, 52):
    t = paras[i].text.strip()
    if not t or '卷之' in t: continue
    page, title = parse_page(t)
    vol1_toc.append({'title': re.sub(r'[·…，、]+$', '', title).strip(), 'page': page or ''})

fixed_vol1 = []
skip_next = False
for j, entry in enumerate(vol1_toc):
    if skip_next: skip_next = False; continue
    if not entry['page'] and j+1 < len(vol1_toc) and vol1_toc[j+1]['title'] == '记忆':
        fixed_vol1.append({'title': entry['title'] + '记忆', 'page': vol1_toc[j+1]['page']})
        skip_next = True
    else:
        fixed_vol1.append(entry)
vol1_toc = fixed_vol1

vol2_toc = []
buf = []
for i in range(53, 122):
    t = paras[i].text.strip()
    if not t or t == '(158)': continue
    page, title = parse_page(t)
    title = re.sub(r'[·…，、]+$', '', title).strip()
    if page:
        combined = (''.join(buf) + title) if buf else title
        vol2_toc.append({'title': re.sub(r'[·…，、]+$', '', combined).strip(), 'page': page})
        buf = []
    else:
        if title: buf.append(title)

def find_poem_starts(toc_list, body_start, body_end):
    starts = []
    prev_end = body_start
    for entry in toc_list:
        fl = first_line(entry['title'])
        if not fl:
            starts.append(None)
            continue
        search_from = max(prev_end, body_start)
        candidates = []
        for i in range(search_from, body_end):
            if match_score(fl, paras[i].text.strip()) >= 0.8:
                candidates.append(i)
        
        # BUG FIX: Always take the FIRST candidate found after the TOC/previous poem
        body_pos = candidates[0] if candidates else None
        
        starts.append(body_pos)
        if body_pos: prev_end = body_pos + 1
    return starts

vol1_starts = find_poem_starts(vol1_toc, 126, 1179)
vol2_starts = find_poem_starts(vol2_toc, 1179, 2776)

def get_poem_body(start, end_limit):
    if start is None: return []
    lines = []
    for i in range(start, end_limit):
        t = paras[i].text.strip()
        if DATE_PATTERN.match(t):
            lines.append(t)  # Include date line
            break
        lines.append(paras[i].text)
    result = [l.strip() for l in lines]
    while result and not result[0]: result.pop(0)
    while result and not result[-1]: result.pop()
    return result

def get_poem_end(starts, idx, body_end):
    current_start = starts[idx]
    if current_start is None: return body_end
    if idx + 1 < len(starts) and starts[idx+1]:
        return starts[idx+1]
    for i in range(current_start, body_end):
        if DATE_PATTERN.match(paras[i].text.strip()): return i + 1
    return body_end

output = []
output.append('# 为了爱情，巴格达不嫌远\n')
output.append('## 作者小传\n')
output.append(paras[2].text.strip() + '\n')
output.append('## 目录\n')
output.append(f'卷之一 黑戈壁（{len(vol1_toc)}首）')
for e in vol1_toc: output.append(f'　　{e["title"]}' + (f'\t{e["page"]}' if e['page'] else ''))
output.append(f'\n卷之二 悲戚的夜莺（{len(vol2_toc)}首）')
for e in vol2_toc: output.append(f'　　{e["title"]}' + (f'\t{e["page"]}' if e['page'] else ''))
output.append('\n---\n')

output.append(f'## 卷之一 黑戈壁（{len(vol1_toc)}首）\n')
for idx, entry in enumerate(vol1_toc):
    parts = entry['title'].split('／', 1) if '／' in entry['title'] else [entry['title'], '']
    output.append(f'### {parts[0].strip()}')
    if parts[1]: output.append(f'　　　　{parts[1].strip()}')
    output.append('')
    start, end = vol1_starts[idx], get_poem_end(vol1_starts, idx, 1179)
    if start is None:
        output.append('[诗歌内容缺失]')
    else:
        for bl in get_poem_body(start, end): output.append(bl)
    output.append(f'\n[p{entry["page"]}]\n' if entry['page'] else '\n')
output.append('* * *\n')

output.append(f'## 卷之二 悲戚的夜莺（{len(vol2_toc)}首）\n')
for idx, entry in enumerate(vol2_toc):
    parts = entry['title'].split('／', 1) if '／' in entry['title'] else [entry['title'], '']
    output.append(f'### {parts[0].strip()}')
    if parts[1]: output.append(f'　　　　{parts[1].strip()}')
    output.append('')
    start, end = vol2_starts[idx], get_poem_end(vol2_starts, idx, 2776)
    if start is None:
        output.append('[诗歌内容缺失]')
    else:
        for bl in get_poem_body(start, end): output.append(bl)
    output.append(f'\n[p{entry["page"]}]\n' if entry['page'] else '\n')
output.append('* * *\n')

output.append('## 后记\n')
for i in range(2780, 2789):
    if paras[i].text.strip(): output.append(paras[i].text.strip())
output.append('\n作者\n1990年4月于乌鲁木齐\n')

output.append('## 出版信息\n')
output.append('书名：为了爱情，巴格达不嫌远\n作者：李瑜\n出版者：山东文艺出版社（济南经九路胜利大街）')
output.append('发行者：山东文艺出版社发行部\n印刷者：济南书刊印刷厂')
output.append('1991年1月第1版 1991年1月第1次印刷\n印数：1-1,200\nISBN：7-5329-0577-2\n定价：2.55元\n')

with open(out_path, 'w', encoding='utf-8') as f: f.write('\n'.join(output))
print(f"Generated {out_path} successfully!")
