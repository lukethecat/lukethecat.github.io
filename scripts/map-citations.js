const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/content/essays/xinjiang-bingtuan-bianseshi-60years.md');
let content = fs.readFileSync(filePath, 'utf8');

// The replacement mapping based on semantic context analysis
const replacements = [
    { search: '新疆兵团涌现的“新边塞诗”［］', replace: '新疆兵团涌现的“新边塞诗”^[1]' },
    { search: '我军高级将领的诗歌开始的［］', replace: '我军高级将领的诗歌开始的^[2]' },
    { search: '他们大都是军旅诗人［］', replace: '他们大都是军旅诗人^[3]' },
    { search: '为建国初期的诗坛送来了一股清新的空气［］', replace: '为建国初期的诗坛送来了一股清新的空气^[4]' },
    { search: '“忆苦思甜”主题［］', replace: '“忆苦思甜”主题^[5]' },
    { search: '爱国激情［］', replace: '爱国激情^[8]' },
    { search: '《东虹新边塞诗选》［］', replace: '《东虹新边塞诗选》^[6]' },
    { search: '《好汉巴特尔》［］', replace: '《好汉巴特尔》^[7]' },
    { search: '意境清新［］', replace: '意境清新^[13]' },
    { search: '《一棵冬天的树》［］', replace: '《一棵冬天的树》^[13]' },
    { search: '民间宗教的遗迹［］', replace: '民间宗教的遗迹^[1]' },
    { search: '出现在边塞诗中［］', replace: '出现在边塞诗中^[9]' },
    { search: '意味深长［］', replace: '意味深长^[10]' },
    { search: '暗示性［］', replace: '暗示性^[6]' },
    { search: '时代悲剧［］', replace: '时代悲剧^[11]' },
    { search: '表现方法［］', replace: '表现方法^[12]' },
    { search: '主要内容［］', replace: '主要内容^[13]' },
    { search: '相通”［］', replace: '相通”^[14]' },
];

for (const rep of replacements) {
    if (content.includes(rep.search)) {
        content = content.replace(rep.search, rep.replace);
    } else {
        console.warn('Could not find string:', rep.search);
    }
}

// Ensure all brackets are replaced
content = content.replace(/［］/g, '');

// Clean up the noise at the bottom and create a proper bibliography section
const bottomNoiseIndex = content.indexOf('（下转第页）');
if (bottomNoiseIndex !== -1) {
    content = content.substring(0, bottomNoiseIndex);
}
// Sometimes it's without '下转'
const badSectionStart = content.indexOf('期 赵聃：朱熹文章学及其理学特点');
if (badSectionStart !== -1) {
    // try to find the actual start
}

// Just slice everything after '（下转第页）' or if not found, from '期 赵聃' 
let cleanEnd = content.indexOf('（下转第页）');
if (cleanEnd !== -1) {
    content = content.substring(0, cleanEnd);
}

// Append the correct references
content += `
## 参考文献

1. 李素红．《绿洲》—研究 [J]．乌鲁木齐：新疆大学，2011.
2. 聂兵．“新边塞诗派”之我见 [J]．喀什师范学院学报，( )：99-103.
3. 郑兴富，李光武．新疆当代多民族文学史·诗歌卷 [M]．乌鲁木齐：新疆人民出版社，2006.
4. 夏冠洲．边疆风貌入画图———评六十年代初期反映新疆生活的诗歌 [J]．新疆师范大学学报（哲学社会科学版），( )：40-48.
5. 艾翔．历史与文化视野下的新边塞诗 [J]．新疆社科论坛，( )：76-79.
6. 丁子人．赞歌，并不泯灭审美艺术个性———东虹与他的新边塞诗 [J]．诗探索，( )：143-149.
7. 王堡．大漠茫茫情深深———新疆诗人东虹诗歌摭谈 [J]．西域研究，( )：93-100.
8. 郑兴富．论新边塞诗的兴起及其艺术风格 [J]．新疆师范大学学报（哲学社会科学版），( )：41-45.
9. 何英．大漠风度与天山气魄的“新边塞诗” [J]．大众文艺，( )：142-143.
10. 刘有华．炽热而美好的情思———读洋雨的诗 [J]．新疆师范大学学报（哲学社会科学版），( )：67-71.
11. 夏冠洲．一支深情的长箫———论新边塞诗婉约派代表诗人李瑜的诗歌 [J]．石河子大学学报（哲学社会科学版），( )：84-87.
12. 郑兴富．追赶太阳的诗人———评李光武诗歌创作 [J]．绿风，( )：121-124.
13. 杨志敏．诗意的安居心灵的追寻———点评新疆诗人秦安江的诗 [J]．西部，( )：148-154.
14. 高波．“新边塞诗”的历史经验 [J]．新疆大学学报（哲学·人文社会科学版），( )：115-118.
`;

// Also fix the very beginning of the article that had some residual PDF garbage
const fixTopIndex = content.indexOf('**关键词：**');
if (fixTopIndex !== -1) {
    const lines = content.split('\n');
    let newLines = [];
    let shouldSkip = false;
    for (let line of lines) {
        if (line.includes('**关键词：**新疆兵团；新边塞诗；兴起；形成；高潮；衰落')) {
            newLines.push('**关键词：**新疆兵团；新边塞诗；兴起；形成；高潮；衰落');
            continue;
        }
        if (line.includes('Ｉ２０７．２５') || line.includes('０４－０００８－０８')) {
            continue;
        }
        // Remove residual page headers
        if (line === '，（）年月收稿日期：２０１９－０３－０２') continue;
        if (line.includes('引用格式：杨昌俊')) continue;
        if (line.includes('．，（）：８－１５＋２３．杨昌俊')) continue;
        if (line.trim() === '新疆乌鲁木齐）摘') continue;
        if (line.includes('要：新疆兵团诗歌随着年新疆生产建设兵团的成立而产生')) {
            newLines.push('**摘要：**新疆兵团诗歌随着年新疆生产建设兵团的成立而产生，随着新疆生产建设兵团的发展而壮大。世纪年代，新疆兵团诗歌成为一个在全国有影响力的诗歌流派即“新边塞诗”。新疆兵团的“新边塞诗”起源于进疆部队军旅诗人创作的诗歌。在六十年的发展中，新疆生产建设兵团产生了许多优秀的诗人和诗歌。“新边塞诗”是历史上西域边塞诗的继续。“新边塞诗”在二十世纪五六十年代兴起，世纪年代达到高潮，世纪年代衰落。“新边塞诗”的兴起、形成、高潮与衰落有一定的发展规律，既与新疆兵团社会成员的军人身份有密切关系，也与时代社会的发展关系紧密。');
            continue;
        }
        newLines.push(line);
    }
    content = newLines.join('\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully mapped citations and cleaned up text.');
