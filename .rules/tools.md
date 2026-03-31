# poet-archive 项目工具指南

_操作前必读。项目使用的工具、API 和最佳实践。*

## Git 与部署

### GitHub
- 仓库：`lukethecat/lukethecat.github.io`
- 分支：`main`
- 部署：GitHub Pages + Cloudflare Pages（双部署）

### Cloudflare Pages
- 项目名：`liyupoetry`
- 构建命令：`npm run build`
- 输出目录：`./out`
- **重要**：`fetch-depth: 0`（见 build.md）

## 内容处理

### OCR
- **工具**：Whisper（本地）
- **模型**：small（默认）
- **语言**：zh（中文）
- **命令**：`whisper --model small --language zh --output_format txt --output_dir /tmp/ input.ogg`
- **备选**：MiMo Omni via OpenRouter（复杂场景）

### Markdown 处理
- **格式**：GitHub Flavored Markdown
- **标题**：`#` → h2，`##` → h3，`###` → h4
- **Frontmatter**：YAML 格式，必须包含 title、author、date

## 构建工具

### Next.js
- **版本**：14.1.0
- **配置**：`next.config.mjs`
- **构建**：`npm run build`
- **开发**：`npm run dev`

### TypeScript
- **配置**：`tsconfig.json`
- **检查**：`npm run lint`

### Tailwind CSS
- **配置**：`tailwind.config.ts`
- **PostCSS**：`postcss.config.js`

## 数据处理

### 书籍处理
- **脚本**：`scripts/process-books.ts`
- **运行**：`npm run process:books`
- **输入**：`src/content/books/`
- **输出**：静态 HTML

### 数据验证
- **脚本**：`scripts/verify-data.ts`
- **运行**：`npm run test:data`

## 外部 API

### OpenRouter
- **用途**：调用 AI 模型（MiMo Omni 等）
- **Key**：见 MEMORY.md
- **模型**：`xiaomi/mimo-v2-omni`

### 翻译
- **工具**：Google Translate
- **集成**：页面内嵌翻译组件

## 监控与调试

### 构建检查
```bash
# 本地构建
npm run build

# 检查输出
ls -la out/
cat out/index.html | grep "最后更新"
```

### 部署验证
```bash
# 检查网站状态
curl -I https://www.liyupoetry.com/

# 检查 Git 信息
curl -s https://www.liyupoetry.com/ | grep "提交次数"
```

## 常用命令

```bash
# 构建并部署
npm run build && git add -A && git commit -m "update" && git push

# 本地开发
npm run dev

# 处理书籍
npm run process:books

# 验证数据
npm run test:data
```

## 故障排查

### 构建失败
1. 检查 `npm run build` 输出
2. 查看 `out/` 目录是否生成
3. 检查 `next.config.mjs` 配置

### 部署问题
1. 检查 GitHub Actions 日志
2. 确认 `fetch-depth: 0`
3. 验证 Cloudflare 配置

### 内容问题
1. 检查 frontmatter 格式
2. 验证 Markdown 语法
3. 确认文件路径正确
