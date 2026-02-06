const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../books/hanxuema1995/source.md');
const content = fs.readFileSync(sourceFile, 'utf-8');
const lines = content.split('\n');

// Parse TOC to get main titles
const tocMap = new Map(); // page -> main title
let inTOC = false;

for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('目录：')) {
        inTOC = true;
        continue;
    }
    if (trimmed.startsWith('##')) {
        inTOC = false;
        break;
    }

    if (inTOC && trimmed) {
        // Parse TOC entries: "　　主标题／副标题 页码"
        const parts = trimmed.split('\u2028');
        for (const part of parts) {
            const match = part.match(/^\s*(.+?)\s+(\d+)$/);
            if (match) {
                const fullTitle = match[1].trim();
                const pageNum = match[2];
                if (fullTitle.includes('／')) {
                    const [mainTitle] = fullTitle.split('／');
                    tocMap.set(pageNum, mainTitle.trim());
                }
            }
        }
    }
}

// Now modify the content section
const newLines = [];
let i = 0;

while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this is a page marker [pX]
    const pageMatch = trimmed.match(/^\[p(\d+)\]$/);
    if (pageMatch) {
        const pageNum = pageMatch[1];
        const mainTitle = tocMap.get(pageNum);

        if (mainTitle) {
            // Add the [pX] marker
            newLines.push(line);

            // Add main title as H3
            newLines.push(`### ${mainTitle}`);

            // The next line should be the subtitle (### 　　...)
            i++;
            if (i < lines.length) {
                newLines.push(lines[i]);
            }
        } else {
            newLines.push(line);
        }
    } else {
        newLines.push(line);
    }

    i++;
}

// Write back
fs.writeFileSync(sourceFile, newLines.join('\n'), 'utf-8');
console.log('Added main title headers before subtitles');
