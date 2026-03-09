import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { i18n, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { FeaturedPoem } from '@/components/FeaturedPoem';

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
    description: string;
    type: string;
    path: string;
    relatedEssays?: any[];
}

interface FeaturedPoemData {
    id: string;
    lines: string[];
    source: string;
    author?: string;
}

export async function generateStaticParams() {
    return i18n.locales
        .filter(locale => locale !== 'zh')
        .map((locale) => ({ lang: locale }));
}

async function getPoetInfo(locale: string): Promise<PoetInfo | null> {
    try {
        const poetPath = path.join(process.cwd(), `src/content/${locale}/poet.json`);
        const content = await fs.readFile(poetPath, 'utf8');
        return JSON.parse(content);
    } catch {
        // Fallback to Chinese
        try {
            const poetPath = path.join(process.cwd(), 'src/content/poet.json');
            const content = await fs.readFile(poetPath, 'utf8');
            return JSON.parse(content);
        } catch {
            return null;
        }
    }
}

async function getWorks(locale: string): Promise<{ books: Work[], essays: Work[] }> {
    try {
        const worksPath = path.join(process.cwd(), `src/content/${locale}/works.json`);
        const content = await fs.readFile(worksPath, 'utf8');
        return JSON.parse(content);
    } catch {
        try {
            const worksPath = path.join(process.cwd(), 'src/content/works.json');
            const content = await fs.readFile(worksPath, 'utf8');
            return JSON.parse(content);
        } catch {
            return { books: [], essays: [] };
        }
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

export default async function LangHome({ params }: { params: { lang: string } }) {
    const locale = params.lang as Locale;
    const dict = await getDictionary(locale);
    const poet = await getPoetInfo(locale);
    const { books } = await getWorks(locale);
    const featuredPoems = await getFeaturedPoems();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Language Switcher */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageSwitcher currentLocale={locale} />
            </div>

            {/* Hero Section */}
            <section className="max-w-5xl mx-auto px-8 pt-32 pb-20">
                <div className="text-center">
                    <h1 className="text-6xl font-serif font-bold text-gray-900 mb-12">
                        {poet?.name || dict.meta.poetName}
                    </h1>

                    <div className="max-w-2xl mx-auto min-h-[160px] flex items-center justify-center">
                        {featuredPoems.length > 0 ? (
                            <FeaturedPoem poems={featuredPoems} />
                        ) : (
                            <p className="text-gray-500 text-lg tracking-wider">
                                {dict.site.subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Bio Section */}
            <section className="max-w-3xl mx-auto px-8 pb-20">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">
                        {dict.home.poetBioTitle}
                    </h2>
                    <p className="font-serif text-gray-700 leading-relaxed text-lg">
                        {poet?.bio || dict.meta.poetBio}
                    </p>
                </div>
            </section>

            {/* Works Section */}
            <section className="max-w-5xl mx-auto px-8 pb-32">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
                    {dict.home.worksTitle}
                </h2>

                {/* Books */}
                {books.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xl font-sans font-semibold text-gray-700 mb-6 uppercase tracking-wider">
                            {dict.home.booksSection}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {books.map(book => (
                                <div key={book.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 p-8">
                                    <Link href={book.path} className="group block">
                                        <h4 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                            {book.title}
                                        </h4>
                                        <p className="text-gray-500 text-sm mb-4">{book.year}</p>
                                        <p className="text-gray-600 leading-relaxed">{book.description}</p>
                                    </Link>

                                    {book.relatedEssays && book.relatedEssays.length > 0 && (
                                        <div className="mt-6 pt-6 border-t-2 border-gray-200 bg-gray-50 -mx-8 -mb-8 px-8 pb-8 rounded-b-xl">
                                            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {dict.essay.relatedEssays}
                                            </p>
                                            <div className="space-y-2">
                                                {book.relatedEssays.map((essay: any) => (
                                                    <Link
                                                        key={essay.id}
                                                        href={essay.path}
                                                        className="flex items-center text-sm text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded-lg transition"
                                                    >
                                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <span className="font-medium">{essay.title}</span>
                                                        <span className="text-gray-500 ml-2">/ {essay.author}</span>
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
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-5xl mx-auto px-8 text-center text-gray-500 text-sm">
                    <p>{dict.footer.copyright}</p>
                </div>
            </footer>
        </div>
    );
}
