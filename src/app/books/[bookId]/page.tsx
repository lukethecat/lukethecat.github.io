import { promises as fs } from 'fs';
import path from 'path';
import { Book } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { PoemView } from '@/components/PoemView';

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
    return [
        { bookId: 'hanxuema1995' },
        { bookId: 'zhungaer1984' }
    ];
}

export default async function BookPage({ params }: { params: { bookId: string } }) {
    const book = await getBook(params.bookId);

    if (!book) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-2xl font-bold">Book Not Found</h1>
                <p className="mt-4">The book "{params.bookId}" does not exist.</p>
            </main>
        );
    }

    return (
        <div className="flex min-h-screen bg-white text-gray-900">
            <Sidebar book={book} />
            <main className="flex-1 ml-80 min-h-screen bg-white">
                <div className="max-w-4xl mx-auto pb-32">
                    <header className="pt-24 pb-12 px-8 text-center border-b border-gray-100 mb-12">
                        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{book.title}</h1>
                        <p className="text-gray-500 font-sans tracking-wide uppercase text-sm">{book.author} / {book.year}</p>
                        {book.intro && <p className="mt-8 text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm">{book.intro.substring(0, 150)}...</p>}
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
            </main>
        </div>
    );
}
