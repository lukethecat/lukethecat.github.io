# 剑仙诗歌网站 - 快速指南

> 📌 **维护者必读** - 首次维护请通读全文，后续可快速查阅

---

## 一、核心速查表

### 常用命令

```bash
# 🚀 启动开发服务器
zola serve

# 🔨 完整构建
make build

# 📦 提交代码
git add .
git commit -m "你的修改说明"
git push origin master

# 📊 查看最近提交
git log --oneline -5
```

### 路径速查

| 路径 | 用途 |
|------|------|
| `/content/` | 网站内容 (Zola 文档) |
| `/content/1995hanxuema/` | 《汗血马》诗集 (101首诗歌) |
| `/static/images/covers/` | 书籍封面存放位置 |
| `/website-maintenance-manual.md` | 完整维护手册 |
| `/DELIVERY-s.md` | 交付汇总报告 |

---

## 二、自动化生成诗歌页面

### 场景：添加新诗集

**步骤 1：准备源文件**
```bash
# 确保源文件存在
# 示例: content/新诗集名/新诗集名 李瑜 QWEN校对20260203.md
```

**步骤 2：编辑生成脚本**
```bash
# 修改 generate_poetry_pages.py
# 1. 规定 CHAPTERS 数组
# 2. 规定 BOOK_DIR 目录
# 3. 规定 BOOK_NAME 书名
```

**步骤 3：运行脚本**
```bash
python3 generate_poetry_pages.py
```

**步骤 4：验证结果**
```bash
# 检查生成的文件
ls -la content/新诗集名/ | wc -l
# 应该 > 22 (1个_index.md + 21个章节目录)
```

### 脚本自动生成的内容

✅ **21个章节目录**  
✅ **101首诗歌独立页面**  
✅ **书籍封面目录结构**  
✅ **所有NAVIGATION模板**
---

## 三、添加/更新书籍封面

### 存放位置

```
static/images/covers/
├── 1980/
│   ├── cover.jpg        # 建议 400x600px
│   └── thumbnail.jpg    # 建议 200x300px
└── 1995hanxuema/
    ├── cover.jpg
    └── thumbnail.jpg
```

### 快速操作

```bash
# 1. 导航到封面目录
cd static/images/covers/

# 2. 为《汗血马》放置封面 (示例)
# 将封面图片命名为 cover.jpg 放入
# cp /path/to/book-cover.jpg 1995hanxuema/cover.jpg

# 3. 测试页面
zola serve
# 访问: https://localhost:11000/1995hanxuema/
```

### 浏览器访问
- **本地**: `http://127.0.0.1:11000/images/covers/1995hanxuema/cover.jpg`
- **生产**: `https://liyupoerty.com/images/covers/1995hanxuema/cover.jpg`

---

## 四、完整更新流程

### 📋 检查清单 (每次更新必须执行)

**第 1 步：准备**
- [ ] `git pull origin master` 拉取最新代码
- [ ] `zola serve` 测试本地运行正常

**第 2 步：内容更新**
- [ ] 新建/修改诗歌内容 (内容在 `content/`)
- [ ] 如果是新诗集，运行 `python3 generate_poetry_pages.py`
- [ ] `make build` 构建，无报错
- [ ] 本地测试，所有链接点击正常

**第 3 步：文档更新 ⚠️ 必须**
- [ ] 更新 `README.md`
  - 新增诗歌总数更新
  - 检查技术栈描述
- [ ] 更新 `website-maintenance-manual.md`
  - 定位到 `## 更新记录`
  - 添加新版本: `### vX.Y - 2026-02-XX`
  - 写明修改内容
- [ ] 更新 `DELIVERY-s.md`
  - 更新交付日期
  - 更新完成情况

**第 4 步：提交推送**
- [ ] `git status` 检查改动
- [ ] `git add .`
- [ ] `git commit -m "[提交说明，例如: 汗血马诗集补全]" `
- [ ] `git push origin master`

**第 5 步：监控部署**
- [ ] 打开: https://github.com/lukethecat/lukethecat.github.io/actions
- [ ] 查看 Actions → "Build and Deploy"
- [ ] 等待完成 (绿色✅)

