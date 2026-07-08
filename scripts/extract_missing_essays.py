import os
import re
import json

books = [
    "hanxuema1995",
    "zhungaer1984",
    "weileaiqingbagedabuxianyuan1991",
    "heiyingsushangjuan1998",
    "heiyingsuxiajuan1998"
]

mapping = {
    "作者小传": "biography",
    "内容简介": "introduction",
    "序": "preface",
    "序言": "preface",
    "开拓精神万岁（序言）": "preface",
    "代序": "preface",
    "后记": "afterword",
    "跋": "afterword",
    "跋：从大漠升起袅袅的笛声——读《准噶尔诗草》": "afterword",
    "出版信息": "publication"
}

def clean_title(title):
    return title.replace('##', '').strip()

for book in books:
    source_path = f"books/{book}/source.md"
    if not os.path.exists(source_path):
        continue
        
    with open(source_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Split by ## headers
    parts = re.split(r'^(##\s+.*)$', content, flags=re.MULTILINE)
    
    current_title = None
    
    for i in range(1, len(parts), 2):
        header = parts[i]
        text = parts[i+1].strip()
        
        raw_title = clean_title(header)
        
        # Match with mapping
        essay_type = None
        clean_name = raw_title
        
        for key, val in mapping.items():
            if raw_title.startswith(key):
                essay_type = val
                clean_name = key
                break
                
        if essay_type:
            # We found an essay section
            slug = f"{book}-{essay_type}"
            essay_path = f"src/content/essays/{slug}.md"
            
            # Special case for zhungaer1984 preface / afterword exact titles
            if raw_title == "开拓精神万岁（序言）":
                clean_name = "序·开拓精神万岁"
            elif raw_title.startswith("跋：从大漠"):
                clean_name = "跋·从大漠升起袅袅的笛声"
            
            print(f"[{book}] Found '{raw_title}' -> will save as '{slug}' (Title: {clean_name})")
            
            # Create if not exists or if it's missing frontmatter
            write = False
            if not os.path.exists(essay_path):
                write = True
            else:
                with open(essay_path, 'r') as ef:
                    existing = ef.read()
                    if "---" not in existing:
                        write = True
            
            if write:
                with open(essay_path, 'w', encoding='utf-8') as ef:
                    ef.write(f"---\ntitle: \"{clean_name}\"\n---\n\n{text}\n")
                print(f"Created {essay_path}")

