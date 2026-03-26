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
            // Support bold, links, and citations
            const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|\^\[\d+\])/g);
            
            return parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={`bold-${i}`} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                }
                if (part.match(/^\[.*?\]\(.*?\)$/)) {
                    const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
                    if (match) {
                        const [, linkText, url] = match;
                        return (
                            <a 
                                key={`link-${i}`} 
                                href={url} 
                                className="text-accent hover:text-accent-hover underline transition-colors"
                                target={url.startsWith('http') ? '_blank' : undefined}
                                rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                                {linkText}
                            </a>
                        );
                    }
                }
                if (part.startsWith('^[') && part.endsWith(']')) {
                    const num = part.slice(2, -1);
                    return <sup key={`cite-${i}`} className="text-accent ml-0.5 text-xs">[{num}]</sup>;
                }
                return part;
            });
        };

        const flushBlocks = () => {
            if (currentParagraph.length > 0) {
                const text = currentParagraph.join('');
                if (text.trim()) {
                    elements.push(
                        <p key={`p-${key++}`} className="mb-6 leading-8 text-lg text-foreground font-serif tracking-wide text-justify">
                            {parseInline(text)}
                        </p>
                    );
                }
                currentParagraph = [];
            }
            if (inList) {
                elements.push(
                    <ul key={`ul-${key++}`} className="list-disc pl-8 mb-8 space-y-3 text-lg text-foreground font-serif tracking-wide">
                        {listItems}
                    </ul>
                );
                inList = false;
                listItems = [];
            }
            if (inQuote) {
                const text = quoteLines.join('');
                elements.push(
                    <blockquote key={`quote-${key++}`} className="border-l-4 border-border-hover bg-surface pl-6 py-5 pr-4 my-8 rounded-r-lg text-foreground-muted font-serif italic text-lg leading-relaxed relative">
                        {parseInline(text)}
                    </blockquote>
                );
                inQuote = false;
                quoteLines = [];
            }
        };

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('# ')) {
                flushBlocks();
                elements.push(
                    <h2 key={`h2-${key++}`} className="text-2xl font-bold font-serif tracking-wide mt-16 mb-8 text-foreground border-l-4 border-foreground pl-4 py-1">
                        {trimmed.slice(2)}
                    </h2>
                );
            } else if (trimmed.startsWith('### ')) {
                flushBlocks();
                elements.push(
                    <h3 key={`h3-${key++}`} className="text-xl font-bold font-serif tracking-wide mt-12 mb-6 text-foreground">
                        {trimmed.slice(4)}
                    </h3>
                );
            } else if (trimmed.startsWith('- ')) {
                flushBlocks();
                inList = true;
                listItems.push(
                    <li key={`li-${key++}`} className="pl-2">
                        {parseInline(trimmed.slice(2))}
                    </li>
                );
            } else if (trimmed.startsWith('> ')) {
                flushBlocks();
                inQuote = true;
                quoteLines.push(trimmed.slice(2));
            } else if (trimmed === '') {
                flushBlocks();
            } else {
                if (inList || inQuote) flushBlocks();
                currentParagraph.push(trimmed);
            }
        }
        flushBlocks();

        return elements;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <LanguageSwitcher />
            <header className="border-b border-border bg-background">
                <div className="max-w-4xl mx-auto px-8 py-6">
                    <Link href="/" className="inline-flex items-center text-foreground-muted hover:text-foreground transition">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        返回首页
                    </Link>
                </div>
            </header>

            <article className="max-w-4xl mx-auto px-8 py-12">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-serif font-bold text-foreground leading-tight mb-6">
                        {essay.metadata.title}
                    </h1>
                    <div className="flex items-center justify-center text-foreground-muted space-x-6 text-sm mb-8">
                        {essay.metadata.author && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {essay.metadata.author}
                            </div>
                        )}
                        {essay.metadata.date && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {essay.metadata.date}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full">
                    {renderMarkdown(essay.content)}
                </div>
            </article>

            <footer className="border-t border-border py-8 mt-24">
                <div className="max-w-4xl mx-auto px-8 text-center text-sm text-foreground-subtle space-y-2">
                    <p>最后更新: 2026-03-26 | 地点: 北京 | 部署版本: 145</p>
                    <p>联系方式：<a href="mailto:tictic.ta@gmail.com" className="hover:text-foreground-muted transition">tictic.ta@gmail.com</a></p>
                    <div className="mt-4">
                        <Link href="/" className="text-foreground-muted hover:text-foreground transition font-medium">返回首页</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
