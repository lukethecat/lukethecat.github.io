# 网站更新 SOP (Standard Operating Procedure)

> 每次对 poet-archive 项目进行内容或代码修改时，必须严格遵循此流程。

## 完整流程（按顺序执行）

### 1. 修改前
- [ ] 读取 `.agents/rules/project-rules.md`
- [ ] 读取 `.agents/workflows/regression-test.md`
- [ ] 确认修改类型（内容/代码/配置）

### 2. 内容修改
- [ ] 书籍内容：只改 `books/[bookId]/source.md`（规则 1）
- [ ] 文章内容：改 `books/essayN/source.md` 或 `src/content/essays/*.md`
- [ ] 首页列表：改 `src/content/works.json`
- [ ] **JSON 文件中禁止使用 ASCII 双引号 `"` 包裹中文词组，必须用 `「」`**（规则 4）
- [ ] 修改后验证 JSON：`python3 -c "import json; json.load(open('FILE'))"`

### 3. 构建验证
```bash
cd /path/to/project
node scripts/lint-check.mjs      # 黄金规则检查
npm run process:books    # 处理书籍数据
npm run test:data        # 数据校验
npm run build            # Next.js 构建
```
全部通过才能继续。

### 4. 自测 (Dogfooding)
- [ ] 用 Chrome CDP 打开本地或预览页面
- [ ] 验证：页面标题、内容长度、关键链接
- [ ] 确认无误后才能告诉用户

### 5. 版本心跳（规则 7）
- [ ] 更新版本号（递增）和日期
- [ ] 同步修改以下文件：
  - `src/components/Sidebar.tsx`
  - `src/app/page.tsx`
  - `src/app/essays/[essayId]/page.tsx`

### 6. 提交推送
```bash
git add -A
git commit -m "type(scope): 描述"
git push origin main
```

### 7. 部署验证
- [ ] 等 GitHub Actions 完成（`gh run list --limit 1`）
- [ ] 用 Chrome 打开线上页面验证内容
- [ ] 确认首页、文章页、书籍页都正常
- [ ] 报告用户"已完成"并给出验证结果

## 常见陷阱

1. **JSON 内嵌引号**：中文引号如 "新边塞诗" 在 JSON 中必须写成 「新边塞诗」
2. **版本号**：每次 commit 前必须更新，否则部署版本和代码对不上
3. **Cloudflare 缓存**：部署后可能有缓存延迟，用 Chrome 验证时用 GitHub Pages 地址更可靠
4. **process:books**：修改 books/ 内容后必须运行，否则 book.json 不更新
