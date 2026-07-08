# Project Context: Poet's Digital Archive

## 1. Vision & Philosophy
**Goal:** Transform the poet's growing collection of books into a high-performance, interactive digital archive.
**Aesthetics:** Zed.dev inspired. Fast, clean, content-centric. High contrast typography.
**Core Principle:** "Context-Driven" & "Idempotency". The `books/` directory is the single source of truth.

## 2. Architecture & Stack
*   **Framework:** Next.js (App Router, TypeScript).
*   **Styling:** Tailwind CSS (Vanilla CSS where needed for fine typography control).
*   **State/Content:**
    *   **Source:** `/books/{book_name}/*.md` (Raw Markdown).
    *   **Build Artifact:** `/src/content/` (Generated JSON/Components).
    *   **Processing:** Custom Node.js script watching `/books` to regenerate `/src/content`.
*   **Fonts:**
    *   **UI:** Sans-serif (Inter/Geist - clean, modern).
    *   **Poem Body:** Serif (Noto Serif SC / Songti - literary, readable).

## 3. Directory Structure
```
/
├── books/                  # [SOURCE OF TRUTH] - User Edits Here
│   └── hanxuema1995/       # Book Name
│       └── source.md       # Raw Content (or split by chapter)
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # UI Components (Sidebar, PoemRenderer)
│   ├── content/            # [GENERATED] - Do not edit manually
│   │   └── hanxuema1995/   # Processed JSON/Data
│   └── lib/                # Logic (Parser, TitleFormatter)
└── scripts/
    └── content-processor.ts # The logic to convert books/ -> src/content/
```

## 4. Current Status
*   **Phase:** Initialization.
*   **Task:** Setting up project structure and processing the first book.
*   **Books:**
    *   `hanxuema1995`: Pending import from `source.txt`.

## 5. Technical Decisions
*   **Title Formatting:**
    *   **Input:** `Line 1 ／ Line 2`
    *   **UI List:** `Line 1 ／ Line 2` (No break)
    *   **Poem View:**
        ```
        Line 1
          Line 2
        ```
*   **Content Processing:** Using specific separators (`#`, `##`, `###`) to denote Book/Chapter/Poem hierarchy.
