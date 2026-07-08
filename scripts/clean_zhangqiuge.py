#!/usr/bin/env python3
import re

INPUT = '/Users/jellyfishjaco/Documents/Git_Repo/liyupoerty.com-master/books/essay4_zhangqiuge/full_text.txt'
OUTPUT = '/Users/jellyfishjaco/Documents/Git_Repo/liyupoerty.com-master/src/content/essays/zhang-qiuge-xinbianseshi-2011.md'

with open(INPUT, 'r', encoding='utf-8') as f:
    raw = f.read()

pages = raw.split('\f')

start_page_idx = -1
for i, page in enumerate(pages):
    if '\u201c边塞\u201d一词从词源上看很早就出现了' in page:
        start_page_idx = i
        break

end_page_idx = len(pages)
for i in range(start_page_idx, len(pages)):
    if '\n注释\n' in pages[i] or pages[i].strip().startswith('注释'):
        end_page_idx = i
        break

content_pages = pages[start_page_idx:end_page_idx]

extracted_footnotes = []
footnote_counter = 1
cleaned_lines = []

for page_idx, page in enumerate(content_pages):
    lines = page.split('\n')
    
    footer_start_idx = len(lines)
    
    page_num_idx = -1
    for i in range(len(lines)-1, -1, -1):
        line = lines[i].strip()
        if line:
            if re.match(r'^\d+$', line):
                page_num_idx = i
            break
            
    potential_footnote_start = -1
    search_start = max(0, (page_num_idx if page_num_idx != -1 else len(lines)) - 15)
    for i in range(search_start, page_num_idx if page_num_idx != -1 else len(lines)):
        line = lines[i].strip()
        if re.match(r'^([①②③④⑤⑥⑦⑧⑨⑩cd])', line):
            potential_footnote_start = i
            break
            
    if potential_footnote_start != -1:
        footnote_text = "\n".join([l.strip() for l in lines[potential_footnote_start:page_num_idx if page_num_idx != -1 else len(lines)] if l.strip()])
        marker_match = re.match(r'^([①②③④⑤⑥⑦⑧⑨⑩cd])\s*(.*)', footnote_text, re.DOTALL)
        if marker_match:
            original_marker = marker_match.group(1)
            rest_of_text = marker_match.group(2)
            extracted_footnotes.append({
                'id': f'[^f{footnote_counter}]',
                'original': original_marker,
                'text': rest_of_text
            })
            footnote_counter += 1
        footer_start_idx = potential_footnote_start
    elif page_num_idx != -1:
        footer_start_idx = page_num_idx
        
    main_text_lines = lines[:footer_start_idx]
    
    for i, line in enumerate(main_text_lines):
        stripped = line.strip()
        if stripped in ('c', 'd', '①', '②', '③', '④'):
            if extracted_footnotes and extracted_footnotes[-1]['original'] == stripped:
                if len(cleaned_lines) > 0:
                    cleaned_lines[-1] = cleaned_lines[-1] + extracted_footnotes[-1]['id']
            continue
            
        if stripped.endswith('c') and not stripped.endswith('ac') and len(stripped) > 5:
            stripped = stripped[:-1]
            if extracted_footnotes and extracted_footnotes[-1]['original'] == 'c':
                stripped += extracted_footnotes[-1]['id']
        elif stripped.endswith('d') and not stripped.endswith('and') and len(stripped) > 5:
            stripped = stripped[:-1]
            if extracted_footnotes and extracted_footnotes[-1]['original'] == 'd':
                stripped += extracted_footnotes[-1]['id']
        elif stripped[-1:] in ('①', '②', '③', '④'):
            marker = stripped[-1:]
            stripped = stripped[:-1]
            if extracted_footnotes and extracted_footnotes[-1]['original'] == marker:
                stripped += extracted_footnotes[-1]['id']
                
        if stripped:
            cleaned_lines.append(stripped)

# Fix separated '结' and '语'
for i in range(len(cleaned_lines) - 1):
    if cleaned_lines[i] == '结' and cleaned_lines[i+1] == '语':
        cleaned_lines[i] = '结语'
        cleaned_lines[i+1] = ''

cleaned_lines = [l for l in cleaned_lines if l]

# Phase 2: Merge lines
merged = []
current_para = []

terminal_punctuation = ('。', '！', '？', '”', '；', '：', '"', '）')

