import os
import re

# Configuration
SOURCE_FILE = "source.txt"
CONTENT_DIR = "content/1995hanxuema"
BOOK_TITLE = "汗血马"
AUTHOR = "李瑜"
YEAR = "1995"


def parse_source():
    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    sections = text.split("---")
    intro_section = sections[0].strip()
    toc_section = sections[1].strip()

    chapters = []
    other_sections = []

    for section in sections[2:]:
        section = section.strip()
        if not section:
            continue

        match = re.match(r"^##\s+(.+?)(（\d+首）)?$", section.split("\n")[0])
        if (
            match
            and "序" not in match.group(1)
            and "后记" not in match.group(1)
            and "出版信息" not in match.group(1)
        ):
            chapter_name = match.group(1).strip()
            chapters.append({"name": chapter_name, "content": section})
        else:
            other_sections.append(section)

    return intro_section, toc_section, chapters, other_sections


def process_chapters(chapters):
    for i, chapter in enumerate(chapters):
        chapter_name = chapter["name"]
        chapter_content = chapter["content"]

        chapter_slug = chapter_name.replace("，", "-").replace(" ", "")
        chapter_dir = os.path.join(CONTENT_DIR, f"{i + 1:02d}-{chapter_slug}")
        os.makedirs(chapter_dir, exist_ok=True)

        with open(os.path.join(chapter_dir, "_index.md"), "w", encoding="utf-8") as f:
            f.write(f'+++\ntitle = "{chapter_name}"\nsort_by = "weight"\n+++\n')

        lines = chapter_content.split("\n")
        current_poem = None
        poem_weight = 1
        expecting_subtitle = False

        for line in lines:
            line_stripped_right = line.rstrip()

            if line_stripped_right.startswith("### "):
                if current_poem:
                    save_poem(current_poem, chapter_dir, chapter_name, poem_weight)
                    poem_weight += 1

                title = line_stripped_right.replace("### ", "").strip()
                current_poem = {"title": title, "subtitle": None, "content": []}
                expecting_subtitle = True
            elif expecting_subtitle:
                expecting_subtitle = False
                indent_len = len(line) - len(line.lstrip())
                if indent_len >= 2 and line.strip():
                    current_poem["subtitle"] = line.strip()
                else:
                    if re.match(r"^\[p\d+\]$", line.strip()):
                        continue
                    if line.strip():
                        current_poem["content"].append(line.strip())
            elif current_poem:
                if re.match(r"^\[p\d+\]$", line.strip()):
                    continue
                if len(current_poem["content"]) == 0 and not line.strip():
                    continue
                current_poem["content"].append(line.strip())

        if current_poem:
            save_poem(current_poem, chapter_dir, chapter_name, poem_weight)


def save_poem(poem, directory, chapter_name, weight):
    title = poem["title"]
    subtitle = poem["subtitle"]
    content = "\n".join(poem["content"]).strip()

    filename = title.replace("/", "-").replace(" ", "") + ".md"
    filepath = os.path.join(directory, filename)

    # Escape quotes
    toml_title = title.replace('"', '\\"')

    full_body_title = f"### {title}"
    if subtitle:
        full_body_title += f"\n　　　　{subtitle}"

    md_content = f"""+++
title = "{toml_title}"
weight = {weight}
[taxonomies]
tags = ["{BOOK_TITLE}", "{chapter_name}"]
[extra]
subtitle = "{subtitle if subtitle else ""}"
+++

{full_body_title}

{content}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(md_content)


def main():
    if not os.path.exists(CONTENT_DIR):
        os.makedirs(CONTENT_DIR)

    with open(os.path.join(CONTENT_DIR, "_index.md"), "w", encoding="utf-8") as f:
        f.write(f'+++\ntitle = "{BOOK_TITLE}"\nsort_by = "weight"\n+++\n')

    intro, toc, chapters, others = parse_source()
    process_chapters(chapters)


if __name__ == "__main__":
    main()
