import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: tsx check_ocr_artifacts.ts <directory_path>");
  process.exit(1);
}

const dirPath = args[0];
let totalErrors = 0;

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let lineErrors = 0;

  lines.forEach((line, index) => {
    // Check 1: Long headers (OCR missed newline)
    if (line.match(/^#{1,6}\s/) && line.length > 80) {
      console.log(`[Error] ${filePath}:${index + 1} - Header exceeds 80 characters (likely OCR merged paragraph).`);
      lineErrors++;
    }

    // Check 2: Anomalous half-width English letters in Chinese text
    // E.g. "d谢冕", "a新疆"
    // Match a lowercase/uppercase letter surrounded by Chinese characters
    if (line.match(/[\u4e00-\u9fa5][a-zA-Z][\u4e00-\u9fa5]/)) {
      console.log(`[Error] ${filePath}:${index + 1} - Found stray English letter surrounded by Chinese characters.`);
      lineErrors++;
    }

    // Check 3: Half-width commas in Chinese context
    // Exclude markdown links and image tags which use half-width commas/brackets sometimes
    const cleanLine = line.replace(/\[.*?\]\(.*?\)/g, '');
    if (cleanLine.match(/[\u4e00-\u9fa5],[\u4e00-\u9fa5]/)) {
      console.log(`[Warning] ${filePath}:${index + 1} - Found half-width comma ',' between Chinese characters.`);
      // We count this as error for strict editorial review
      lineErrors++;
    }
  });

  if (lineErrors > 0) {
    totalErrors += lineErrors;
  }
}

function walkDir(currentPath: string) {
  const stat = fs.statSync(currentPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(currentPath);
    files.forEach(file => {
      walkDir(path.join(currentPath, file));
    });
  } else if (stat.isFile() && currentPath.endsWith('.md')) {
    checkFile(currentPath);
  }
}

walkDir(dirPath);

if (totalErrors > 0) {
  console.error(`\n[Failed] Found ${totalErrors} OCR/typography errors. Please fix them.`);
  process.exit(1);
} else {
  console.log(`[Success] No OCR artifacts found in ${dirPath}.`);
  process.exit(0);
}
