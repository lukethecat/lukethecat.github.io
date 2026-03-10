const fs = require('fs');
const path = require('path');

const bookId = 'heiyingsushangjuan1998';
const bookPath = path.join(__dirname, 'src/content', bookId, 'book.json');

if (!fs.existsSync(bookPath)) {
    console.error('File not found:', bookPath);
    process.exit(1);
}

try {
    const data = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
    console.log('Book ID:', data.id);
    console.log('Title:', data.title);
    console.log('Chapters count:', data.chapters.length);

    if (data.chapters.length > 0) {
        console.log('First Chapter Title:', data.chapters[0].title);
        console.log('First Chapter Poem Count:', data.chapters[0].poems.length);
        if (data.chapters[0].poems.length > 0) {
            console.log('First Poem Title:', data.chapters[0].poems[0].title);
        }
    } else {
        console.warn('WARNING: No chapters found in book.json!');
    }
} catch (e) {
    console.error('Failed to parse or validate book.json:', e);
}
