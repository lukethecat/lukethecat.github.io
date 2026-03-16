---
description: Process for ingesting a new poetry collection/book into the archive.
---

Follow these steps to ingest a new book, ensuring data integrity and cultural depth.

## 1. Prepare Source Markdown
1.  Place the raw text or DOCX in a temporary location.
2.  Format the text into a `source.md` file following the template:
    -   Use `### Poem Title` for poem headers.
    -   Use `[pX]` for original page numbers.
    -   Use `## Chapter Title` for chapter breaks.
    -   Add frontmatter for and "作者小传".

## 2. Process Data
// turbo
1.  Run the processing script:
    ```bash
    TMPDIR=/tmp npm exec -y --cache /tmp/tmp_npm_cache tsx scripts/process-books.ts
    ```
2.  Verify the generated `src/content/[bookId]/book.json`.

## 3. Generate Cultural Annotations
> [!IMPORTANT]
> Every book MUST have an `annotations.json` to provide historical, geographical, and cultural context (Bingtuan/Xinjiang specific).

1.  Analyze the book content for terms related to:
    -   Xinjiang geography and landmarks.
    -   Historical figures (e.g., Cen Shen, Wang Luobin).
    -   Bingtuan (XPCC) specific terminology (e.g., 地窝子, 军垦).
    -   Poetic symbols unique to the author (e.g., 夜莺, 红柳).
2.  Create `src/content/[bookId]/annotations.json` using the following format:
    ```json
    {
      "poem-1-1": [
        {
          "term": "Term to explain",
          "note": "Explanatory note in Chinese."
        }
      ]
    }
    ```

## 4. Regression Testing
// turbo
1.  Run the validation suite:
    ```bash
    npm run test:data
    ```
2.  Ensure zero errors for the new book.

## 5. UI Verification
1.  Check the sidebar navigation for the new book.
2.  Verify the sticky Language Switcher is functional.
3.  Ensure annotations appear correctly in the poem view.
