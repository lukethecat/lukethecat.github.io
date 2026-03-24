# 内容处理流程 (Content Pipeline)

## 书籍录入

1. 在 `books/[bookId]/` 创建 `source.md`
2. 运行 `npm run process:books`
3. 运行 `npm run test:data`
4. 在 `src/content/works.json` 添加书籍条目
5. 生成注释 `annotations.json`（按 `.agents/skills/annotate-poem/SKILL.md`）

## 文章录入

1. 在 `books/essayN/source.md` 或 `src/content/essays/[essayId].md` 创建内容
2. 在 `src/content/works.json` 的 `essays` 数组添加条目
3. **不需要**运行 `process:books`（文章不走书籍处理流程）

## works.json 格式

```json
{
  "books": [{
    "id": "bookId",
    "title": "书名",
    "year": "年份",
    "description": "简介",
    "type": "poetry",
    "path": "/books/bookId",
    "relatedEssays": [{
      "id": "essayId",
      "title": "文章标题",
      "author": "作者",
      "path": "/essays/essayId"
    }]
  }],
  "essays": [{
    "id": "essayId",
    "title": "文章标题",
    "author": "作者",
    "date": "YYYY-MM",
    "description": "简介",
    "path": "/essays/essayId"
  }]
}
```

## ⚠️ JSON 安全
works.json 中的 description 字段如果包含中文引号，**必须使用 `「」`**，禁止 ASCII `"`。
参见 [golden-rules.md](golden-rules.md) GR-1。
