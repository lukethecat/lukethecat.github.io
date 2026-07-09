
## Production Verification (Harness)
CRITICAL RULE: After pushing any changes to the remote repository that affect the live website, you MUST perform a "Real Internet Verification". You must wait for the deployment to finish (usually ~1-2 minutes for GitHub Pages), and then use `read_url_content` (or a similar tool) to fetch the live URL (e.g. `https://www.liyupoetry.com/...`) and definitively verify that the changes have taken effect on the public internet. Do not rely solely on local environment verification.

## Editorial & Typography Standards
CRITICAL RULE: This is a digital publishing and literary archive project. You MUST adopt the perspective of a strict "Literary Editor" and "Web Publisher".
1. **Never treat text as just a data payload.** When executing workflows like `/book-ingestion` or modifying text files, you must invoke the `editorial-review` skill (or spawn a subagent) to explicitly READ the text in your context window.
2. **Watch for OCR artifacts.** Look out for anomalous half-width English characters mixed in Chinese text (e.g., "d谢冕"), missed paragraph breaks, incorrect punctuation, and disjointed headers. Do not trust the raw text output from automated scripts blindly.
3. **Typography matters.** The website's design must remain elegant and readable. Any additions to rendering logic should lean on established typography systems (e.g., `@tailwindcss/typography`) rather than arbitrary CSS hacks.

## Dual-Agent Review (Code Quality)
CRITICAL RULE: For any significant architectural changes, complex refactoring, or massive data ingestion (e.g., processing a new book), you MUST invoke a secondary subagent (`invoke_subagent`) to perform a "Code Review". The reviewer agent should have fresh context and run deterministic verification scripts (e.g., `npm run test`, `check_ocr_artifacts.ts`) to ensure the main agent's work is flawless before proceeding.

## Poetry Spatial Formatting & PDF Source of Truth
CRITICAL RULE: DOCX files MUST NOT be used as the absolute visual source of truth for poetry. Poetry formatting is not merely text stacking; it is a visual representation of "breathing", rhythm, and pacing.
When processing or rendering poetry, you MUST adhere to these typographic truths derived strictly from the **scanned physical PDF**:
1. **Staircase & Offset Lines**: Modern poetry often uses staircase or offset formatting. Preserve this spatial relationship meticulously.
2. **Left-Aligned Center of Gravity**: Lines vary in length. A poem should NOT be arbitrarily centered line-by-line. The text block must remain left-aligned internally, but the entire block can be centered visually on the page based on the longest line.
3. **Cross-Page Stitching**: Physical page breaks interrupt rhythm. When digitizing, you must seamlessly stitch stanzas across pages without arbitrary breaks.
4. **Metadata Spacing**: Temporal and spatial metadata (e.g., creation time/location at the end of a poem) belong to a different contextual layer and MUST be separated by distinct spatial padding from the poem body.
