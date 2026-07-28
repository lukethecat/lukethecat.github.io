import * as fs from 'fs';
import * as path from 'path';

interface AuditIssue {
    bookId: string;
    lineNum: number;
    issueType: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    description: string;
    context: string;
}

const BOOKS_DIR = path.join(process.cwd(), 'books');

// Books that are essays/theses, not poetry collections — skip poem-specific checks
const ESSAY_BOOKS = ['essay1', 'essay2', 'essay3', 'essay4_zhangqiuge'];

// Known poem counts per book (absolute truth from physical publications)
const EXPECTED_POEM_COUNTS: Record<string, number> = {
    heiyingsushangjuan1998: 101,
    heiyingsuxiajuan1998: 101,
    hanxuema1995: 101,
    weileaiqingbagedabuxianyuan1991: 99,
    zhungaer1984: 69,
};

// Strict match: standalone date/location line that is ONLY a creation metadata
// Must end with 2-6 Chinese chars (the location), preceded by a date.
// Exclude lines where date is embedded in poetic context (e.g. "一九七九年二月二十二日日晕么")
const CREATION_METADATA_REGEX = /^(?:一九|二〇)[〇一二三四五六七八九十0-9]+年[一二三四五六七八九十0-9]+月(?:[一二三四五六七八九十0-9]+日)?(?:修改)?\s+[\u4e00-\u9fa5]{2,6}$/;

// OCR English artifact: single English letter(s) directly adjacent to Chinese
const OCR_ARTIFACT_REGEX = /(?<![A-Za-z])[a-zA-Z]{1,2}[\u4e00-\u9fa5]/;

// Known intentional English+Chinese patterns (not OCR errors)
const INTENTIONAL_ENGLISH_PATTERNS = [
    'A字路标', 'A点', 'B角', 'A角', 'ISBN', 'http', 'xx出版社',
];

function isPublicationLine(line: string): boolean {
    const pubPrefixes = [
        '封面题签', '扉页题签', '装帧设计', '责任编辑',
        '黑罂粟', '新疆大学出版社', '新华书店', '乌鲁木齐',
        '开本', '印数', 'ISBN', '1998年', '定价',
        '新疆人民出版社', '人民文学出版社',
    ];
    return pubPrefixes.some(p => line.startsWith(p));
}

