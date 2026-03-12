---
description: Run Regression Tests and Data Verification
---
# Regression Testing Workflow

Run this workflow whenever content changes, a new book is added, or global styles/components are modified.

1. Ensure you have the latest data by running the book processor:
   ```bash
   npm run process:books
   ```

2. Run the regression test script to automatically verify data integrity and known edge cases (e.g., missing poems, duplicate chapters, globally applied styles):
   // turbo
   ```bash
   npm run test:data
   ```

3. (Optional) Run the Next.js build command to ensure no compilation errors:
   ```bash
   npm run build
   ```

## Local Verification Steps
If the user reports UI or missing content issues, follow these manual verification steps:
1. Verify `src/content/<bookId>/book.json` contains the expected `lines` and `chapters`.
2. Review the relevant `.tsx` components in `src/components/` (e.g., `PoemView.tsx`, `Sidebar.tsx`, `LanguageSwitcher.tsx`).
3. If styles are missing from live site but exist locally, ensure they were moved to `globals.css` and are not encapsulated in a scoped `<style jsx>` block incorrectly.
