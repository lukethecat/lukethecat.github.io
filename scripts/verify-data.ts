import * as fs from 'fs';
import * as path from 'path';

const contentDir = path.join(__dirname, '../src/content');
const worksPath = path.join(contentDir, 'works.json');

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Regression Test Failed: \${message}`);
    }
}

function verifyData() {
    console.log('Starting regression data verification...');
    
    // 1. Verify works.json
    assert(fs.existsSync(worksPath), 'works.json is missing');
    const worksData = JSON.parse(fs.readFileSync(worksPath, 'utf8'));
    assert(Array.isArray(worksData.books), 'works.json format is invalid (missing books array)');
    
    const bookIds = new Set<string>();
    for (const book of worksData.books) {
        assert(!bookIds.has(book.id), `Duplicate book ID found in works.json: \${book.id}`);
        bookIds.add(book.id);
    }
    
    console.log(`Verified \${worksData.books.length} books in works.json`);

    // 2. Verify individual book.json files
    let totalPoemsChecked = 0;
    
    for (const book of worksData.books) {
        const bookJsonPath = path.join(contentDir, book.id, 'book.json');
        assert(fs.existsSync(bookJsonPath), `Missing book.json for book: \${book.id}`);
        
        const bookData = JSON.parse(fs.readFileSync(bookJsonPath, 'utf8'));
        
        // 2a. Verify annotations.json exists
        const annotationsPath = path.join(contentDir, book.id, 'annotations.json');
        assert(fs.existsSync(annotationsPath), `Missing annotations.json for book: \${book.id}`);
        
        assert(bookData.id === book.id, `ID mismatch in \${book.id}/book.json`);
        assert(Array.isArray(bookData.chapters), `Missing chapters array in \${book.id}`);
        assert(bookData.chapters.length > 0, `Book \${book.id} has no chapters`);
        
        const chapterIds = new Set<string>();
        const poemIds = new Set<string>();
        let bookPoemCount = 0;
        
        for (const chapter of bookData.chapters) {
            assert(!chapterIds.has(chapter.id), `Duplicate chapter ID \${chapter.id} in \${book.id}`);
            chapterIds.add(chapter.id);
            assert(Array.isArray(chapter.poems), `Missing poems array in chapter \${chapter.id} of \${book.id}`);
            
            for (const poem of chapter.poems) {
                assert(!poemIds.has(poem.id), `Duplicate poem ID \${poem.id} in \${book.id}`);
                poemIds.add(poem.id);
                
                assert(Array.isArray(poem.lines), `Missing lines for poem \${poem.id} in \${book.id}`);
                const validLines = poem.lines.filter((line: string) => line.trim().length > 0);
                assert(validLines.length > 0, `Poem \${poem.id} in \${book.id} has no content lines`);
                
                bookPoemCount++;
                totalPoemsChecked++;
            }
        }
        
        // Specific regression assertions based on past issues
        if (book.id === 'zhungaer1984') {
            assert(bookData.chapters.length === 4, `zhungaer1984 should have exactly 4 chapters (found \${bookData.chapters.length})`);
        }
        
        if (book.id === 'heiyingsuxiajuan1998') {
            assert(bookPoemCount === 101, `heiyingsuxiajuan1998 should have exactly 101 poems (found \${bookPoemCount})`);
        }
        
        console.log(`Verified book: \${book.id} (\${bookData.chapters.length} chapters, \${bookPoemCount} poems)`);
    }

    // 3. Global CSS Check for Language Switcher optimizations
    const cssPath = path.join(__dirname, '../src/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert(cssContent.includes('.goog-te-banner-frame.skiptranslate'), 'globals.css is missing Google Translate hide rules');

    console.log(`\nRegression test passed successfully! (\${worksData.books.length} books, \${totalPoemsChecked} poems total)`);
}

try {
    verifyData();
} catch (e: any) {
    console.error(e.message);
    process.exit(1);
}
