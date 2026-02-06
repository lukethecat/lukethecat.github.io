const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(process.cwd(), 'books');
const CONTENT_DIR = path.join(process.cwd(), 'src/content');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Global regex patterns
const CHAPTER_REGEX = /^(.+)（(\d+)首）$/;
const POEM_IN_TOC_REGEX = /^\s*(.+?)\s+(\d+)$/;
const PAGE_MARKER_REGEX = /^\[p(\d+)\]$/;

function processBook(bookDirName) {
    const bookPath = path.join(BOOKS_DIR, bookDirName, 'source.md');
    if (!fs.existsSync(bookPath)) return;

    const content = fs.readFileSync(bookPath, 'utf-8');
    const lines = content.split('\n');

    // Default metadata
    const book = {
        id: bookDirName,
        title: '汗血马',
        author: '李瑜',
        year: '1995年',
        intro: '',
        chapters: []
    };

    let introBuffer = [];
    let isIntro = false;
    let isTOC = false;
    let tocChapters = [];
    let currentTocChapter = null;

    let contentStartLine = 0;

    // Pass 1: Parse Intro and TOC
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('诗人小传：')) {
            isIntro = true;
            isTOC = false;
            const text = line.substring(5).trim();
            if (text) introBuffer.push(text);
            continue;
        } else if (line.startsWith('目录：')) {
            isIntro = false;
            isTOC = true;
            continue;
        } else if (line.startsWith('[p')) {
            // End of TOC, start of content
            isTOC = false;
            contentStartLine = i;
            break;
        }

        if (isIntro) {
            if (line) introBuffer.push(line);
        } else if (isTOC) {
            if (!line) continue;

            // Normalize separators (handle U+2028 LINE SEPARATOR)
            const parts = line.split(/[\u2028\n]+/);
            for (const part of parts) {
                const trimmedPart = part.trim();
                const chapterMatch = trimmedPart.match(CHAPTER_REGEX);
                if (chapterMatch) {
                    currentTocChapter = { title: chapterMatch[1], poems: [] };
                    tocChapters.push(currentTocChapter);
                } else if (currentTocChapter) {
                    const poemMatch = trimmedPart.match(POEM_IN_TOC_REGEX);
                    if (poemMatch) {
                        currentTocChapter.poems.push({
                            title: poemMatch[1],
                            page: poemMatch[2]
                        });
                    }
                }
            }
        }
    }

    book.intro = introBuffer.join('\n');

    // Pass 2: Parse Body using Page Markers
    let currentPoem = null;

    // Initialize chapters in book structure
    book.chapters = tocChapters.map((tc, idx) => ({
        id: `chapter-${idx + 1}`,
        title: tc.title,
        poems: []
    }));

    // Start parsing content
    for (let i = contentStartLine; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        const pageMatch = trimmed.match(PAGE_MARKER_REGEX);
        if (pageMatch) {
            const pageNum = pageMatch[1];

            // Find the poem with this page number
            let found = false;
            for (let cIdx = 0; cIdx < tocChapters.length; cIdx++) {
                const ch = tocChapters[cIdx];
                const pIdx = ch.poems.findIndex(p => p.page === pageNum);
                if (pIdx !== -1) {
                    const poemInfo = ch.poems[pIdx];
                    currentPoem = {
                        id: `poem-${cIdx + 1}-${pIdx + 1}`,
                        title: poemInfo.title,
                        lines: [],
                        pageNumber: pageNum
                    };
                    book.chapters[cIdx].poems.push(currentPoem);
                    found = true;

                    // Skip the subtitle line that appears right before [pX] marker
                    // It's the line with leading fullwidth spaces "　　　　..."
                    // We've already captured the full title (主标题 /副标题) from TOC

                    break;
                }
            }
            if (!found) {
                currentPoem = null;
            }
        } else if (currentPoem) {
            // Process line with U+2028 line separators
            const splitLines = line.split('\u2028');
            for (const subline of splitLines) {
                currentPoem.lines.push(subline);
            }
        }
    }

    // Clean up poem lines
    book.chapters.forEach(c => {
        c.poems.forEach(p => {
            // Trim trailing empty lines
            while (p.lines.length > 0 && !p.lines[p.lines.length - 1].trim()) {
                p.lines.pop();
            }
            // Trim leading empty lines
            while (p.lines.length > 0 && !p.lines[0].trim()) {
                p.lines.shift();
            }
        });
    });

    ensureDir(path.join(CONTENT_DIR, bookDirName));
    fs.writeFileSync(
        path.join(CONTENT_DIR, bookDirName, 'book.json'),
        JSON.stringify(book, null, 2)
    );
    console.log(`Processed ${bookDirName}`);
}

// Execution
ensureDir(CONTENT_DIR);
if (fs.existsSync(BOOKS_DIR)) {
    const books = fs.readdirSync(BOOKS_DIR);
    books.forEach(book => {
        if (fs.statSync(path.join(BOOKS_DIR, book)).isDirectory()) {
            processBook(book);
        }
    });
}
