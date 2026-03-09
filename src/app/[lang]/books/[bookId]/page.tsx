import { promises as fs } from 'fs';
import path from 'path';
import { Book } from '@/lib/types';
import { i18n, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { BookLayout } from '@/components/BookLayout';
import { PoemView } from '@/components/PoemView';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

async function getBook(bookId: string): Promise<Book | null> {
    const jsonPath = path.join(process.cwd(), `src/content/${bookId}/book.json`);
    try {
        const fileContents = await fs.readFile(jsonPath, 'utf8');
        return JSON.parse(fileContents) as Book;
    } catch (error) {
        console.warn(`Book ${bookId} not found or invalid`, error);
        return null;
    }
}

export async function generateStaticParams() {
    const bookIds = ['hanxuema1995', 'zhungaer1984'];
    const params = [];
    for (const locale of i18n.locales.filter(l => l !== 'zh')) {
        for (const bookId of bookIds) {
            params.push({ lang: locale, bookId });
        }
    }
    return params;
}

export default async function LangBookPage({ params }: { params: { lang: string; bookId: string } }) {
    const locale = params.lang as Locale;
    const dict = await getDictionary(locale);
    const book = await getBook(params.bookId);

    if (!book) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-2xl font-bold">Book Not Found</h1>
            </main>
        );
    }

    return (
        <BookLayout book={book}>
            {/* Language Switcher */}
            <div className="fixed top-4 right-4 z-50">
                <LanguageSwitcher currentLocale={locale} />
            </div>

            <div className="max-w-4xl mx-auto pb-32">
                <header className="pt-24 pb-12 px-8 text-center border-b border-gray-100 mb-12">
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{book.title}</h1>
                    <p className="text-sm text-gray-400 font-sans">
                        {dict.book.originalText} · {book.author} / {book.year}
                    </p>
                </header>

                {book.chapters.map(chapter => (
                    <div key={chapter.id} className="mb-24 px-4">
                        <h2 className="text-xl font-sans font-bold text-gray-300 uppercase tracking-widest pl-8 mb-8 border-l-4 border-gray-100">
                            {chapter.title}
                        </h2>
                        {chapter.poems.map(poem => (
                            <PoemView key={poem.id} chapter={chapter} poem={poem} book={book} />
                        ))}
                    </div>
                ))}
            </div>
        </BookLayout>
    );
}
