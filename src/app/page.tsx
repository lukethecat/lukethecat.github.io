import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

import { FeaturedPoem } from '@/components/FeaturedPoem';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface PoetInfo {
    name: string;
    birthYear: string;
    bio: string;
}

interface Work {
    id: string;
    title: string;
    year?: string;
    author?: string;
    date?: string;
    sourceLink?: string;
    description: string;
    type: string;
    path: string;
    relatedEssays?: any[]; // Keep flexible or define strict structure
}

interface FeaturedPoemData {
    id: string;
    lines: string[];
    source: string;
    author?: string;
}

async function getPoetInfo(): Promise<PoetInfo | null> {
    try {
        const poetPath = path.join(process.cwd(), 'src/content/poet.json');
        const content = await fs.readFile(poetPath, 'utf8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

async function getWorks(): Promise<{ books: Work[], essays: Work[] }> {
    try {
        const worksPath = path.join(process.cwd(), 'src/content/works.json');
        const content = await fs.readFile(worksPath, 'utf8');
        return JSON.parse(content);
    } catch {
        return { books: [], essays: [] };
    }
}

async function getFeaturedPoems(): Promise<FeaturedPoemData[]> {
    try {
        const filePath = path.join(process.cwd(), 'src/content/featured_poems.json');
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch {
        return [];
    }
}

export default async function Home() {
    const poet = await getPoetInfo();
    const { books, essays } = await getWorks();
    const featuredPoems = await getFeaturedPoems();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Language Switcher */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: '李瑜诗歌数字档案馆',
                        alternateName: 'Li Yu Poetry Digital Archive',
                        url: 'https://www.liyupoetry.com',
                        description: '当代著名西部诗人李瑜作品全集数字档案馆',
                        inLanguage: ['zh-CN', 'en', 'de', 'ar', 'ug'],
                        about: {
                            '@type': 'Person',
                            name: '李瑜',
                            alternateName: 'Li Yu',
                            birthDate: '1939',
                            birthPlace: '重庆',
                            description: '当代著名西部诗人，新边塞诗代表人物',
                            knowsAbout: ['诗歌', '西部文学', '丝绸之路', '新疆'],
                        },
                    }),
                }}
            />

            {/* Hero Section */}
            <section className="max-w-5xl mx-auto px-8 pt-32 pb-20">
                <div className="text-center">
                    <h1 className="text-6xl font-serif font-bold text-foreground mb-12">
                        {poet?.name || '李瑜'}
                    </h1>

                    <div className="max-w-2xl mx-auto min-h-[160px] flex items-center justify-center">
                        {featuredPoems.length > 0 ? (
                            <FeaturedPoem poems={featuredPoems} />
                        ) : (
                            <p className="text-foreground-muted text-lg tracking-wider">
                                当代著名西部诗人
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Bio Section */}
            <section className="max-w-3xl mx-auto px-8 pb-20">
                <div className="bg-background rounded-2xl shadow-sm border border-border p-12">
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">
                        诗人小传
                    </h2>
                    <p className="font-serif text-foreground leading-relaxed text-lg">
                        {poet?.bio || '诗人信息加载中...'}
                    </p>
                </div>
            </section>

            {/* Works Section */}
            <section className="max-w-5xl mx-auto px-8 pb-32">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-12 text-center">
                    作品
                </h2>

                {/* Books */}
                {books.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xl font-sans font-semibold text-foreground mb-6 uppercase tracking-wider">
                            诗集
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {books.map(book => (
                                <div key={book.id} className="bg-background rounded-xl border border-border hover:border-border-hover hover:shadow-lg transition-all duration-300 p-8">
                                    <Link
                                        href={book.path}
                                        className="group block"
                                    >
                                        <h4 className="text-2xl font-serif font-bold text-foreground mb-2 group-hover:text-accent transition">
                                            {book.title}
                                        </h4>
                                        <p className="text-foreground-muted text-sm mb-4">{book.year}</p>
                                        <p className="text-foreground-muted leading-relaxed">
                                            {book.description}
                                        </p>
                                    </Link>

                                    {/* Related Essays */}
                                    {book.relatedEssays && book.relatedEssays.length > 0 && (
                                        <div className="mt-6 pt-6 border-t-2 border-border bg-surface -mx-8 -mb-8 px-8 pb-8 rounded-b-xl">
                                            <p className="text-sm font-semibold text-foreground mb-4 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                相关文章
                                            </p>
                                            <div className="space-y-2">
                                                {book.relatedEssays.map((essay: any) => (
                                                    <Link
                                                        key={essay.id}
                                                        href={essay.path}
                                                        className="flex items-center text-sm text-foreground hover:text-accent hover:bg-background px-3 py-2 rounded-lg transition"
                                                    >
                                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <span className="font-medium">{essay.title}</span>
                                                        <span className="text-foreground-muted ml-2">/ {essay.author}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Essays */}
                {essays.length > 0 && (
                    <div>
                        <h3 className="text-xl font-sans font-semibold text-foreground mb-6 uppercase tracking-wider flex items-center">
                            <svg className="w-5 h-5 mr-2 text-foreground-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" />
                            </svg>
                            研究与评论
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {essays.map(essay => (
                                <Link
                                    key={essay.id}
                                    href={essay.path}
                                    className="group block bg-background rounded-xl border border-border hover:border-border-hover hover:shadow-md transition-all duration-300 p-6 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-bg group-hover:bg-accent-bg0 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-serif font-bold text-foreground group-hover:text-accent transition line-clamp-2 pr-4">
                                            {essay.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center text-xs text-foreground-muted mb-4 space-x-3">
                                        <span className="flex items-center">
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {essay.author}
                                        </span>
                                        {essay.date && (
                                            <span className="flex items-center">
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {essay.date}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-foreground-muted text-sm leading-relaxed line-clamp-3">
                                        {essay.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12">
                <div className="max-w-5xl mx-auto px-8 flex flex-col items-center justify-center space-y-2 text-foreground-subtle text-xs">
                    <p>李瑜诗歌数字档案馆</p>
                    <p>最后更新: 2026-03-25 | 地点: 北京 | 部署版本: 144</p>
                    <p>联系方式：<a href="mailto:tictic.ta@gmail.com" className="hover:text-foreground-muted transition">tictic.ta@gmail.com</a></p>
                </div>
            </footer>
        </div>
    );
}
