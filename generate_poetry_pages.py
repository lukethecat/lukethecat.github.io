#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
剑仙诗歌网站生成器
Creates all chapter index files and individual poem pages for the 《汗血马》 collection
"""

import re
import os
import json
from pathlib import Path

# Chapter definitions with poem counts - using actual directory names with hyphens
CHAPTERS = [
    {"name": "啊-中亚细亚新大陆", "display_name": "啊，中亚细亚新大陆", "poem_count": 5, "poem_titles": [
        "那辉煌箭矢一定还在飞驰",
        "紧攥的手儿缓缓松开了",
        "大月氏呀",
        "沐浴在白日渴望",
        "丝绸之路的开拓者在马背上笑了"
    ]},
    {"name": "祁连山下已经沉寂", "display_name": "祁连山下已经沉寂", "poem_count": 6, "poem_titles": [
        "他一直望着",
        "那就是早就憧憬的月牙湖么",
        "那只军鸽仓卒盘旋了一会",
        "呀，天山之子",
        "他的幽灵一样闪动的黑骏马",
        "伫立弥漫醇香的金黑夕阳"
    ]},
    {"name": "野罂粟", "display_name": "野罂粟", "poem_count": 5, "poem_titles": [
        "奔驰的马蹄下",
        "七月的夜呀",
        "一枝褐黑的野罂粟凋零了",
        "她面前的伊犁河",
        "她的\"望乡之歌\"的悲怆乐句"
    ]},
    {"name": "汗血马", "display_name": "汗血马", "poem_count": 4, "poem_titles": [
        "马背上的统帅",
        "又骤然在潮水般人流中凝固了",
        "向着遥远的西方",
        "已经看到"
    ]},
    {"name": "楼兰骤然逝去", "display_name": "楼兰骤然逝去", "poem_count": 4, "poem_titles": [
        "匍匐罗布泊畔",
        "这棵从罗布泊丛林采集的树种",
        "啊，让罗布泊的不朽涛声",
        "新月般的罗布泊呀"
    ]},
    {"name": "呀-贝加尔湖秋已深了", "display_name": "呀，贝加尔湖秋已深了", "poem_count": 4, "poem_titles": [
        "山中牧场那绿色火焰",
        "久久吻着这抔泥土",
        "伫立晶莹的贝加尔湖畔",
        "那只鸿雁从他手中飞去"
    ]},
    {"name": "在苍茫的叶尔羌", "display_name": "在苍茫的叶尔羌", "poem_count": 5, "poem_titles": [
        "在阳关城楼盘旋的那群鸽子",
        "那条灰褐的地平线",
        "清真大寺拱北上的那弯新月",
        "那歌声溶入叶尔羌河波浪涛声",
        "丝绸的琥珀般光泽"
    ]},
    {"name": "烽火熄灭了", "display_name": "烽火熄灭了", "poem_count": 4, "poem_titles": [
        "将那暴风雨般沉闷的马蹄声",
        "仿佛10万兵甲",
        "已经混战在一起了",
        "启明星就要逝去"
    ]},
    {"name": "黑蓝的波斯湾", "display_name": "黑蓝的波斯湾", "poem_count": 4, "poem_titles": [
        "向着遥远西方",
        "那双金鹧鸪穿过的枝叶",
        "扎格罗斯山风湿漉漉的",
        "苦涩海水和着苦涩泪水"
    ]},
    {"name": "塔里木河之波", "display_name": "塔里木河之波", "poem_count": 5, "poem_titles": [
        "他的3000敦煌子弟兵",
        "双眼轻闭",
        "与塔里木河黑色波涛融合一起",
        "马背上的阿娜尔古丽",
        "还鸟瞰着"
    ]},
    {"name": "偷渡的托钵僧", "display_name": "偷渡的托钵僧", "poem_count": 6, "poem_titles": [
        "这就是边塞的夜么",
        "泪花在星光下闪耀",
        "婀娜的飞天女神",
        "吔吔吔",
        "他在月下闭目祈祷",
        "伊塞克湖热浪"
    ]},
    {"name": "诗魂还在飞驰", "display_name": "诗魂还在飞驰", "poem_count": 5, "poem_titles": [
        "呀，不再是孤独的跋涉者了",
        "只以挥动骑刀的手",
        "橘黄的篝火还在闪耀",
        "静得可以听到",
        "就像他的妻子在新婚之夜"
    ]},
    {"name": "啊-塔拉斯会战", "display_name": "啊，塔拉斯会战", "poem_count": 5, "poem_titles": [
        "似乎看到他狂飙般的骑队",
        "倾听难忘的塔拉斯之夏",
        "一点青褐光斑",
        "呀，新月和启明星",
        "轻微而急促的马蹄声浪"
    ]},
    {"name": "小孤城", "display_name": "小孤城", "poem_count": 4, "poem_titles": [
        "狂奔的300壮士",
        "那白蝴蝶般的雪花",
        "一定听到伊塞克湖的涛声了",
        "在这条刚刚闪耀丝绸光泽的小路上"
    ]},
    {"name": "绿宝石般的叶尔羌", "display_name": "绿宝石般的叶尔羌", "poem_count": 4, "poem_titles": [
        "捧着那盏",
        "水城威尼斯",
        "还有叶尔羌",
        "不倦向大漠"
    ]},
    {"name": "静静的六盘山", "display_name": "静静的六盘山", "poem_count": 6, "poem_titles": [
        "向着深邃的丛林射去",
        "不久他才在军用地图上",
        "只有遥远的孩提时代",
        "其其格在雕花的瓦罐里",
        "那是他母亲当年唱的",
        "他的骏马"
    ]},
    {"name": "奔腾的伊犁河", "display_name": "奔腾的伊犁河", "poem_count": 5, "poem_titles": [
        "从伊犁河上游",
        "血红夕阳",
        "微笑着",
        "他的22名勇士像22朵乌云",
        "遥远的格登山"
    ]},
    {"name": "沙枣花般的买木热·爱孜木", "display_name": "沙枣花般的买木热·爱孜木", "poem_count": 5, "poem_titles": [
        "呀，美丽的天山月",
        "纤纤素手",
        "夜莺飞去了",
        "蓝宝石般的瞳仁",
        "交织成未来香妃"
    ]},
    {"name": "啊-启明星", "display_name": "啊，启明星", "poem_count": 6, "poem_titles": [
        "啊，1771年",
        "这就是乌拉尔河么",
        "其其格姑娘再也没有泪水了",
        "吉尔吉斯草原还在沉睡",
        "勒勒车木轮",
        "啊，巴尔喀什湖的波涛旋律"
    ]},
    {"name": "塞上赤子怆然涕下", "display_name": "塞上赤子怆然涕下", "poem_count": 4, "poem_titles": [
        "这轮月亮",
        "拓下一页",
        "难怪严峻主峰",
        "月下边陲"
    ]},
    {"name": "西域父老谁不识君", "display_name": "西域父老谁不识君", "poem_count": 5, "poem_titles": [
        "深情抚摩",
        "在塞上悲愤行吟",
        "乌云遮住天山月",
        "唻唻唻",
        "曾爱过南国一片蓝色大海"
    ]}
]

SOURCE_FILE = "content/1995hanxuema/汗血马 李瑜 QWEN校对20260203.md"
BOOK_DIR = "content/1995hanxuema"
BOOK_NAME = "汗血马"
BOOK_AUTHOR = "李瑜"
BOOK_YEAR = 1995

def extract_poem_content(source_path):
    """Extract complete poetry content from the source file"""
    try:
        with open(source_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except Exception as e:
        print(f"Error reading source file: {e}")
        return None

def generate_chapter_index(chapter_info):
    """Generate index markdown for a chapter"""
    chapter_name = chapter_info["name"]
    display_name = chapter_info["display_name"]
    poem_count = chapter_info["poem_count"]
    poem_titles = chapter_info["poem_titles"]

    md = f"""+++
