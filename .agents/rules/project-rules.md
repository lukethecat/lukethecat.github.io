# Liyupoetry Project Rules (Essential)

> 🦐 **Agent 读取此文件后，必须在首次回复中声明："已加载项目规范。遵守全部规则。"**

## 📍 从这里开始

1. **每次操作前** → 读 `docs/golden-rules.md`（5条不可违反的规则）
2. **改内容时** → 读 `.agents/workflows/website-update-sop.md`（7步流程）
3. **不确定时** → 读 `docs/INDEX.md`（文档索引）

## 黄金规则速览

| # | 规则 | 详情 |
|---|------|------|
| GR-1 | JSON 禁用 ASCII 引号包裹中文 | `「」` 而非 `""` |
| GR-2 | commit 前更新版本号 | 3 个文件同步改 |
| GR-3 | 源文件在 books/ | 不手动改生成 JSON |
| GR-4 | 提交前跑构建验证 | `process:books && test:data && build` |
| GR-5 | 推送前 Chrome 自测 | 验证线上页面 |

## 完整规则

详见 `docs/` 目录：
- [architecture.md](../docs/architecture.md) — 项目结构
- [content-pipeline.md](../docs/content-pipeline.md) — 内容处理
- [deployment.md](../docs/deployment.md) — 部署链路
- [style-guide.md](../docs/style-guide.md) — 排版规范

## 旧规则（保留参考）

以下规则已整合到 `docs/` 目录中，此处不再重复：
- 原典不可变 → `golden-rules.md` GR-3
- 谷歌翻译适配 → `style-guide.md`
- 注释四维标准 → `.agents/skills/annotate-poem/SKILL.md`
- 版本心跳 → `golden-rules.md` GR-2
- 自动化构建 → `website-update-sop.md`
