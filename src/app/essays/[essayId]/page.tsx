import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

interface Essay {
    title: string;
    author: string;
}

async function getEssay(essayId: string): Promise<{ content: string, metadata: Essay } | null> {
    try {
        const markdownPath = path.join(process.cwd(), `src/content/essays/${essayId}.md`);
        let content = await fs.readFile(markdownPath, 'utf8');

        // Parse and remove frontmatter
        let title = '未命名文章';
        let author = '佚名';

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
                author
            }
        };
    } catch (error) {
        console.warn(`Essay ${essayId} not found`, error);
        return null;
    }
}

export async function generateStaticParams() {
    return [
        { essayId: 'hanxuema-introduction' },
        { essayId: 'hanxuema-preface' },
        { essayId: 'hanxuema-afterword' },
        { essayId: 'hanxuema-publication' }
    ];
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

    // Simple markdown rendering (headings and paragraphs)
    const renderMarkdown = (md: string) => {
        const lines = md.split('\n');
        const elements: JSX.Element[] = [];
        let currentParagraph: string[] = [];
        let key = 0;

        const flushParagraph = () => {
            if (currentParagraph.length > 0) {
                const text = currentParagraph.join('\n');
                if (text.trim()) {
                    elements.push(
                        <p key={`p-${key++}`} className="mb-6 leading-relaxed">
                            {text.trim()}
                        </p>
                    );
                }
                currentParagraph = [];
            }
        };

        for (const line of lines) {
            // H1
            if (line.startsWith('# ')) {
                flushParagraph();
                elements.push(
                    <h1 key={`h1-${key++}`} className="text-4xl font-serif font-bold mb-8 text-center">
                        {line.substring(2)}
                    </h1>
                );
            }
            // H2
            else if (line.startsWith('## ')) {
                flushParagraph();
                elements.push(
                    <h2 key={`h2-${key++}`} className="text-3xl font-serif font-bold mt-16 mb-6">
                        {line.substring(3)}
                    </h2>
                );
            }
            // Bold author line
            else if (line.includes('**作者')) {
                flushParagraph();
                const match = line.match(/\*\*作者[：:]\s*(.+?)\*\*/);
                if (match) {
                    elements.push(
                        <p key={`author-${key++}`} className="text-center text-gray-600 mb-12 text-lg">
                            作者：{match[1]}
                        </p>
                    );
                }
            }
            // Empty line
            else if (line.trim() === '') {
                flushParagraph();
            }
            // Regular text
            else {
                currentParagraph.push(line);
            }
        }

        flushParagraph();
        return elements;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
            <article className="max-w-4xl mx-auto px-8 py-16">
                <div className="prose prose-lg max-w-none">
                    <div className="text-gray-800 font-serif text-lg">
                        {renderMarkdown(essay.content)}
                    </div>
                </div>
            </article>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 mt-24">
                <div className="max-w-4xl mx-auto px-8 text-center">
                    <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
                        返回首页
                    </Link>
                </div>
            </footer>
        </div>
    );
}