title = "{display_name}"
date = {BOOK_YEAR}-01-01
weight = {CHAPTERS.index(chapter_info) + 1}
sort_by = "weight"
insert_anchor_links = "left"
transparent = true

[taxonomies]
tags = ["poetry", "chapter", "{BOOK_NAME}", "{BOOK_AUTHOR}"]

[extra]
chapter_name = "{display_name}"
poem_count = {poem_count}
book_name = "{BOOK_NAME}"
book_year = {BOOK_YEAR}
+++

# {display_name}

**篇章** | **诗歌数量**: {poem_count}

---

## 本篇章诗歌列表


"""

    for i, title in enumerate(poem_titles, 1):
        # Generate URL-friendly title
        title_slug = title.replace("/", "").replace("\\", "").replace('"', '').replace("，", "").replace("、", "")
        title_slug = re.sub(r'[^\w\s-]', '', title_slug).replace(" ", "-").replace("---", "-")
        md += f'{i}. [{title}]({title_slug}/)\n'

    md += f"""

---

<div class="chapter-navigation">
  <a href="../">← 返回《{BOOK_NAME}》</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="/archive">← 第二层：书籍列表</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="/">←→ 返回首页</a>
</div>

<style>
.chapter-navigation {{
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  text-align: center;
}}
[data-theme="dark"] .chapter-navigation {{
  border-top-color: #333;
}}
.chapter-navigation a {{
  text-decoration: none;
}}
.chapter-navigation a:hover {{
  text-decoration: underline;
}}
</style>
"""

    return md

def generate_poem_page(chapter_name, display_name, poem_title, index_in_chapter, total_poems):
    """Generate markdown for an individual poem page"""
    # URL-friendly title
    title_slug = poem_title.replace("/", "").replace("\\", "").replace('"', '').replace("，", "").replace("、", "")
    title_slug = re.sub(r'[^\w\s-]', '', title_slug).replace(" ", "-").replace("---", "-")

    poem_date = f"{BOOK_YEAR}-{index_in_chapter:02d}-01"

    md = f"""+++
title = "{poem_title}"
date = {poem_date}
weight = {index_in_chapter}
insert_anchor_links = "left"

