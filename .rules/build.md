# poet-archive 项目规则

_操作前必读。项目特定的规则、教训和最佳实践。_

## 构建与部署

### Cloudflare Pages
- **fetch-depth: 0**：GitHub Actions checkout 必须添加 `fetch-depth: 0`，否则 `git rev-list --count HEAD` 返回 1
- **原因**：Cloudflare 默认只拉取最新代码，没有完整 Git 历史
- **验证**：本地构建显示 197，线上应相同

### Footer Git 信息
- 读取方式：`next.config.mjs` 中通过 `child_process` 获取
- 需要完整 Git 历史才能正确显示提交次数和日期
- 构建后检查 `out/index.html` 中的 `最后更新` 和 `提交次数`

## 内容格式

### Essays Frontmatter
```yaml
---
title: "文章标题"
author: "作者"
date: "YYYY-MM" 或 "YYYY-MM-DD"
publication: "出处"  # 可选
sourceLink: ""      # 可选
tags: [标签1, 标签2] # 可选
---
```

### Markdown 标题
- `# 标题` → h2（一级标题）
- `## 标题` → h3（二级标题）
- `### 标题` → h4（三级标题）
- **注意**：渲染函数区分 `#` 和 `##`，不要遗漏

## 常见错误

### 文件操作
- ❌ `rm -rf essay*` 会误删 `essays/` 目录
- ❌ `.gitignore` 中 `essay*/` 同理
- ✅ 使用精确路径或 `find` 确认后再删除

### 内容验证
- ❌ 不要编造文章内容
- ✅ 只用用户提供的真实 OCR 或文档
- ✅ 推送前必须给用户确认

## 工具使用
- **B站链接** → 用 API 抓，不用 web_fetch（会 412）
- **OCR** → MiMo Omni (xiaomi/mimo-v2-omni via OpenRouter)

## CI/CD 检查清单
- [ ] `fetch-depth: 0` 已添加
- [ ] 构建后 footer 显示正确的 Git 信息
- [ ] 所有 essays 页面能正常访问（无 404）
- [ ] Markdown 标题正确渲染
