# 剑仙诗歌网站维护手册

## 项目概述

这是基于 Zola 静态网站生成器构建的诗歌网站，托管于 GitHub Pages 并部署到 Cloudflare Pages。

**项目地址**: `https://github.com/lukethecat/lukethecat.github.io`  
**生产环境**: `https://liyupoerty.com`

---

## 目录
1. [项目结构](#项目结构)
2. [前端技术栈](#前端技术栈)
3. [依赖管理](#依赖管理)
4. [本地开发](#本地开发)
5. [内容管理](#内容管理)
6. [构建流程](#构建流程)
7. [部署执行](#部署执行)
8. [故障排查](#故障排查)
9. [功能扩展](#功能扩展)
10. [维护检查清单](#维护检查清单)

---

## 项目结构

```
liyupoerty.com-master/           # 根目录 (项目仓库)
├── .github/workflows/ci.yml    # GitHub Actions CI/CD 配置
├── config.toml                 # Zola 配置文件
├── Makefile                    # 构建命令脚本
├── README.md                   # 项目说明文档
├── content/                    # 网站内容 (Zola 文档)
│   ├── _index.md              # 首页内容
│   ├── static/                # 静态页面 (about, archive, etc.)
│   ├── 1980/                  # 1980 年出版的诗集目录
│   │   ├── _index.md         # 诗集元数据
│   │   ├── LI-YU/            # 英文作者相关
│   │   └── 李瑜/              # 中文书籍结构
│   └── 1995hanxuema/          # 1995《汗血马》诗集
│       ├── _index.md         # 诗集元数据
│       ├── 汗血马 李瑜 QWEN校对20260203.md
│       ├── 啊-中亚细亚新大陆/
│       │   ├── _index.md     # 章节列表
│       │   ├── 那辉煌箭矢一定还在飞驰.md
│       │   └── ...           # 其他96首诗歌页面
│       ├── 祁连山下已经沉寂/
│       ├── ...               # 其他20个章节
│       └── 西域父老谁不识君/
├── templates/                 # Zola 模板文件
│   ├── index.html            # 首页模板
│   ├── section.html          # 目录/章节页面模板
│   ├── page.html             # 具体内容页面模板
│   └── ...                   # 其他页面模板
├── static/                   # 静态资源
│   ├── css/                  # 样式表
│   ├── images/               # 图片
│   │   ├── covers/          # 书籍封面目录 (需添加图片)
│   │   │   ├── 1980/
│   │   │   └── 1995hanxuema/
│   │   └── ...              # 其他图片
│   └── js/                   # JavaScript 文件
├── helpers/                  # 构建辅助脚本
├── lukethecat.github.io/      # 独立的 git 仓库 (可能已移动)
└── generate_poetry_pages.py  # 诗歌页面生成脚本
```

---

## 技术栈

### 核心技术
- **Zola**: 静态网站生成器 (版本: 最新稳定版)
- **Rust/Zola**: 生成静态 HTML 文件
- **GitHub Pages**: 日常开发环境托管
- **Cloudflare Pages**: 生产环境部署 (通过 CI/CD)
- **TinySearch**: 诗歌搜索索引生成器 (浏览器端搜索)

### 构建工具
- `gh-stats`: GitHub 统计收集工具
- `wasm-pack`: WebAssembly 捆绑工具 (用于 tinysearch)
- `ImageMagick`: 图片处理工具
- `Make`: 构建自动化

### 版本控制
- Git (多仓库结构: 初级仓库 + 子仓库/镜像)
- GitHub Actions - 自动化部署 (每周一次 + 代码推送时)

---

## 依赖管理

### 1. 安装 Zola (Mac OS/Linux)

```bash
# 方法1: 使用 brew (推荐)
brew install zola

# 方法2: 从 GitHub 下载最新版本
curl -L https://github.com/getzola/zola/releases/download/v0.19.2/zola-v0.19.2-x86_64-apple-darwin.tar.gz | tar xz
sudo mv zola /usr/local/bin/zola

# 验证安装
zola --version
```

### 2. 安装其他依赖

```bash
# 安装 ImageMagick (如果没有)
brew install imagemagick

# 安装 Rust (为 tinysearch 准备)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 wasm-pack
cargo install wasm-pack

# 安装 gh-stats (如果需要)
npm install -g gh-stats
```

### 3. 验证安装

```bash
# 检查所有依赖
zola --version
magick --version  # 或 convert --version
git --version
rustc --version
```

---

## 本地开发

### 1. 启动开发服务器

```bash
# 进入项目根目录
cd /path/to/liyupoerty.com-master

# 启动 Zola 开发服务器 (热重载)
zola serve

# 或者使用 Make 命令
make dev

# 输出: 
# Listening for changes in /path/to/liyupoerty.com-master/{config.toml, content, static, templates}
# Web server is available at http://127.0.0.1:11000
```

### 2. 构建生产版本

```bash
# 构建静态网站到 public/ 目录
zola build

# 或使用 Make (包含优化步骤)
make build

# 构建流程包括:
# 1. stars → 2. content → 3. index → 4. minify
```

### 3. 测试其他功能

#### 启动 TinySearch 服务
```bash
make search  # 启动本地搜索服务器
```

#### 生成 GitHub 统计
```bash
make stats  # 更新 GitHub 仓库统计信息
```

---

## 内容管理

### 1. 诗歌内容结构

每首诗歌是一个独立的 Markdown 文件，格式如下：

```markdown
+++
title = "诗歌标题"
date = 1995-01-01  # 使用代码或日期
weight = 1         # 排序权重
insert_anchor_links = "left"

[taxonomies]
tags = ["诗歌", "汗血马", "中亚", "李瑜"]
categories = ["汗血马"]

[extra]
author = "李瑜"
year = 1995
chapter = "啊，中亚细亚新大陆"
poem_index = 1
source_book = "汗血马"
++++

# 诗歌标题

**篇章** · 啊，中亚细亚新大陆 | **作者**: 李瑜 | **出版年份**: 1995

---

## 诗歌内容

<p style="font-size: 1.1em; line-height: 1.8em; margin: 1.5em 0;">
那辉煌箭矢一定还在飞驰
<br>
<br>
投射到辽远西方
</p>

---

## 元数据

- **收录于**: [汗血马](../../../)
- **篇章**: [啊，中亚细亚新大陆](../)
- **本篇章第**: 1/5 首
- **诗人**: 李瑜
- **出版年份**: 1995

---

<div class="poem-navigation">
  <a href="../">← 返回本篇章</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="../../../">← 返回《汗血马》</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="/archive">← 书籍列表</a>
  <span style="margin: 0 1rem;">|</span>
  <a href="/">←→ 返回首页</a>
</div>
```

### 2. 章节目录结构

每个章节的核心是 `_index.md` 文件（Zola 强制要求，忽视此需求会报错）：

```markdown
+++
title = "啊，中亚细亚新大陆"
date = 1995-01-01
weight = 1
sort_by = "weight"
insert_anchor_links = "left"
transparent = true

[taxonomies]
tags = ["poetry", "chapter", "汗血马", "李瑜"]

[extra]
chapter_name = 啊，中亚细亚新大陆
poem_count = 5
book_name = 汗血马
book_year = 1995
++++

# 啊，中亚细亚新大陆

**篇章** | **诗歌数量**: 5

---

## 本篇章诗歌列表

1. [那辉煌箭矢一定还在飞驰](那辉煌箭矢一定还在飞驰/)
2. [紧攥的手儿缓缓松开了](紧攥的手儿缓缓松开了/)
3. [大月氏呀](大月氏呀/)
4. [沐浴在白日渴望](沐浴在白日渴望/)
5. [丝绸之路的开拓者在马背上笑了](丝绸之路的开拓者在马背上笑了/)
```

### 3. 诗集元数据

诗集的 `_index.md` 文件：

```markdown
+++
title = "汗血马"
date = 1995-01-01
sort_by = "weight"
insert_anchor_links = "left"
transparent = true

[taxonomies]
tags = ["poetry", "book", "汗血马", "李瑜"]

[extra]
author = "李瑜"
publication_year = 1995
description = "《汗血马》是诗人李瑜于1995年出版的诗集，展现了西域风情与深沉的诗意。"
book_info = """
- **书名**: 汗血马
- **作者**: 李瑜
- **出版年份**: 1995
- **类型**: 诗集
"""
++++
```

### 4. 添加书籍封面

```bash
# 创建目录结构
mkdir -p static/images/covers/1995hanxuema

# 添加封面图片 (建议尺寸: 400x600px)
cp your-book-cover.jpg static/images/covers/1995hanxuema/cover.jpg

# 模板会自动放大使用: /images/covers/1995hanxuema/cover.jpg
```

### 5. 使用生成脚本批量创建内容

当需要为新诗集创建 101+ 首诗歌页面时：

```bash
# 确保源文件存在
# 内容: content/1995hanxuema/汗血马 李瑜 QWEN校对20260203.md

# 运行生成脚本
python3 generate_poetry_pages.py

# 自动创建:
# 1. 21个章节目录的 _index.md
# 2. 101首诗歌的独立页面
# 3. 书籍封面目录
```

**注意事项**:
- 修改 `generate_poetry_pages.py` 中的 `CHAPTERS` 数组来适配新诗集
- 脚本会跳过已存在的文件
- 诗歌内容需要后续手动填充或脚本增强版添加

---

## 构建流程

### 1. 手动构建 (开发/测试)

```bash
cd /path/to/liyupoerty.com-master

# 完整构建流程
make build
```

**Makefile 内容解析**:

```makefile
# .github/workflows/ci.yml 中的构建命令串

make build:
	# 第1步: 生成星图统计
	gh-stats
        
	# 第2步: 构建 Zola 网站
	zola build
        
	# 第3步: 生成搜索索引
	( cd public && tinysearch --optimize --index ../search-index.json --lang zh-CN --title "诗歌搜索" --description "剑仙诗歌搜索引擎" . )
        
	# 第4步: 构建 Wasm 模块
	cd search-js && wasm-pack build --release --target web --out-dir ../wasm
        
	# 第5步: 更新搜索索引
	rust-script helpers/build-search-index.rs
        
	# 第6步: 将 Wasm 拷贝到 static
	cp -r wasm public/static/wasm
```

### 2. 自动化 CI/CD

`.github/workflows/ci.yml` 配置:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
  schedule:
    - cron: '0 0 1 * *'  # 每月1号运行
  workflow_dispatch:      # 手动触发

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        
      - name: Install Zola
        run: |
          curl -L https://github.com/getzola/zola/releases/download/v0.19.2/zola-v0.19.2-x86_64-unknown-linux-gnu.tar.gz | tar xz
          sudo mv zola /usr/local/bin/zola
          
      - name: Install wasm-pack
        run: cargo install wasm-pack
          
      - name: Build
        run: make build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: endler-dev
          directory: ./public
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**触发条件**:
- ❖ `master` 分支推送  
- ❖ 创建 Pull Request 到 `master`  
- ❖ 每月 1 日 00:00 (UTC)
- ❖ 手动触发 (Actions → Build and Deploy → Run workflow)

---

## 部署执行

### 1. 本地测试 (-/- 指令格式)

```bash
# 进入项目根目录
cd /path/to/liyupoerty.com-master

# 构建网站
make build

# 测试构建结果
open public/index.html  # 在浏览器中打开
```

### 2. 提交并推送代码

```bash
# 检查改动
git status

# 添加所有修改
git add .

# 提交
git commit -m "Add 汗血马 poetry pages (101 poems across 21 chapters)"

# 推送到 GitHub
git push origin master
```

### 3. 监控部署状态

**查看 GitHub Actions**:
- 访问: https://github.com/lukethecat/lukethecat.github.io/actions
- 点击 "Build and Deploy" 工作流
- 查看构建日志 (Zola 构建、tinysearch 生成、Wasm 构建)

**查看 Cloudflare Pages**:
- 登录: https://dash.cloudflare.com/
- 进入 "Pages" → "endler-dev"
- 查看部署状态、历史记录、错误日志

### 4. 验证生产环境

```bash
# 检查网站是否正常
curl -I https://liyupoerty.com

# 查看页面响应 (应返回 200 OK)
# 检查关键页面:
# - https://liyupoerty.com/
# - https://liyupoerty.com/archive
# - https://liyupoerty.com/1995hanxuema/
# - https://liyupoerty.com/1995hanxuema/啊-中亚细亚新大陆/
```

---

## 故障排查

### 1. Zola 构建失败

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| `Error: Content file not found _index.md` | 章节缺少 `_index.md` 文件 | 确保每个章节目录内有 `_index.md` |
| `Error: Front matter parsing error` | Markdown 文件的 `+++` 内部格式错误 | 检查 `[extra]`、`[taxonomies]` 格式 |
| `Error: Invalid date` | `date` 格式不符合 YYYY-MM-DD | 确保日期格式: `1995-01-01` |
| `Error: Section already exists` | 章节名称重复 | 重命名文件夹避免重复 |

### 2. 部署后找不到页面

**情况**: GitHub Actions 状态 ✅ 但页面 404  
**原因**: Cloudflare Pages 可能缓存未清除  
**解决**:
1. 访问 Cloudflare Dash → Pages → endler-dev → Workers & Pages
2. 点击 "Deployments"，找到最新部署
3. 点击 "Force Delete" 或 "Purge Cache"
4. 更新浏览器缓存: `Cmd+Shift+R` (强制刷新)

### 3. 图片加载失败

**症状**: 诗歌封面图片或书籍封面显示为 broken image
**检查**:
```bash
# 检查图片路径是否正确
ls -la static/images/covers/1995hanxuema/
# 应有文件: cover.jpg (或其他图片文件)

# 检查构建后 public 目录
ls -la public/images/covers/1995hanxuema/
```

### 4. 搜索功能失效

**常见原因**: TinySearch 构建失败或 Wasm 文件缺失
**检查**:
```bash
# 查看 public/static/wasm 目录是否存在
ls public/static/wasm/

# 应有文件:
# - tinysearch-engine.wasm
# - 或 search-index.json
```

**修复步骤**:
```bash
# 重新运行搜索索引构建
cd /path/to/liyupoerty.com-master
cargo install wasm-pack
make search
```

### 5. Make 命令失败

**检查命令列表**:
```bash
make -n build  # 查看将要执行的命令而不实际执行
```

**手动执行每个步骤**:
```bash
# 逐个测试每个构建步骤
gh-stats                          # 生成统计
zola build                        # 生成网站
( cd public && tinysearch --optimize --index ../search-index.json --lang zh-CN . )  # 生成搜索
cargo build-wasm                  # 构造 Wasm
```

---

## 功能扩展

### 1. 添加新诗集

**模板**: 使用 `generate_poetry_pages.py` 作为基础

```python
# 修改诗集配置
CHAPTERS = [
    {"name": "新诗集题目", "display_name": "新诗集", "poem_count": 20, "poem_titles": [...]},
    ...
]

# 修改目录和文件名
BOOK_DIR = "content/1999newbook"
BOOK_NAME = "新诗集名"
```

**再运行**:
```bash
python3 generate_poetry_pages.py
```

### 2. 添加音频朗读

在诗歌页面增加音频支持:

```markdown
+++ # 在 front matter
[extra]
audio_file = "1995hanxuema/那辉煌箭矢一定还在飞驰.mp3"
++++

# 音频播放器 (在诗歌正文前添加)
<div class="audio-player">
  <audio controls>
    <source src="/audio/1995hanxuema/那辉煌箭矢一定还在飞驰.mp3" type="audio/mpeg">
    您的浏览器不支持音频播放
  </audio>
</div>
```

将音频文件放入 `static/audio/` 目录。

### 3. 添加封面图片展示

创建图片路径逻辑:

```
static/images/covers/ 年份/
├── cover.jpg       # 主封面 (400x600px, JPEF/PNG)
├── thumbnail.jpg   # 缩略图 (200x300px)
└── author.jpg      # 作者照片
```

在模板中自动引用: `{{ section.permalink ~ "/images/covers/" ~ section.extra.year ~ "/cover.jpg" }}`

### 4. 实现高级搜索

启用高级搜索功能：

```bash
# 安装更多搜索工具
cargo install tantivy-cli

# 创建高级索引
tantivy new --index-dir search_index --schema schema.toml
```

**schema.toml 配置**:
```toml
[[fields]]
name = "title"
type = "text"
tokenizer = "simple"

[[fields]]
name = "content"
type = "text"
tokenizer = "default"  # 使用中文分词
```

---

## 维护检查清单

### 日常维护 (每周一次)

- [ ] `git pull origin master` 拉取最新代码
- [ ] `zola serve` 检查本地运行正常
- [ ] `make build` 测试构建过程
- [ ] 检查 Cloudflare Pages 最新部署状态
- [ ] 验证主页、归档、单诗集页面加载
- [ ] 搜索功能测试

### 每月维护

- [ ] 检查 GitHub Actions 构建日志
- [ ] 删除 3 个月前的旧构建 (Actions)
- [ ] 检查 Cloudflare Pages 使用量
- [ ] 清理 public/ 目录 (如果本地构建占用空间)
- [ ] 更新 README.md

### 内容维护 (每次更新后)

```
更新流程:
1. 修改/添加诗歌内容
2. 运行: python3 generate_poetry_pages.py (如果有新书集)
3. 运行: make build 构建网站
4. 检查: open public/index.html
5. 更新: README.md
6. 更新: website-maintenance-manual.md
7. 提交: git add . && git commit
8. 推送: git push origin master
9. 监控: Actions 页面等待完成
10. 验证: 打开 https://liyupoerty.com
```

### 故障发生时的检查步骤

1. **立即检查**: `git status` (是否有未提交修改)
2. **查看日志**: GitHub Actions → Workflow → 最新运行 → "View edited workflows"
3. **测试错**: `zola build --verbose` 查看详细错误
4. **人工退**: 检查 Cloudflare Pages 部署历史，回退到上一个成功版本
5. **写报告**: 记录错误信息到 issue 或查询手册

---

## 重要文件说明

### 1. README.md (必须同步更新)

```markdown
# 剑仙诗歌网站

这包含了诗人李瑜的全部诗集，使用 Zola 构建。

## 当前内容
- **1980**: 早期诗歌 (作者: 李瑜)
- **1995汗血马**: 汗血马诗集 (作者: 李瑜, 101首诗歌, 21章节)

## 部署
- 开发: GitHub Pages (https://lukethecat.sh)
- 生产: Cloudflare Pages (https://liyupoerty.com)

更新流程: ./website-maintenance-manual.md
```

### 2. website-maintenance-manual.md (本文件)

- **职责**: 维护所有 LLM/开发者查看此文件时的上下文
- **位置**: 仓库根目录
- **要求**: **每次更新内容后** 必须更新版本号和日期

```markdown
## 版本历史
- v1.0: 2026-02-04 初始版本 (完成 汗血马 101 首诗歌)
- v1.1: 2026-02-05 添加音频功能说明
```

### 3. config.toml (Zola 配置)

**重要参数**:
```toml
base_url = "https://liyupoerty.com"  # 生产环境
language = "zh"
```

**测试时修改**:
```toml
base_url = "http://127.0.0.1:11000"  # 本地开发
```

---

## 附录: 常用命令速查

```bash
# 构建
make build                          # 完整构建
zola build                          # 仅生成网站
zola serve                          # 启动开发服务器

# 搜索
make search                         # 重建搜索索引
cargo install wasm-pack             # 安装 wasm 工具

# Git 操作
git status                          # 查看状态
git log --oneline -5                # 查看最近提交
git diff --name-only HEAD~1..HEAD   # 查看上次改动的文件

# 清理
rm -rf public/                      # 清除构建缓存
```

---

## 更新记录 (Changelog)

### v1.2 - 2026-02-04
- **内容完善**: 完成《汗血马》诗集全部内容 (101首诗歌跨21章节)
- **结构优化**: 所有章节和诗歌页面使用统一导航模板
- **封面支持**: 添加书籍封面目录结构: `static/images/covers/1980/` 和 `static/images/covers/1995hanxuema/`
- **工具更新**: 提供批量生成脚本 `generate_poetry_pages.py`
- **手册完善**: 更新维护手册和技术文档
- **README**: 同步更新项目概览、技术栈和部署流程

### v1.1 - 2026-02-03
- **新增诗歌**: 补充《汗血马》诗集初始章节内容
- **导航系统**: 增加面包屑导航和分页功能
- **技术优化**: 优化 Zola 模板逻辑

### v1.0 - 初始版本
- **网站雏形**: 基于 Zola 构建基础框架
- **1980诗集**: 初期克莱尔作品整理
- **基础部署**: GitHub Actions 到 Cloudflare Pages
```

准备就绪！已创建包含完整中文的维护手册。