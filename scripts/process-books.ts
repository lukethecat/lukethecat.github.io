import * as fs from 'fs';
import * as path from 'path';

// Types
interface Poem {
    id: string;
    title: string;
    lines: string[];
    pageNumber?: string;
}

interface Chapter {
    id: string;
    title: string;
    poems: Poem[];
}

interface Book {
    id: string;
    title: string;
    author: string;
    year?: string;
    intro?: string;
    chapters: Chapter[];
}

const BOOKS_DIR = path.join(process.cwd(), 'books');
const CONTENT_DIR = path.join(process.cwd(), 'src/content');

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Global regex patterns
const CHAPTER_REGEX = /^(.+)（(\d+)首）$/;
const POEM_IN_TOC_REGEX = /^\s*(.+?)\s+(\d+)$/;
const PAGE_MARKER_REGEX = /^\[p(\d+)\]$/;

function processBook(bookDirName: string) {
    const bookPath = path.join(BOOKS_DIR, bookDirName, 'source.md');
    if (!fs.existsSync(bookPath)) return;

    const content = fs.readFileSync(bookPath, 'utf-8');
    const lines = content.split('\n');

    // Default metadata
    const book: Book = {
        id: bookDirName,
        title: '汗血马',
        author: '李瑜',
        year: '1995年',
        intro: '',
        chapters: []
    };

    let introBuffer: string[] = [];
    let isIntro = false;
    let isTOC = false;
    let tocChapters: { title: string, poems: { title: string, page: string }[] }[] = [];
    let currentTocChapter: { title: string, poems: { title: string, page: string }[] } | null = null;

    let contentStartLine = 0;

    // Pass 1: Parse Intro and TOC
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Extract book title from first # heading
        if (line.startsWith('# ') && !book.title.includes(line.substring(2))) {
            book.title = line.substring(2).trim();
            continue;
        }

        // Extract year from content intro if it contains publication year
        if (line.includes('年') && line.match(/\d{4}年/)) {
            const yearMatch = line.match(/(\d{4})年/);
            if (yearMatch && !book.year.includes(yearMatch[1])) {
                book.year = `${yearMatch[1]}年`;
            }
        }

        if (line.startsWith('诗人小传：') || line === '## 作者小传') {
            isIntro = true;
            isTOC = false;
            const text = line.startsWith('诗人小传：') ? line.substring(5).trim() : '';
            if (text) introBuffer.push(text);
            continue;
        } else if (line.startsWith('目录：') || line === '## 目录') {
            isIntro = false;
            isTOC = true;
            continue;
        } else if (line.startsWith('## ') && line.match(/（\d+首）$/)) {
            // Found first chapter heading - mark content start but keep parsing TOC
            if (contentStartLine === 0) {
                contentStartLine = i;
            }
            // DON'T break here! TOC continues after chapter headings in new format
            continue;
        } else if (line.startsWith('[p') && contentStartLine === 0) {
            // Skip [p] markers before we find the first chapter
            continue;
        } else if (line === '***' || line === '* * *') {
            // Stop parsing entirely at separator
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

    // Pass 2: Parse Body using Markdown Structure
    // In the new format:
    // - Each poem starts with "### 诗歌主标题"
    // - Followed by "　　　　副标题" (full-width spaces + subtitle)
    // - Then poem content
    // - Ends with [pX] page marker

    book.chapters = tocChapters.map((tc, idx) => ({
        id: `chapter-${idx + 1}`,
        title: tc.title,
        poems: []
    }));

    let currentPoem: Poem | null = null;
    let currentChapterIndex: number = -1;

    for (let i = contentStartLine; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check for chapter heading (## 章节名（X首）)
        if (trimmed.startsWith('## ') && trimmed.match(/（\d+首）$/)) {
            currentChapterIndex++;
            currentPoem = null;
            continue;
        } else if (trimmed.startsWith('## ') && currentChapterIndex >= 0) {
            // Hit a non-chapter ## heading AFTER we started collecting chapters
            // (like "## 后记" or "## 出版信息" at the end)
            // This means we've finished all poems, stop parsing
            currentPoem = null;
            break;
        }

        // Check for poem title (### 诗歌标题)
        if (trimmed.startsWith('### ')) {
            const poemTitle = trimmed.substring(4).trim();

            // Find this poem in TOC to get its metadata
            if (currentChapterIndex >= 0 && currentChapterIndex < tocChapters.length) {
                const ch = tocChapters[currentChapterIndex];
                const pIdx = ch.poems.findIndex(p => p.title.startsWith(poemTitle));

                if (pIdx !== -1) {
                    const poemInfo = ch.poems[pIdx];
                    currentPoem = {
                        id: `poem-${currentChapterIndex + 1}-${pIdx + 1}`,
                        title: poemInfo.title,
                        lines: [],
                        pageNumber: poemInfo.page
                    };
                    book.chapters[currentChapterIndex].poems.push(currentPoem);
                }
            }
            continue;
        }

        // Check for *** separator - skip it but continue parsing
        // *** appears between chapters as section divider, not just at end
        if (trimmed === '***' || trimmed === '* * *') {
            continue; // Skip the separator line, don't stop entirely
        }

        // Check for page marker [pX] - this ends the current poem
        if (trimmed.match(PAGE_MARKER_REGEX)) {
            currentPoem = null;
            continue;
        }

        // Skip subtitle lines (start with full-width spaces like "　　　　")
        if (line.match(/^　+/)) {
            continue;
        }

        // Collect poem content lines
        if (currentPoem && trimmed) {
            // Skip code block fences
            if (trimmed.startsWith('```')) {
                continue;
            }

            // Clean markdown artifacts
            let cleanLine = line;

            // Remove blockquote markers
            if (trimmed.startsWith('>')) {
                cleanLine = cleanLine.replace(/^\s*>\s?/, '');
            }

            // Remove bold markers
            cleanLine = cleanLine.replace(/\*\*/g, '');

            if (cleanLine.trim()) {
                currentPoem.lines.push(cleanLine);
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
