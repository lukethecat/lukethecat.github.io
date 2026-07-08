---
description: Process for ingesting a new poetry collection/book into the archive. This workflow is designed as a Goal-based Loop using the Evaluator-Optimizer pattern.
---

This workflow uses a **Goal-based Loop** (`/goal`) to ensure data integrity, cultural depth, and typographic cleanliness during ingestion.

> [!TIP]
> To execute this workflow autonomously, the user should run:
> `/goal Ingest [Book Name]. Implement the Evaluator-Optimizer loop to clean the raw text, ensuring all OCR errors are fixed and stanza spacing is perfect, then process and verify the build.`

## 1. Prepare & Clean Source Markdown (Evaluator-Optimizer Loop)
**CRITICAL**: Do NOT trust raw OCR text. Do NOT run the processing scripts immediately. You must perform an LLM-based Evaluator-Optimizer loop to clean the text first.

1.  **Generate/Clean (Optimizer)**: Place the raw text or DOCX in `books/[bookId]/source.md`. Chunk the text and use the `editorial-review` skill to strictly reformat it.
    *   Fix pervasive OCR typos (e.g., changing `-` to `一`, removing anomalous half-width English characters).
    *   **Typography enforcement**: Ensure there is always a blank line separating different stanzas (e.g., before markers like `二`, `三`, `四`).
    *   Standardize punctuation and title hierarchies.
2.  **Evaluate (Reviewer)**: Read the cleaned output. Did any text get lost? Are there any remaining `-` markers instead of `一`? Are the stanza breaks (blank lines) clearly present?
3.  **Loop**: Iterate on Step 1 and 2 until the evaluation passes with zero remaining artifacts.

## 2. Process Data
1.  Run the processing script to convert the pristine `source.md` to JSON and Markdown:
    ```bash
    TMPDIR=/tmp npm exec -y --cache /tmp/tmp_npm_cache tsx scripts/process-books.ts
    ```
2.  Verify the generated `src/content/[bookId]/book.json` exists and structure is clean.

## 3. Extract Related Essays (Mandatory)
If the source text contains prefaces (序), afterwords (跋/后记), publication info (出版信息), or author biography (作者小传), they MUST be extracted as separate Essay Markdown files in `src/content/essays/` and linked in `src/content/works.json`.

## 4. Generate Cultural Annotations
Every book MUST have an `annotations.json` to provide historical, geographical, and cultural context (Bingtuan/Xinjiang specific).

## 5. Goal Stop Criteria (Regression Testing)
To successfully exit the `/goal` loop, you must run the validation suite and ensure zero errors:
```bash
npm run test:data
```

## 6. UI Verification
Start the local development server (`npm run dev`) and use `curl` to verify that the newly added titles, essays, and annotations explicitly appear in the HTML output, and that stanza gaps render correctly.
