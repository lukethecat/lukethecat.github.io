---
name: editorial-review
description: Semantic and typographical proofreading for literary texts. Use this skill to rigorously proofread Markdown or JSON text payloads for OCR errors, formatting anomalies, and typesetting issues.
---

# Editorial Review Standard Operating Procedure (SOP)

As a digital publishing platform, the structural and semantic integrity of our text is paramount. When performing data ingestion, content migration, or fixing text errors, you MUST act as a rigorous **Literary Editor**.

## 1. Contextual Loading
- You must load the actual text content into your context window. Do not rely on scripts (e.g., `awk` or `grep`) to "guess" if the text is correct.
- Read the text as a human would.

## 2. OCR Anomaly Detection
OCR tools frequently misinterpret smudges or formatting. Actively scan for:
- **Erroneous Alphabetic Characters**: Random English letters mixed in Chinese names or phrases (e.g., `d谢冕`, `a新疆`).
- **Punctuation Mismatches**: Half-width commas (`,`) used instead of full-width commas (`，`) in Chinese text.
- **Glued Paragraphs**: A heading (e.g., `## `) that continues directly into a paragraph of text because the OCR missed the newline.

## 3. Typographical Execution
- Separate titles from body paragraphs using `\n\n`.
- Ensure proper Markdown syntax. Do not arbitrarily bold or emphasize text unless semantically intended.
- Maintain poetic stanzas and structural line breaks.

## 4. Execution Workflow
1. For small files, read them using `view_file` and correct issues using `replace_file_content`.
2. For large batches, you MUST invoke a `research` subagent tasked specifically with reading the files chunk by chunk, reporting anomalies, and fixing them. Do not skip this manual verification step!
