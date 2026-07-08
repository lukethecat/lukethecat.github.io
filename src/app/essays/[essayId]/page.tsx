import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
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

export async function generateMetadata({ params }: { params: Promise<{ essayId: string }> }): Promise<Metadata> {
    const { essayId } = await params;
    const essay = await getEssay(essayId);
    if (!essay) {
        return {
            title: '文章未找到',
        };
    }

    const title = essay.metadata.title;
    const author = essay.metadata.author;
    const date = essay.metadata.date;
    const desc = `${author}撰写的关于李瑜及新边塞诗的研究文章。${date ? `发表于${date}。` : ''}`;

    return {
        title: title,
        description: desc,
        openGraph: {
            title: title,
            description: desc,
            type: 'article',
        }
    };
}


export default async function EssayPage({ params }: { params: Promise<{ essayId: string }> }) {
    const { essayId } = await params;
    const essay = await getEssay(essayId);

    if (!essay) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-2xl font-bold">文章未找到</h1>
                <p className="mt-4">文章 &quot;{params.essayId}&quot; 不存在。</p>
            </main>
        );
    }



    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-surface-elevated">
                <div className="max-w-3xl mx-auto px-6 md:px-8 py-6">
                    <Link href="/" className="inline-flex items-center text-foreground-muted hover:text-foreground transition text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        返回首页
                    </Link>
                </div>
            </header>

            <article className="max-w-3xl mx-auto px-6 md:px-8 py-12 md:py-16">
                <div className="text-center mb-14 md:mb-20 max-w-2xl mx-auto">
                    <h1 className="text-2xl md:text-4xl font-serif font-semibold text-foreground leading-tight mb-6 tracking-wide">
                        {essay.metadata.title}
                    </h1>
                    <div className="flex items-center justify-center text-foreground-muted space-x-6 text-sm mb-8 font-sans">
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
                    {/* Decorative separator */}
                    <div className="flex items-center justify-center space-x-3">
                        <div className="w-8 h-px bg-border-hover"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-border-hover"></div>
                        <div className="w-8 h-px bg-border-hover"></div>
                    </div>
                    <ReactMarkdown 
                        className="prose prose-lg prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-headings:tracking-wide prose-headings:text-foreground prose-p:font-serif prose-p:leading-[2.2] prose-p:text-justify prose-p:tracking-[0.04em] prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-blockquote:border-accent/40 prose-blockquote:font-kai prose-blockquote:italic prose-blockquote:text-foreground-muted prose-blockquote:bg-surface prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg"
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                    >{essay.content}</ReactMarkdown>
                </div>
            </article>

            {/* Footer */}
            <footer className="border-t border-border py-8 mt-24">
                <div className="max-w-3xl mx-auto px-6 md:px-8 text-center text-sm text-foreground-subtle space-y-2 font-sans">
                    <p className="mt-2 text-xs">最后更新: {process.env.NEXT_PUBLIC_GIT_LAST_DATE} | <a href="https://github.com/lukethecat/lukethecat.github.io" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">提交次数: {process.env.NEXT_PUBLIC_GIT_COMMIT_COUNT}</a> | 部署时间: {process.env.NEXT_PUBLIC_BUILD_TIME}</p>
                    <p>联系方式：<a href="mailto:tictic.ta@gmail.com" className="hover:text-foreground-muted transition">tictic.ta@gmail.com</a></p>
                    <div className="mt-4">
                        <Link href="/" className="text-foreground-muted hover:text-foreground transition font-medium">返回首页</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
