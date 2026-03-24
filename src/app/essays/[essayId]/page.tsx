import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface Essay {
    title: string;
    author: string;
    date?: string;
    sourceLink?: string;
}

async function getEssay(essayId: string): Promise<{ content: string, metadata: Essay } | null> {
    try {
        const markdownPath = path.join(process.cwd(), `src/content/essays/${essayId}.md`);
        let content = await fs.readFile(markdownPath, 'utf8');

        // Parse and remove frontmatter
        let title = '未命名文章';
        let author = '佚名';
        let date: string | undefined;
        let sourceLink: string | undefined;

        if (content.startsWith('---')) {
            const frontmatterEnd = content.indexOf('---', 3);
            if (frontmatterEnd !== -1) {
                const frontmatter = content.substring(3, frontmatterEnd);
                content = content.substring(frontmatterEnd + 3).trim();

                // Extract title from frontmatter
                const titleMatch = frontmatter.match(/title:\s*["'](.+?)["']/);
                if (titleMatch) title = titleMatch[1];

                // Extract author from frontmatter  
                const authorMatch = frontmatter.match(/author:\s*["'](.+?)["']/);
                if (authorMatch && authorMatch[1]) author = authorMatch[1];

                // Extract date from frontmatter
                const dateMatch = frontmatter.match(/date:\s*["'](.+?)["']/);
                if (dateMatch && dateMatch[1]) date = dateMatch[1];

                // Extract sourceLink from frontmatter
                const sourceLinkMatch = frontmatter.match(/sourceLink:\s*["'](.+?)["']/);
                if (sourceLinkMatch && sourceLinkMatch[1]) sourceLink = sourceLinkMatch[1];
            }
        }

        // Also try to extract from markdown content if not found
        if (title === '未命名文章') {
            const titleMatch = content.match(/^# (.+)$/m);
            if (titleMatch) title = titleMatch[1];
        }

        if (author === '佚名') {
            const authorMatch = content.match(/\*\*作者[：:]\s*(.+?)\*\*/);
            if (authorMatch) author = authorMatch[1];
        }

        return {
            content,
            metadata: {
                title,
                author,
                date,
                sourceLink
            }
        };
    } catch (error) {
        console.warn(`Essay ${essayId} not found`, error);
        return null;
    }
}

export async function generateStaticParams() {
    const essaysPath = path.join(process.cwd(), 'src/content/essays');
    try {
        const files = await fs.readdir(essaysPath);
        return files
            .filter(file => file.endsWith('.md') || file.endsWith('.json'))
            .map(file => ({ essayId: file.replace(/\.(md|json)$/, '') }));
    } catch (error) {
        console.error('Failed to generate static params for essays:', error);
        return [];
    }
}


export default async function EssayPage({ params }: { params: { essayId: string } }) {
    const essay = await getEssay(params.essayId);

    if (!essay) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-2xl font-bold">文章未找到</h1>
                <p className="mt-4">文章 "{params.essayId}" 不存在。</p>
            </main>
        );
    }

    const renderMarkdown = (md: string) => {
        const lines = md.split('\n');
        const elements: JSX.Element[] = [];
        let currentParagraph: string[] = [];
        let inList = false;
        let listItems: JSX.Element[] = [];
        let inQuote = false;
        let quoteLines: string[] = [];
        let key = 0;

        const parseInline = (text: string) => {
            const citeRegex = /\^\[(\d+)\]/g;
            const parts = text.split(/(\*\*.*?\*\*|\^\[\d+\])/g);
            
            return parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={`bold-${i}`} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('^[') && part.endsWith(']')) {
                    const num = part.slice(2, -1);
                    return <sup key={`cite-${i}`} className="text-blue-600 ml-0.5 text-xs">[{num}]</sup>;
                }
                return part;
            });
        };

        const flushBlocks = () => {
            if (currentParagraph.length > 0) {
                const text = currentParagraph.join('');
                if (text.trim()) {
                    elements.push(
                        <p key={`p-${key++}`} className="mb-6 leading-8 text-lg text-gray-800 font-serif tracking-wide text-justify">
                            {parseInline(text)}
                        </p>
                    );
                }
                currentParagraph = [];
            }
            if (inList) {
                elements.push(
                    <ul key={`ul-${key++}`} className="list-disc pl-8 mb-8 space-y-3 text-lg text-gray-800 font-serif tracking-wide">
                        {listItems}
                    </ul>
                );
                inList = false;
                listItems = [];
            }
            if (inQuote) {
                const text = quoteLines.join('');
                elements.push(
                    <blockquote key={`quote-${key++}`} className="border-l-4 border-gray-400 bg-gray-50 pl-6 py-5 pr-4 my-8 rounded-r-lg text-gray-600 font-serif italic text-lg leading-relaxed relative">
                        {parseInline(text)}
                    </blockquote>
                );
                inQuote = false;
                quoteLines = [];
            }
        };

        for (const line of lines) {
            const trimmed = line.trim();

            if (line.startsWith('# ')) {
                flushBlocks();
                elements.push(
                    <h1 key={`h1-${key++}`} className="text-3xl sm:text-4xl mt-12 mb-8 font-serif font-bold text-gray-900 text-center leading-tight">
                        {parseInline(line.substring(2))}
                    </h1>
                );
            } else if (line.startsWith('## ')) {
                flushBlocks();
                elements.push(
                    <h2 key={`h2-${key++}`} className="text-2xl font-bold font-serif tracking-wide mt-16 mb-8 text-gray-900 border-l-4 border-gray-900 pl-4 py-1">
                        {parseInline(line.substring(3))}
                    </h2>
                );
            } else if (line.startsWith('### ')) {
                flushBlocks();
                elements.push(
                    <h3 key={`h3-${key++}`} className="text-xl font-bold font-serif tracking-wide mt-12 mb-6 text-gray-800">
                        {parseInline(line.substring(4))}
                    </h3>
                );
            } else if (line.startsWith('> ')) {
                if (currentParagraph.length > 0 || inList) flushBlocks();
                inQuote = true;
                quoteLines.push(line.substring(2));
            } else if (trimmed.match(/^[-*]\s/)) {
                if (currentParagraph.length > 0 || inQuote) flushBlocks();
                inList = true;
                listItems.push(<li key={`li-${key++}`}>{parseInline(trimmed.substring(2))}</li>);
            } else if (trimmed.match(/^\d+\.\s/)) {
                if (currentParagraph.length > 0 || inQuote) flushBlocks();
                inList = true;
                listItems.push(<li key={`li-${key++}`} className="list-decimal">{parseInline(trimmed.replace(/^\d+\.\s/, ''))}</li>);
            } else if (line.includes('**作者：**') || line.includes('**基金项目：**') || line.includes('**作者简介：**')) {
                flushBlocks();
                elements.push(
                    <div key={`meta-${key++}`} className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md mb-6 border border-gray-100 font-sans">
                        {parseInline(line)}
                    </div>
                );
            } else if (trimmed === '') {
                flushBlocks();
            } else {
                if (inQuote) {
                    quoteLines.push(line);
                } else {
                    currentParagraph.push(line);
                }
            }
        }
        flushBlocks();

        return elements;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Language Switcher */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Header */}
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-4xl mx-auto px-8 py-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        返回首页
                    </Link>
                </div>
            </header>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-8 py-12">
                
                {/* Essay Header Info */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 leading-tight mb-6">
                        {essay.metadata.title}
                    </h1>
                    <div className="flex items-center justify-center text-gray-500 space-x-6 text-sm mb-8">
                        {essay.metadata.author && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {essay.metadata.author}
                            </div>
                        )}
                        {essay.metadata.date && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {essay.metadata.date}
                            </div>
                        )}
                    </div>
                    {essay.metadata.sourceLink && (
                        <a
                            href={essay.metadata.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 text-sm font-medium shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            查看原版 PDF
                        </a>
                    )}
                </div>

                <div className="w-full">
                    {renderMarkdown(essay.content)}
                </div>
            </article>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 mt-24">
                <div className="max-w-4xl mx-auto px-8 text-center text-sm text-gray-400 space-y-2">
                    <p>最后更新: 2026-03-24 | 地点: 北京 | 部署版本: 142</p>
                    <p>联系方式：<a href="mailto:tictic.ta@gmail.com" className="hover:text-gray-600 transition">tictic.ta@gmail.com</a></p>
                    <div className="mt-4">
                        <Link href="/" className="text-gray-600 hover:text-gray-900 transition font-medium">
                            返回首页
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
