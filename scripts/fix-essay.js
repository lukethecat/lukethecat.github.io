const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/content/essays/xinjiang-bingtuan-bianseshi-60years.md');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

let frontmatter = [];
let i = 0;
if (lines[0] === '---') {
    frontmatter.push(lines[i++]);
    while (i < lines.length && lines[i] !== '---') {
        frontmatter.push(lines[i++]);
    }
    if (i < lines.length) frontmatter.push(lines[i++]);
}

const bodyLines = lines.slice(i);
let cleaned = [];

// Filtering noise lines heuristically
const noisePatterns = [
    /^[\uFF21-\uFF3A\uFF41-\uFF5A]+$/, // fullwidth english
    /^Ｖｏｌ．/,
    /^Ｎｏ．/,
    /^ＪｏｕｒｎａｌｏｆＸｉｈｕａ/,
    /^Ｊｕｌ．/,
    /^Ｐｈｉｌｏｓｏｐｈｙ＆/,
    /^文章编号：/,
    /^文献标志码：/,
    /^中图分类号：/,
    /^１６７２－/,
    /^１０．１９６４２/,
    /^第\s*卷第\s*期$/,
    /^第\s*$/,
    /^卷第\s*$/,
    /^期\s*$/,
    /^·语言文学·$/,
    /杨昌俊：新疆兵团“新边塞诗”六十年发展综述/, // page headers
    /新\s*疆\s*兵\s*团\s*“新边塞诗”六十年发展综述/
];

let inEnglishAbstract = false;

for (let line of bodyLines) {
    let t = line.trim();
    if (!t) {
        cleaned.push('');
        continue;
    }

    if (t === '“' || t === '”') continue; // Stray quotes
    if (noisePatterns.some(p => p.test(t))) continue;

    // Detect english abstract section to skip merging or merge differently
    if (t.includes('ＮｅｗＦｒｏｎｔｉｅｒＰｏｅｔｒｙ') || t.startsWith('ＹＡＮＧＣｈａｎｇ')) {
        continue;
    }
    if (t.startsWith('Ｗｉｔｈｔｈｅｅｓｔａｂｌｉｓｈｍｅｎｔ')) {
        inEnglishAbstract = true;
    }
    if (inEnglishAbstract) {
        if (t.startsWith('一、') || t.includes('新疆兵团诗歌随着')) {
            inEnglishAbstract = false;
        } else {
            continue; // Skip english abstract completely as it is garbled
        }
    }

    cleaned.push(t);
}

// Paragraph merging logic
let paragraphs = [];
let currentP = '';

const endPunctuation = /[。！？；：”’）\]]$/;
// Some lines may end with numbers for citations, e.g. [1] -> ］

for (let line of cleaned) {
    if (!line) {
        if (currentP) {
            paragraphs.push(currentP);
            currentP = '';
        }
        paragraphs.push('');
        continue;
    }

    // Detect headings
    if (line.match(/^[一二三四五六七八九十]、/)) {
        if (currentP) paragraphs.push(currentP);
        paragraphs.push('## ' + line);
        currentP = '';
        continue;
    }
    if (line.match(/^（[一二三四五六七八九十]）/)) {
        if (currentP) paragraphs.push(currentP);
        paragraphs.push('### ' + line);
        currentP = '';
        continue;
    }

    if (line.startsWith('摘') && line.includes('要：')) {
        line = '**摘要：** ' + line.replace(/摘\s*要：/, '');
    }
    if (line.startsWith('关键词：')) {
        line = '**关键词：** ' + line.substring(4);
    }
    if (line.startsWith('作者简介：') || line.startsWith('基金项目：') || line.startsWith('收稿日期：')) {
        if (currentP) paragraphs.push(currentP);
        paragraphs.push('**' + line.substring(0, 5) + '** ' + line.substring(5));
        currentP = '';
        continue;
    }

    if (currentP) {
        currentP += line; // Merge without space for Chinese
    } else {
        currentP = line;
    }

    // Determine if we should flush
    if (endPunctuation.test(currentP) && currentP.length > 30) {
        // Just a heuristic, but let's try pushing it.
        // Actually, sometimes a sentence breaks at comma.
        // Let's rely on empty lines to break paragraphs mostly, OR strong punctuation.
    }
}
if (currentP) paragraphs.push(currentP);

// The above merging is too simple. A better approach for Chinese PDFs:
// If a line does NOT end with sentence-ending punctuation, merge it with the next line.

let finalMerged = [];
let tempLine = '';

for (let p of cleaned) {
    if (!p) {
        if (tempLine) {
            finalMerged.push(tempLine);
            tempLine = '';
        }
        finalMerged.push('');
        continue;
    }

    // Headings
    if (p.match(/^[一二三四五六七八九十]、/)) {
        if (tempLine) finalMerged.push(tempLine);
        finalMerged.push('## ' + p);
        tempLine = '';
        continue;
    }
    if (p.match(/^（[一二三四五六七八九十]）/)) {
        if (tempLine) finalMerged.push(tempLine);
        finalMerged.push('### ' + p);
        tempLine = '';
        continue;
    }

    if (p.startsWith('作者简介：') || p.startsWith('基金项目：')) {
        if (tempLine) finalMerged.push(tempLine);
        finalMerged.push('**' + p.substring(0, 5) + '** ' + p.substring(5));
        tempLine = '';
        continue;
    }

    if (tempLine) {
        tempLine += p;
    } else {
        tempLine = p; // Start new
    }

    // If it ends with period, question mark, exclamation, or right block bracket ] or ］
    if (tempLine.match(/[。！？］\]]$/)) {
        finalMerged.push(tempLine);
        tempLine = '';
    }
}
if (tempLine) finalMerged.push(tempLine);

// Post processing for citations and formatting
let postProcessed = finalMerged.map(line => {
    line = line.replace(/摘\s*要：/, '**摘要：**');
    line = line.replace(/关键词：/, '**关键词：**');
    return line;
});

const finalContent = frontmatter.join('\n') + '\n\n' + postProcessed.filter(l => l.trim() || l === '').join('\n');

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Processed to', filePath);
