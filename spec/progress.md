# Progress Tracker

## 当前状态 (2026-04-07)

**版本**: v146（Standardized Essay Citations & References）  
**分支**: main

---

## Completed

### 项目整备 (2026-04-03)
- [x] 从 GitHub 拉取 56 个 OpenClaw 维护提交（`git pull origin main`）
- [x] `npm install` — 依赖已同步
- [x] `npm run process:books` — 4本诗集重新生成成功
- [x] `npm run test:data` — 回归测试通过（4本，372首诗）
- [x] 修复 `scripts/verify-data.ts` 中模板字符串转义 bug（`\${}` → `${}`）
- [x] 安全升级 (2026-04-07):
    - [x] 升级 Next.js 至 v15.5.14 (解决 4 个高危漏洞)
    - [x] 升级 React 至 v19.0.0
    - [x] 解决 npm cache 权限问题 (使用 /tmp/npm_cache 绕过)
    - [x] 修复 robots.txt/sitemap.xml 静态导出兼容性
- [x] 文章排版优化 (2026-04-07):
    - [x] 统一文章内诗歌引用风格 (Blockquote 标准化)
    - [x] 格式化参考文献列表 (增加条目间距)
    - [x] 涵盖 60years, Xia Guanzhou, Gudao, Zhang Xiaoping 等研究性文章

### 已完成功能（来自 OpenClaw 维护记录）
- [x] 暗色模式 + 设计令牌系统（`ThemeProvider.tsx` / `ThemeToggle.tsx`）
- [x] Footer 动态读取 Git 提交信息
- [x] 黑罂粟上卷注释从 37 条增至 92 条
- [x] 四本诗集批量校对 43 处错别字
- [x] 新增文章：孤岛（1994/2024）、田先瑶、夏冠洲、张小平（1988）
- [x] 张秋格《新边塞诗研究》完整 SOP
- [x] 图片查看器页面（`view/[imageId]/page.tsx`）
- [x] Essays 页面 `##` 标题渲染修复
- [x] Cloudflare 构建 Git 历史深度修复
- [x] 安全清理（memory 目录、安全文档未推送到公开仓库）
- [x] GR-6 Git 安全规则新增

### 历史完成（来自 Antigravity 维护记录）
- [x] 黑罂粟·下卷入库（101首）
- [x] 标准化书籍注释工作流（`/book-ingestion`）
- [x] 回归测试框架（`verify-data.ts`）
- [x] 独立研究文章处理（essays）
- [x] 多语言注释（英/德/阿/维）

---

## In Progress

- [ ] 无

---

## Planned

- [x] 如有必要，升级 npm 至 v11.12.1（由于 /opt/homebrew 权限限制，核心升级已通过依赖更新完成）
- [x] 解决 33 个依赖安全漏洞（已清理，当前 npm audit 为 0 漏洞）
- [ ] 继续新书入库（如有新书）
