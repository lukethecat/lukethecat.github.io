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
const CHAPTER_REGEX = /^##\s+(.+)（(\d+)首）$/;
const PAGE_MARKER_REGEX = /^\[p(\d+)\]$/;
const POEM_TITLE_REGEX = /^###\s+(.+)$/;

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

    let mode = 'intro'; // intro, toc, content
    let introBuffer = [];
    let currentChapter = null;
    let currentPoem = null;
    let poemTitleParts = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // State transitions
        if (trimmed.startsWith('诗人小传：')) {
            mode = 'intro';
            const text = trimmed.substring(5).trim();
            if (text) introBuffer.push(text);
            continue;
        } else if (trimmed.startsWith('目录：')) {
            mode = 'toc';
            continue;
        }

        // Handle different modes
        if (mode === 'intro') {
            if (trimmed) introBuffer.push(trimmed);
        } else if (mode === 'toc') {
            // Skip TOC - we'll use the H2/H3 markers in content section
            const chapterMatch = trimmed.match(CHAPTER_REGEX);
            if (chapterMatch) {
                // Found first chapter marker, switch to content mode
                mode = 'content';
                currentChapter = {
                    id: `chapter-${book.chapters.length + 1}`,
                    title: chapterMatch[1],
                    poems: []
                };
                book.chapters.push(currentChapter);
            }
        } else if (mode === 'content') {
            // Check for chapter marker
            const chapterMatch = trimmed.match(CHAPTER_REGEX);
            if (chapterMatch) {
                currentChapter = {
                    id: `chapter-${book.chapters.length + 1}`,
                    title: chapterMatch[1],
                    poems: []
                };
                book.chapters.push(currentChapter);
                currentPoem = null;
                poemTitleParts = [];
                continue;
            }

            // Check for page marker [pX]
            const pageMatch = trimmed.match(PAGE_MARKER_REGEX);
            if (pageMatch) {
                if (poemTitleParts.length > 0 && currentChapter) {
                    // Create new poem with collected title parts
                    const fullTitle = poemTitleParts.join('／');
                    currentPoem = {
                        id: `poem-${book.chapters.length}-${currentChapter.poems.length + 1}`,
                        title: fullTitle,
                        lines: [],
                        pageNumber: pageMatch[1]
                    };
                    currentChapter.poems.push(currentPoem);
                    poemTitleParts = [];
                }
                continue;
            }

            // Check for poem title (### format)
            const titleMatch = trimmed.match(POEM_TITLE_REGEX);
            if (titleMatch) {
                const titleText = titleMatch[1].trim();
                // Remove leading fullwidth spaces for subtitle
                const cleanTitle = titleText.replace(/^　+/, '');
                poemTitleParts.push(cleanTitle);
                continue;
            }

            // Poem content lines
            if (currentPoem && trimmed !== '') {
                // Split by U+2028 line separator
                const splitLines = line.split('\u2028');
                for (const subline of splitLines) {
                    currentPoem.lines.push(subline);
                }
            } else if (currentPoem && trimmed === '') {
                // Empty line - preserve
                currentPoem.lines.push('');
            }
        }
    }

    book.intro = introBuffer.join('\n');

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
