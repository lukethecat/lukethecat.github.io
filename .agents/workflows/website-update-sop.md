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
python3 scripts/check_typeset.py # ★ 排版/结构校验门（task #16）：日期入正文/分节号/MD残留/半角标点/异常年份，命中即 FAIL
npm run test:data        # 数据校验
npm run build            # Next.js 构建
```
全部通过才能继续。

### 3b. 诗歌录入源格式规范（录入必守，避免排版错根因）
- **创作日期**：单独一行 `YYYY年M月` 或 `**YYYY年M月**`，置于诗末、`[pN]` 之前；解析器会收进 `composedDate` 并渲染为诗末署名行。
- **组诗分节**：用 `#### N`（不混用裸数字行）；节内诗句用 ``` 包裹。
- **副标题**：`　　　　xxx`（全角空格开头）。
- **页码**：`[pN]` 单独一行。
- **中文标点用全角**，禁止半角 `.,()!?:;` 邻接中文；行首勿留 `.``..``-` 等 OCR 伪影。
- 遇可疑年份（如 `108x`、`18xx`）**回源核**，勿凭记忆改；无源则如实标注。

### 4. 自测 (Dogfooding) —— 必须以「网页最终渲染」为准（2026-10-14 铁律）
> ⚠️ **数据侧校验绿 ≠ 网页正确**。必须真看渲染结果，不能只看 book.json / 脚本输出。
- [ ] `npm run build` 后跑 **`python3 scripts/check_rendered.py`** —— 解析 `out/books/*.html` 最终渲染文本逐首审计（标题+正文：页码/省略号/MD残留/错别字），**必须 0 缺陷**
- [ ] 用 Chrome CDP 或直接 `curl` 拉**线上**页面，抽看若干首诗的**标题与正文实际显示**
- [ ] 重点看**标题**（上一轮漏检就出在标题：页码/错别字/多标题粘连）
- [ ] 确认无误后才能告诉用户

### 5. 版本心跳（规则 7）
- [ ] 更新版本号（递增）和日期
- [ ] 同步修改以下文件：
  - `src/components/Sidebar.tsx`
  - `src/app/page.tsx`
  - `src/app/essays/[essayId]/page.tsx`

### 6. 提交推送
```bash
git status                  # 检查变更范围（确认没有误删）
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
