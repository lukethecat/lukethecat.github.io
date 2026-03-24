# 黄金原则 (Golden Rules)

> 不可违反的硬规则。违反任何一条都必须立即修复。

## GR-1: JSON 安全
JSON 文件中**禁止**使用 ASCII 双引号 `"` 包裹中文词组。必须使用 `「」` 替代。

```json
// ❌ 错误
"description": "流派"新边塞诗"的发展"

// ✅ 正确
"description": "流派「新边塞诗」的发展"
```

**验证命令**: `python3 -c "import json; json.load(open('FILE'))"`

## GR-2: 版本心跳
每次 `git commit` 前，必须更新以下三处的版本号和日期：
- `src/components/Sidebar.tsx`
- `src/app/page.tsx`
- `src/app/essays/[essayId]/page.tsx`

格式：`最后更新: YYYY-MM-DD | 地点: 北京 | 部署版本: N`

## GR-3: 源文件不可变
`books/*/source.md` 是唯一真理源。禁止手动修改 `src/content/*/book.json`。

## GR-4: 构建前验证
修改内容后，提交前必须运行：
```bash
npm run process:books && npm run test:data && npm run build
```

## GR-5: 自测确认
推送给用户前，必须用 Chrome CDP 验证线上页面。

## GR-6: Git 安全
- `git add -A` 前必须 `git status` 检查变更范围
- `.gitignore` 中禁止使用通配符模式（如 `essay*/` 会误匹配 `essays/`）
- 删除文件前先确认影响范围
