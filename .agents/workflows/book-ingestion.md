---
description: Process for ingesting a new poetry collection/book into the archive. This workflow is designed as a Goal-based Loop.
---

This workflow uses a **Goal-based Loop** (`/goal`) to ensure data integrity, cultural depth, and typographic cleanliness during ingestion.

> [!TIP]
> To execute this workflow autonomously, the user should run:
> `/goal Ingest [Book Name]. The stop criteria is passing all tests (npm run test:data) and generating an error-free Markdown file verified by the check_ocr_artifacts script.`

## 1. Prepare Source Markdown
1.  Place the raw text or DOCX in a temporary location.
2.  Format the text into a `source.md` file following the template.

## 2. Process Data
1.  Run the processing script to convert raw text to JSON and Markdown:
    ```bash
    TMPDIR=/tmp npm exec -y --cache /tmp/tmp_npm_cache tsx scripts/process-books.ts
    ```
2.  Verify the generated `src/content/[bookId]/book.json`.

## 3. Editorial Self-Verification (Turn-based Loop)
> [!IMPORTANT]
> The ingestion must pass a deterministic verification for OCR and typography errors.
1. Run the custom OCR linting script:
   ```bash
   npx tsx .agents/skills/editorial-review/scripts/check_ocr_artifacts.ts src/content/essays/
   ```
2. If the script reports errors (e.g., long headers, mixed half-width English chars), you **MUST** fix them before completing the goal. Iterate until the script outputs zero errors.

## 4. Extract Related Essays (Mandatory)
If the source text contains prefaces (序), afterwords (跋/后记), publication info (出版信息), or author biography (作者小传), they MUST be extracted as separate Essay Markdown files in `src/content/essays/` and linked in `src/content/works.json`.

## 5. Generate Cultural Annotations
Every book MUST have an `annotations.json` to provide historical, geographical, and cultural context (Bingtuan/Xinjiang specific).

## 6. Goal Stop Criteria (Regression Testing)
To successfully exit the `/goal` loop, you must run the validation suite and ensure zero errors:
```bash
npm run test:data
```

## 7. UI Verification
Start the local development server (`npm run dev`) and use `curl` to verify that the newly added titles, essays, and annotations explicitly appear in the HTML output.
