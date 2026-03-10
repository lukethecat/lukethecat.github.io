const fs = require('fs');
const path = require('path');

const CHAPTER_REGEX = /^(?:##\s+)?(.+)（(\d+)首）$/;
const sourcePath = path.join(__dirname, 'books/heiyingsushangjuan1998/source.md');

const content = fs.readFileSync(sourcePath, 'utf8');
const lines = content.split('\n');

let isTOC = false;
let foundChapters = [];

for (let line of lines) {
    line = line.trim();
    if (line.startsWith('目录：') || line === '## 目录') {
        isTOC = true;
        continue;
    }
    if (line === '***') break;

    if (isTOC && line) {
        const chapterMatch = line.match(CHAPTER_REGEX);
        if (chapterMatch) {
            foundChapters.push(chapterMatch[1]);
        }
    }
}

console.log('Found Chapters:', foundChapters);
if (foundChapters.length === 0) {
    console.error('FAILED to find any chapters in TOC!');
}
