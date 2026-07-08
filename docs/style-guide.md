# 排版与样式规范 (Style Guide)

## 字体
- **UI**: Inter/Geist（无衬线，现代感）
- **诗歌正文**: Noto Serif SC / Songti（衬线，文学感）

## Google Translate 组件
- 全站使用 Google Translate 实现多语言
- 不要手动对齐各语种翻译文本
- CSS 调整时注意 `.goog-te-banner-frame` 不要挤占空间
- 语种切换后诗歌排版、字重、留白必须保持统一

## 中文排版
- 诗歌副标题使用全角空格 `　　` 缩进
- 中文语境下绝对杜绝半角标点
- 尊重 source.md 中的物理空行（影响段落韵律）

## 引号规范
- JSON 文件中：使用 `「」`（方头括号），禁止 ASCII `"`
- Markdown 正文中：使用 `""`（全角引号）
