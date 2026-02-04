# Project Protocols: Li Yu Poetry (Reboot)

## 1. Design Philosophy
- **Style**: Zed.dev Agent Panel aesthetic.
  - **Dark Mode**: Deep blue-grey/black (#1a1b1e), high contrast text.
  - **Layout**: Sidebar navigation (Books/Chapters) + Main Content Area.
  - **Typography**: Clean Sans-serif (Inter/System). No serifs.
- **Goal**: A digital library/archive for Li Yu's works.

## 2. Content Rules (CRITICAL)
- **Poetry Titles**: MUST be split into two lines if they contain a subtitle (slash `/` or `／`).
  - **Format**:
    ```markdown
    ### Main Title
    　　　　Subtitle (Indented 4 full-width spaces)
    ```
  - **No Duplication**: Do NOT repeat the title text in the body content.
- **Structure**:
  - `content/<book_slug>/<chapter>/<poem>.md`
  - Book: `_index.md` (Cover/Intro)
  - Chapter: `_index.md` (List of poems)

## 3. Deployment
- **GitHub Pages**: Primary.
- **Cloudflare Pages**: Mirror (via GitHub Actions).
- **Workflow**: `push to main` triggers build.

## 4. Maintenance
- When adding new books, use the `process_book.py` script (to be created) or follow the manual parsing rules above.