[taxonomies]
tags = ["poetry", "{BOOK_NAME}", "{display_name}", "{BOOK_AUTHOR}", "poem"]
categories = ["{BOOK_NAME}"]

[extra]
author = "{BOOK_AUTHOR}"
year = {BOOK_YEAR}
chapter = "{display_name}"
chapter_slug = "{chapter_name}"
poem_index = {index_in_chapter}
source_book = "{BOOK_NAME}"
+++

# {poem_title}

**篇 · {display_name}** | **作者**: {BOOK_AUTHOR} | **出版年份**: {BOOK_YEAR}

---

## 诗歌内容

<p style="font-size: 1.1em; line-height: 1.8em; margin: 1.5em 0;">
诗歌内容待添加...
</p>

---

## 元数据

- **收录于**: [{BOOK_NAME}](../../../)
- **篇章**: [{display_name}](../)
- **本篇章第**: {index_in_chapter}/{total_poems} 首
- **诗人**: {BOOK_AUTHOR}
- **出版年份**: {BOOK_YEAR}

---

<div class="poem-navigation">
  <a href="../">← 返回本篇章</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="../../../">← 返回《{BOOK_NAME}》</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="/archive">← 书籍列表</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="/">←→ 返回首页</a>
</div>

<style>
.poem-navigation {{
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  text-align: center;
}}
[data-theme="dark"] .poem-navigation {{
  border-top-color: #333;
}}
.poem-navigation a {{
  text-decoration: none;
}}
.poem-navigation a:hover {{
  text-decoration: underline;
}}
</style>
"""

    return md

def main():
    """Main function to generate all poetry pages"""
    print("=" * 60)
    print("剑仙诗集网站生成器")
    print("=" * 60)

    # Get current working directory
    current_dir = Path.cwd()

    # Check source file
    source_path = current_dir / SOURCE_FILE
    if not source_path.exists():
        print(f"❌ Source file not found: {source_path}")
        return

    print(f"\n✓ Found source file: {SOURCE_FILE}")

    # Track created files
    created_count = 0
    existing_count = 0

    # Chapter index files
    print("\n" + "=" * 60)
    print("生成篇章索引文件")
    print("=" * 60)

    for chapter in CHAPTERS:
        chapter_dir = current_dir / BOOK_DIR / chapter["name"]

        if not chapter_dir.exists():
            print(f"❌ Chapter directory not found: {chapter['name']}")
            continue

        index_path = chapter_dir / "_index.md"

        if index_path.exists():
            existing_count += 1
            print(f"✓ Found existing: {chapter['name']}/_index.md")
        else:
            # Generate chapter index
            md_content = generate_chapter_index(chapter)

            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(md_content)

            created_count += 1
            print(f"✓ Created: {chapter['name']}/_index.md")

    # Individual poem pages
    print("\n" + "=" * 60)
    print("生成诗歌页面")
    print("=" * 60)

    total_poems = 0
    poems_created = 0
    poems_existing = 0

    for chapter in CHAPTERS:
        chapter_dir = current_dir / BOOK_DIR / chapter["name"]

        if not chapter_dir.exists():
            continue

        for i, poem_title in enumerate(chapter["poem_titles"], 1):
            title_slug = poem_title.replace("/", "").replace("\\", "").replace('"', '').replace("，", "").replace("、", "")
            title_slug = re.sub(r'[^\w\s-]', '', title_slug).replace(" ", "-").replace("---", "-")

            poem_path = chapter_dir / f"{title_slug}.md"
            total_poems += 1

            if poem_path.exists():
                poems_existing += 1
                print(f"✓ Found: {chapter['name']}/{title_slug}.md")
            else:
                # Generate poem page
                md_content = generate_poem_page(
                    chapter_name=chapter["name"],
                    display_name=chapter["display_name"],
                    poem_title=poem_title,
                    index_in_chapter=i,
                    total_poems=chapter["poem_count"]
                )

                with open(poem_path, 'w', encoding='utf-8') as f:
                    f.write(md_content)

                poems_created += 1
                created_count += 1
                print(f"✓ Created: {chapter['name']}/{title_slug}.md")

    # Create book cover directory
    print("\n" + "=" * 60)
    print("生成书籍封面目录")
    print("=" * 60)

    cover_dir = current_dir / "static" / "images" / "covers" / BOOK_DIR
    cover_dir.mkdir(parents=True, exist_ok=True)
    print(f"✓ Created/Verified: static/images/{BOOK_DIR}/")

    # Summary
    print("\n" + "=" * 60)
    print("生成结果总结")
    print("=" * 60)
    print(f"总页面数: {created_count + existing_count + poems_existing}")
    print(f"新创建: {created_count} (章节: {created_count - poems_created + existing_count}，诗歌: {poems_created})")
    print(f"已存在: {existing_count + poems_existing}")
    print(f"总诗歌: 101")
    print(f"总章节: 21")

    if created_count > 0:
        print(f"\n📝 下一步操作:")
        print(f"1. 测试: cd {BOOK_DIR}")
        print(f"2. 测试: zola serve")
        print(f"3. 提交: git add . && git commit -m 'Add 汗血马 poetry pages'")
        print(f"4. 推送: git push origin master")

    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
