# Gemini Agent Protocol: Li Yu Poetry Project

## 1. Project Identity
- **Name:** Li Yu Poetry (liyupoetry.com)
- **Goal:** Digital archive of poet Li Yu's works, including poetry, books, art collections, and essays.
- **Style:** Minimalist, academic, "Zed-blog" aesthetic (Clean sans-serif, dark mode friendly).
- **Engine:** Zola (Static Site Generator).

## 2. Content Architecture
When adding content, STRICTLY adhere to this schema:

| Content Type | Directory | Taxonomy Requirements | Front Matter Extras |
| :--- | :--- | :--- | :--- |
| **Poetry** | `content/poetry/<collection>/` | `tags`, `series` (Book Name) | `subtitle` (if needed) |
| **Books** | `content/books/` | `years`, `tags` | `cover_image`, `purchase_link` |
| **Art** | `content/art/` | `tags` (Material/Style), `years` | `dimensions`, `medium` |
| **Essays** | `content/essays/` | `tags`, `series` (Related Work) | `author` (if guest) |

## 3. Workflow Standard
1. **Context Check:** Always check `.agents/memory/project-context.json` and `daily-*.json` for recent changes.
2. **Atomic Changes:** When modifying code, keep changes small and testable.
3. **Deployment:** Pushing to `main` triggers GitHub Actions -> Cloudflare Pages.
4. **Memory:** If a decision is made about *design* or *architecture*, update `project-context.json`.

## 4. Key files
- `config.toml`: Menus and taxonomies.
- `static/css/main.css`: Core styling (Zed theme).
- `templates/`: Zola templates.

## 5. Interaction Logic
- If the user asks for "Logic" or "Context", READ THIS FILE FIRST.
- Use `save_memory` only for *user preferences*, not project facts (use JSON for that).