**第 6 步：验证生产**
- [ ] 访问: https://liyupoerty.com
- [ ] 测试 21 个章节导航
- [ ] 测试 101 首诗歌页面
- [ ] 测试搜索功能 (如果有)

---

## 五、用户微信按速查

### 首次配置

```bash
# 1. 安装 Zola
brew install zola

# 2. 验证
zola --version

# 3. 启动开发服务器
cd /Users/jellyfishjaco/Documents/Git\|Repo/liyupoerty.com-master
zola serve
```

### 内容生成与构建

```bash
# 如果有新诗集需要生成
python3 generate_poetry_pages.py

# 构建生产版本
make build
```

### 提交与部署

```bash
git add .
git commit -m "补全汗血马诗集101首诗歌页面"
git push origin master

# 然后访问 Actions 查看部署状态
```

---

## 六、故障排查 (快速版)

### ❌ 构建失败
```bash
zola build --verbose  # 查看详细错误
```

### ❌ 页面404
```bash
# 检查章节目录是否正确
ls content/1995hanxuema/ | grep _index

# 或重新生成
python3 generate_poetry_pages.py
```

### ❌ 图片不显示
```bash
# 检查封面目录
ls -la static/images/covers/1995hanxuema/

# 检查构建后的目录
ls -la public/images/covers/1995hanxuema/
```

### ❌ 搜索功能失效
```bash
# 重建搜索索引
make search
```

---

## 七、v1.2 新增功能 (2026-02-04)

### 🆕 书籍封面支持

**位置**: `static/images/covers/年份/`

**特性**:
- 模板自动引用封面图片
- 支持主封面 (cover.jpg)
- 支持缩略图 (thumbnail.jpg)

### 🆕 批量生成工具

**脚本**: `generate_poetry_pages.py`

**输出**:
- 章节索引 `content/1995hanxuema/章节名/_index.md` (21个)
- 诗歌页面 `content/1995hanxuema/章节名/诗歌名.md` (101个)

**使用**: `python3 generate_poetry_pages.py`

### 🆕 完整文档

**维护手册**: `website-maintenance-manual.md`
- 775行完整指南
- LLM/开发者友好
- 包含所有故障排查步骤

---

## 八、重要提醒

### ⚠️ 必须遵守

1. **每次更新后**必须同步更新3个文档:
   - `README.md`
   - `website-maintenance-manual.md`
   - `DELIVERY-s.md`

2. **版权要求**:
   - 封面图片必须有授权
   - 诗歌内容为李瑜原创

3. **部署要求**:
   - 通过 GitHub Actions 自动部署
   - 生产环境: Cloudflare Pages
   - 每月 1 日自动部署

### 🔗 相关链接

- **生产环境**: https://liyupoerty.com
- **GitHub**: https://github.com/lukethecat/lukethecat.github.io
- **Actions**: https://github.com/lukethecat/lukethecat.github.io/actions
- **Cloudflare**: https://dash.cloudflare.com/

---

## 九、完整命令示例

```bash
# 查看当前改动
git status

# 生成新诗集 (如果有)
python3 generate_poetry_pages.py

# 构建测试
make build

# 开发服务器
zola serve

# 提交并推送
git add .
git commit -m "补全汗血马全篇 (101首/21章)"
git push origin master

# 验证部署
# 访问: https://github.com/lukethecat/lukethecat.github.io/actions
```

---

## 十、维护承诺

> **每次更新结束前，请确认:**
- ✅ README.md 已更新
- ✅ website-maintenance-manual.md 已更新版本记录
- ✅ 本地构建测试通过
- ✅ 提交信息清晰明了

**如果你是 LLM，请:**
1. 阅读 `website-maintenance-manual.md` 获取完整上下文
2. 按照本指南步骤操作
3. 更新所有相关文档
4. 在提交信息中注明版本号和变动

---

*快速指南版本: v1.0*  
*最后更新: 2026-02-04*  
*维护工具: generate_poetry_pages.py*