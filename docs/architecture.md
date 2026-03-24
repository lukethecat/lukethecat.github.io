# 项目架构 (Architecture)

## 技术栈
- **框架**: Next.js 14 (App Router, TypeScript, Static Export)
- **样式**: Tailwind CSS
- **部署**: GitHub Pages + Cloudflare Pages (双部署)

## 目录结构

```
├── books/                   # [源文件] 诗集和文章（唯一真理源）
│   ├── hanxuema1995/        # 诗集目录
│   │   └── source.md        # 诗集内容
│   ├── essay1/              # 文章目录
│   │   └── source.md        # 文章内容
│   └── ...
├── src/
│   ├── app/                 # Next.js 页面路由
│   │   ├── page.tsx         # 首页（读取 works.json）
│   │   ├── books/[bookId]/  # 诗集页面
│   │   └── essays/[essayId]/# 文章页面
│   ├── components/          # UI 组件
│   ├── content/             # [生成物] 构建输出
│   │   ├── works.json       # 首页数据（书籍+文章列表）
│   │   ├── [bookId]/        # 诗集 JSON
│   │   └── essays/          # 文章 Markdown
│   └── lib/                 # 工具函数
├── scripts/                 # 构建脚本
│   ├── process-books.ts     # books/ → src/content/ 转换
│   └── verify-data.ts       # 数据校验
├── docs/                    # 项目文档（本目录）
├── .agents/                 # Agent 规则和工作流
└── .github/workflows/       # CI/CD
```

## 数据流

```
books/*/source.md
       │
       ▼
scripts/process-books.ts
       │
       ▼
src/content/[bookId]/book.json  (诗集数据)
src/content/essays/*.md          (文章，直接复制)

src/content/works.json  ← 手动维护（首页列表）
```

## 关键文件

| 文件 | 用途 | 谁维护 |
|------|------|--------|
| `src/content/works.json` | 首页书籍+文章列表 | **手动** |
| `src/content/[bookId]/book.json` | 诗集解析数据 | **自动生成** |
| `src/content/essays/*.md` | 文章内容 | **手动** |
| `src/content/featured_poems.json` | 首页精选诗句 | **手动** |