for i, line in enumerate(cleaned_lines):
    if re.match(r'^([一二三四五六七八九十]+)\s+(.+)$', line) and len(line) < 40:
        if current_para:
            merged.append(''.join(current_para))
            current_para = []
        merged.append(f'## {line}')
        continue
        
    if re.match(r'^（([一二三四五六七八九十]+)）\s*(.+)$', line) and len(line) < 40:
        if current_para:
            merged.append(''.join(current_para))
            current_para = []
        merged.append(f'### {line}')
        continue
        
    if line in ('前言', '结语', '结 语'):
        if current_para:
            merged.append(''.join(current_para))
            current_para = []
        merged.append(f'## {line.replace(" ", "")}')
        continue
        
    if re.match(r'^([一二三四五六七八九十]+)$', line):
        if current_para:
            merged.append(''.join(current_para))
            current_para = []
        if i + 1 < len(cleaned_lines):
            title = cleaned_lines[i+1]
            if len(title) < 40:
                merged.append(f'## {line} {title}')
                cleaned_lines[i+1] = ""
        continue
        
    if line == "":
        continue
        
    if re.match(r'^\[\d+\]$', line):
        if current_para:
            current_para[-1] = current_para[-1] + line
        else:
            current_para.append(line)
        continue
        
    current_para.append(line)
    
    stripped_line = re.sub(r'\[\^f\d+\]$', '', line)
    stripped_line = re.sub(r'\[\d+\]$', '', stripped_line)
    
    is_break = False
    if stripped_line.endswith(terminal_punctuation) and len(stripped_line) < 35:
        is_break = True
        
    if is_break and i + 1 < len(cleaned_lines):
        next_line = cleaned_lines[i+1].strip()
        if re.match(r'^([””）\]]|\[\d+\]|[，。、？！：；,\.])', next_line):
            is_break = False
            
    if is_break:
        merged.append(''.join(current_para))
        current_para = []

if current_para:
    merged.append(''.join(current_para))

citations_pages = pages[end_page_idx:]
citations_lines = []
for p in citations_pages:
    lines = [l.strip() for l in p.split('\n') if l.strip()]
    for line in lines:
        if line == '\x0c' or re.match(r'^\d+$', line):
            continue
        citations_lines.append(line)

merged_citations = []
curr_cit = []
for line in citations_lines:
    if line in ('参考文献', '在读期间发表论文清单', '致谢', '致 谢', '学位论文独创性声明', '学位论文知识产权权属声明'):
        break
    if re.match(r'^\[\d+\]', line):
        if curr_cit:
            merged_citations.append(' '.join(curr_cit))
        curr_cit = [line]
    elif curr_cit:
        curr_cit.append(line)
if curr_cit:
    merged_citations.append(' '.join(curr_cit))

output = []
output.append('---')
output.append('title: "新边塞诗研究"')
output.append('author: "张秋格"')
output.append('date: "2011-02"')
output.append('publication: "新疆大学硕士学位论文"')
output.append('sourceLink: ""')
output.append('tags: [新边塞诗, 张秋格, 硕士论文, 20世纪80年代, 诗歌研究]')
output.append('---')
output.append('')
output.append('**作者**：张秋格  ')
output.append('**学位**：新疆大学硕士学位论文  ')
output.append('**时间**：2011年2月  ')
output.append('**导师**：欧阳可惺')
output.append('')
output.append('## 摘要')
output.append('')
output.append('20世纪80年代初，随着「新边塞诗」登上文坛并成为当时诗歌界的一条亮丽的风景线，学人开始关注「新边塞诗」。纵观以往的研究成果，笔者认为，对「新边塞诗」的研究深度还不够，对「新边塞诗」的许多问题还缺乏系统全面的论述和评价。因此，有必要重新审视20世纪80年代以来的新边塞诗。')
output.append('')
output.append('本文对于20世纪80年代新边塞诗出现的时代和地域背景、新边塞诗的正名及评价做了梳理，并在此基础上对于「新边塞诗」的诗人身份、诗歌的审美特色和当代性做了分析，对后期的新变做了个人化的探讨。本文力求在宏观动态角度把握新边塞诗形成与新变的同时，也进行微观静态的理论分析，其中涉及到了文化、心理等方面的诸多内容。')
output.append('')
output.append('本文认为，20世纪80年代中后期新边塞诗歌开始走向了新变，原因是多方面的，其在主题和艺术手法等方面都发生了很大的蜕变，尤其是在当下一批「80后」新锐诗人活跃在诗坛之时，新边塞诗歌和全国诗坛的大趋势一样，呈现了多元化的态势。')
output.append('')
output.append('**关键词**：20世纪80年代，新边塞诗，发展，新变')
output.append('')
output.append('---')
output.append('')

if not any("前言" in m for m in merged[:5]):
    output.append('## 前言')
    output.append('')

for line in merged:
    output.append(line)
    output.append('')
    
if extracted_footnotes:
    output.append('---')
    output.append('## 脚注')
    output.append('')
    for fn in extracted_footnotes:
        text = fn['text'].replace('\n', ' ')
        output.append(f"{fn['id']}: {text}")
        output.append('')

if merged_citations:
    output.append('---')
    output.append('## 注释 (引文)')
    output.append('')
    for c in merged_citations:
        output.append(c)
        output.append('')

with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print(f"Generated clean markdown with {len(output)} lines, {len(extracted_footnotes)} footnotes, and {len(merged_citations)} citations.")
