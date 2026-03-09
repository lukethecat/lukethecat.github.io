import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { i18n, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface EssayFrontmatter {
    title?: string;
    author?: string;
    date?: string;
    bookTitle?: string;
}

function extractFrontmatter(content: string): { frontmatter: EssayFrontmatter; body: string } {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: content };

    const frontmatterStr = match[1];
    const body = match[2];
    const frontmatter: EssayFrontmatter = {};
    frontmatterStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
            (frontmatter as any)[key.trim()] = value;
        }
    });
    return { frontmatter, body };
}

function renderMarkdown(body: string): string {
    return body
        .replace(/^### (.+)$/gm, '<h3 class="text-xl font-serif font-bold text-gray-900 mt-8 mb-4">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-serif font-bold text-gray-900 mt-12 mb-6">$1</h2>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-200 pl-4 my-4 text-gray-600 italic">$1</blockquote>')
        .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-700">')
        .replace(/^/, '<p class="mb-4 leading-relaxed text-gray-700">')
        .replace(/$/, '</p>');
}

const essayIds = [
    'hanxuema-introduction',
    'hanxuema-preface',
    'hanxuema-afterword',
    'hanxuema-publication',
    'zhungaer-preface',
    'zhungaer-afterword',
];

export async function generateStaticParams() {
    const params = [];
    for (const locale of i18n.locales.filter(l => l !== 'zh')) {
        for (const essayId of essayIds) {
            params.push({ lang: locale, essayId });
        }
    }
    return params;
}

export default async function LangEssayPage({ params }: { params: { lang: string; essayId: string } }) {
    const locale = params.lang as Locale;
    const dict = await getDictionary(locale);

    // Read the original Chinese essay
    const essayPath = path.join(process.cwd(), `src/content/essays/${params.essayId}.md`);
    let content: string;
    try {
        content = await fs.readFile(essayPath, 'utf8');
    } catch {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-2xl font-bold">Essay Not Found</h1>
            </main>
        );
    }

    const { frontmatter, body } = extractFrontmatter(content);
    const htmlContent = renderMarkdown(body);

    return (
        <div className="min-h-screen bg-white">
            {/* Language Switcher */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageSwitcher currentLocale={locale} />
            </div>

            <article className="max-w-3xl mx-auto px-8 py-24">
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-12 text-sm transition"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {dict.essay.backToHome}
                </Link>

                <header className="mb-12 pb-8 border-b border-gray-100">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                        {frontmatter.title || params.essayId}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                        {frontmatter.author && <span>{frontmatter.author}</span>}
                        {frontmatter.bookTitle && (
                            <span className="text-gray-300">·</span>
                        )}
                        {frontmatter.bookTitle && <span>{frontmatter.bookTitle}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{dict.book.originalText}</p>
                </header>

                <div
                    className="prose prose-gray max-w-none font-serif"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </article>

            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-3xl mx-auto px-8 text-center text-gray-500 text-sm">
                    <p>{dict.footer.copyright}</p>
                </div>
            </footer>
        </div>
    );
}
