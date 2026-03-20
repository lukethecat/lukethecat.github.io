# Liyupoetry Project Rules (Essential)

## 1. 原典不可变与隔离原则 (Immutable Source)
- **唯一真理**：任何关于书籍内容的修改只能在 `books/[bookId]/source.md` 中进行，绝不可手动修改生成的 JSON。
- **出版信息隔离**：原著最后一首诗之后，若涉版权页、定价等出版信息或跋尾，必须以 `## 附记` 或 `## 出版信息` 物理隔离，防止混入正文。

## 2. 谷歌翻译组件适配与样式统一 (i18n UI Rule)
- 全站现已采用统一部署的 Google Translate 组件实现多语言。**不再需要手动对齐各语种翻译文本**。
- **CSS 与字体约束**：在进行任何 UI 与组件调整时，必须验证未破坏 Google Translate 挂件的布局（警惕 `.goog-te-banner-frame` 等注入元素挤占空间）。
- 确保即使在语种切换后，整站的诗歌排版、字重（需做好 Font-Family 多语种后备降级）、留白等核心视觉体验依然统一，不会发生版式塌陷。

## 3. 新书录入必备注释原则 (Mandatory Annotations)
- 项目具有深厚的历史、兵团及新疆地域属性，**任何新录入的书籍，必须配套生成注释数据**。
- 为保证解释的专业性与降维门槛，执行注释时必须调用并严格遵循内部指令：`.agents/skills/annotate-poem/SKILL.md` 的四维标准。由它产出标准化内容并写入 `annotations.json`。

## 4. 排版与校对精简准则
- 诗歌副标题统一使用全角空格 `　　` 缩进。
- 中文语境下（含 `annotations.json`），绝对杜绝半角标点。
- 必须尊重 `source.md` 里的物理空行，以此保证生成的 HTML 解析出正确的段落韵律断层。

## 5. 自动化构建动作 (Correction Flow)
- 修改 `source.md` 或新加注释后，只需执行：
  `npm exec -y tsx scripts/process-books.ts && npm run test:data`
- 确信无格式损坏报错后，再进行提交。

## 6. 核心开发与沟通规范 (Core Development & Communication)
- **沟通语言**：Agent 与项目成员间的所有沟通、报错分析、逻辑解释必须严格使用**中文（简体）**。
- **任务追踪**：重大需求或复杂功能必须拆解为 `/spec/0X_xxx.md` 的规范文件，并在 `spec/progress.md` 中追踪进度。
- **自测要求 (Dogfooding)**：在提供给用户 URL 或进行展示前，必须优先使用 `agent-browser` 工具完成内部自测打样。
- **代码质量**：遵循最佳实践撰写高效、简洁的代码，禁止写反直觉（anti-patterns）的代码结构；保障充足且快速高效的测试覆盖。
- **文档引用**：若是引用了新的三方库、依赖和组件，开发过程中必须主动给出并参考其官方文档链接。

## 7. 版本心跳与时间戳更新 (Version Heartbeat)
- 每次完成重要特性和提交 (commit) 前，必须检查并更新全站的部署版本号（Commit 更新次数递增）和最后更新时间（最后更新: YYYY-MM-DD）。
- 它们必须在 `src/components/Sidebar.tsx`、`src/app/page.tsx`、`src/app/essays/[essayId]/page.tsx` 等所有声明了更新和部署版本的页脚文字中被统一修改。