function auditAllBooks() {
    console.log('══════════════════════════════════════════════════════════');
    console.log('  Full-Site Layout & Structural Audit — Harness Loop');
    console.log('══════════════════════════════════════════════════════════\n');

    if (!fs.existsSync(BOOKS_DIR)) {
        console.error('ERROR: books directory not found.');
        process.exit(1);
    }

    const bookFolders = fs.readdirSync(BOOKS_DIR).filter(f =>
        fs.statSync(path.join(BOOKS_DIR, f)).isDirectory()
    );

    const issues: AuditIssue[] = [];

    for (const bookId of bookFolders) {
        const isEssay = ESSAY_BOOKS.includes(bookId);
        const mdPath = path.join(BOOKS_DIR, bookId, 'source.md');
        if (!fs.existsSync(mdPath)) continue;

        const content = fs.readFileSync(mdPath, 'utf-8');
        const lines = content.split('\n');

        // ─── Dimension 1: Poem Count from ### headers ───
        // Use range-based section mapping: first find all ## sections and their ranges,
        // then classify each ### header based on which ## section it falls in.
        const NON_POEM_SECTIONS = /^(?:序$|跋|后记|出版信息|目录|作者小传|内容简介|李瑜传略|开拓精神万岁)/;

        // Build section ranges: [{name, startLine, endLine, isPoem}]
        const sections: { name: string; start: number; isPoemSection: boolean }[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('## ')) {
                const sectionName = line.slice(3).trim();
                sections.push({
                    name: sectionName,
                    start: i,
                    isPoemSection: !NON_POEM_SECTIONS.test(sectionName),
                });
            }
        }

        // Determine if a line is in a poem section
        function isInPoemSection(lineIdx: number): boolean {
            // Find the last ## section before this line
            let lastSection: { isPoemSection: boolean } | null = null;
            for (const sec of sections) {
                if (sec.start <= lineIdx) {
                    lastSection = sec;
                } else {
                    break;
                }
            }
            return lastSection?.isPoemSection ?? false;
        }

        const poemTitles: { lineNum: number; title: string }[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('### ') && !line.startsWith('### 目录') && !line.startsWith('### 后记')) {
                if (isInPoemSection(i)) {
                    poemTitles.push({ lineNum: i + 1, title: line.slice(4) });
                }
            }
        }

        if (!isEssay && EXPECTED_POEM_COUNTS[bookId]) {
            const expected = EXPECTED_POEM_COUNTS[bookId];
            if (poemTitles.length !== expected) {
                issues.push({
                    bookId, lineNum: 0,
                    issueType: 'POEM_COUNT_MISMATCH',
                    severity: 'ERROR',
                    description: `Expected ${expected} poems but found ${poemTitles.length} ### headers.`,
                    context: `Missing or extra poems detected. First 5 titles: ${poemTitles.slice(0, 5).map(t => t.title).join('; ')}`,
                });
            }
        }

        // ─── Dimension 2: Date-metadata followed by stray text ───
        let lastDateIdx = -1;
        let lastDateText = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Only match standalone creation metadata (date + space + location)
            if (CREATION_METADATA_REGEX.test(line)) {
                lastDateIdx = i;
                lastDateText = line;
                continue;
            }

            if (lastDateIdx !== -1 && i > lastDateIdx) {
                if (line.startsWith('### ') || line.startsWith('## ')) {
                    lastDateIdx = -1;
                    lastDateText = '';
                    continue;
                }
                if (!line || /^\[p\d+\]$/.test(line) || line === '***' || isPublicationLine(line)) {
                    continue;
                }
                // Real anomaly: stray poem text after date metadata
                issues.push({
                    bookId, lineNum: lastDateIdx + 1,
                    issueType: 'DATE_FOLLOWED_BY_TEXT',
                    severity: 'ERROR',
                    description: `Date metadata followed by stray text before next ### header.`,
                    context: `Date L${lastDateIdx + 1}: "${lastDateText}" → Stray L${i + 1}: "${line}"`,
                });
                lastDateIdx = -1;
                lastDateText = '';
            }
        }

        // ─── Dimension 3: Duplicate adjacent poem titles ───
        for (let i = 1; i < poemTitles.length; i++) {
            if (poemTitles[i].title === poemTitles[i - 1].title) {
                issues.push({
                    bookId, lineNum: poemTitles[i].lineNum,
                    issueType: 'DUPLICATE_TITLE',
                    severity: 'ERROR',
                    description: `Duplicate adjacent poem title.`,
                    context: `"${poemTitles[i].title}" at L${poemTitles[i - 1].lineNum} and L${poemTitles[i].lineNum}`,
                });
            }
        }

        // ─── Dimension 4: Empty poems (### header immediately followed by next ###) ───
        for (let i = 0; i < poemTitles.length - 1; i++) {
            const startLine = poemTitles[i].lineNum;
            const endLine = poemTitles[i + 1].lineNum;
            let hasContent = false;
            for (let j = startLine; j < endLine - 1; j++) {
                const l = lines[j].trim();
                if (l && !l.startsWith('[p') && l !== '***') {
                    hasContent = true;
                    break;
                }
            }
            if (!hasContent) {
                issues.push({
                    bookId, lineNum: startLine,
                    issueType: 'EMPTY_POEM',
                    severity: 'ERROR',
                    description: `Poem has no content between its title and the next title.`,
                    context: `"${poemTitles[i].title}" at L${startLine}`,
                });
            }
        }

        // ─── Dimension 5: Page number monotonicity (from [pN] markers) ───
        let lastPage = -1;
        for (let i = 0; i < lines.length; i++) {
            const m = lines[i].trim().match(/^\[p(\d+)\]$/);
            if (m) {
                const pageNum = parseInt(m[1], 10);
                if (lastPage !== -1 && pageNum < lastPage) {
                    issues.push({
                        bookId, lineNum: i + 1,
                        issueType: 'PAGE_ORDER_VIOLATION',
                        severity: 'ERROR',
                        description: `Page number decreased: [p${pageNum}] after [p${lastPage}].`,
                        context: `L${i + 1}: page ${pageNum} < previous page ${lastPage}`,
                    });
                }
                lastPage = pageNum;
            }
        }

        // ─── Dimension 6: Missing blank line before ### header ───
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim().startsWith('### ')) {
                const prevLine = lines[i - 1].trim();
                if (prevLine && prevLine !== '' && !/^\[p\d+\]$/.test(prevLine) && prevLine !== '***') {
                    issues.push({
                        bookId, lineNum: i + 1,
                        issueType: 'MISSING_BLANK_BEFORE_HEADER',
                        severity: 'WARNING',
                        description: `No blank line before ### header.`,
                        context: `Prev L${i}: "${prevLine.slice(0, 60)}" → Header L${i + 1}: "${lines[i].trim().slice(0, 60)}"`,
                    });
                }
            }
        }

        // ─── Dimension 7: OCR English artifacts (genuine, not intentional) ───
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('http') || line.includes('ISBN')) continue;
            const m = line.match(OCR_ARTIFACT_REGEX);
            if (m) {
                const isIntentional = INTENTIONAL_ENGLISH_PATTERNS.some(p => line.includes(p));
                if (!isIntentional) {
                    issues.push({
                        bookId, lineNum: i + 1,
                        issueType: 'OCR_ENGLISH_ARTIFACT',
                        severity: 'WARNING',
                        description: `Possible OCR artifact: English letter adjacent to Chinese.`,
                        context: `L${i + 1}: "${line.slice(0, 80)}" (matched: "${m[0]}")`,
                    });
                }
            }
        }
    }

    // ─── Report ───
    const errors = issues.filter(i => i.severity === 'ERROR');
    const warnings = issues.filter(i => i.severity === 'WARNING');

    console.log(`\n📊 Audit Results: ${errors.length} ERROR(s), ${warnings.length} WARNING(s)\n`);

    if (errors.length > 0) {
        console.log('═══ ERRORS (must fix) ═══');
        for (const iss of errors) {
            console.log(`  ❌ [${iss.issueType}] ${iss.bookId} L${iss.lineNum}`);
            console.log(`     ${iss.description}`);
            console.log(`     ${iss.context}\n`);
        }
    }

    if (warnings.length > 0) {
        console.log('═══ WARNINGS (review) ═══');
        for (const iss of warnings) {
            console.log(`  ⚠️  [${iss.issueType}] ${iss.bookId} L${iss.lineNum}`);
            console.log(`     ${iss.description}`);
            console.log(`     ${iss.context}\n`);
        }
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ All books passed structural audit with zero issues.');
    }

    return { errors: errors.length, warnings: warnings.length, issues };
}

auditAllBooks();
