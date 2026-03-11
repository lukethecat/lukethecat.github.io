const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/content/essays/xinjiang-bingtuan-bianseshi-60years.md');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove all existing citations
content = content.replace(/\^\[\d+\]/g, '');

// 2. Intelligently join broken sentences
// Chinese paragraphs should end with proper punctuation. 
// If a line ends with a Chinese char (or comma) and the next non-empty line starts with a Chinese char, they should be joined.
const lines = content.split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line === '') continue; // Skip empty lines entirely for now, we'll restore paragraphs based on punctuation
    
    if (newLines.length > 0) {
        let prev = newLines[newLines.length - 1];
        
        // Exclude markdown structural elements from joining
        let isStructural = prev.startsWith('##') || prev.startsWith('**') || prev.match(/^\d+\./) || prev.startsWith('---') || line.startsWith('##') || line.startsWith('**') || line.match(/^\d+\./) || line.startsWith('---');
        
        if (!isStructural) {
            // Check if the previous line ends with something that IS NOT a sentence-ending punctuation.
            // Punctuation that ends a sentence: 。！？；：”）]>
            // If it ends with a Chinese character or a comma, it's a broken sentence.
            if (!prev.match(/[。！？；：”）\]\>]$/)) {
                // Join them
                newLines[newLines.length - 1] = prev + line;
                continue;
            }
        }
    }
    
    newLines.push(line);
}

// Re-add paragraph spacing
let finalContent = "";
for (let i = 0; i < newLines.length; i++) {
    finalContent += newLines[i] + '\n';
    // Add an extra newline for paragraphs, except inside frontmatter or lists
    if (!newLines[i].startsWith('---') && !newLines[i].match(/^\d+\./)) {
        finalContent += '\n';
    }
}

content = finalContent;


// 3. Inject citations exactly as verified from the PDF
const citations = [
    { text: '涌现的“新边塞诗”', num: 1 },
    { text: '高级将领的诗歌开始的', num: 2 },
    { text: '他们大都是军旅诗人', num: 3 },
    { text: '送来了一股清新的空气', num: 4 },
    { text: '流行的“忆苦思甜”主题', num: 4 },
    { text: '爱国激情', num: 5 },
    { text: '《东虹新边塞诗选》', num: 6 },
    { text: '《骆驼奠》《好汉巴特尔》', num: 7 },
    { text: '意境清新', num: 3 },
    { text: '《一棵冬天的树》', num: 3 },
    { text: '民间宗教的遗迹', num: 8 },
    { text: '独特风景出现在边塞诗中', num: 9 },
    { text: '意味深长', num: 10 },
    { text: '赋予诗较多的暗示性', num: 7 },
    { text: '时代悲剧', num: 11 },
    { text: '新边塞诗歌的题材和表现方法', num: 12 },
    { text: '主要内容', num: 13 },
    { text: '追求“个人情感和时代精神的相通”', num: 14 }
];

for (let c of citations) {
    if (content.includes(c.text)) {
        content = content.replace(c.text, `${c.text}^[${c.num}]`);
    } else {
        console.warn('Could not find text:', c.text);
    }
}

// Frontmatter cleanup
content = content.replace(/---\n\ntitle:/g, '---\ntitle:');
content = content.replace(/author: "杨昌俊"\n\ndate:/g, 'author: "杨昌俊"\ndate:');
content = content.replace(/date: "2019-07"\n\n---/g, 'date: "2019-07"\n---');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed markdown content length:', content.length);
