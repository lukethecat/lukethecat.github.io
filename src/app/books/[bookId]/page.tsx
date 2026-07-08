import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { Book } from '@/lib/types';
import { BookLayout } from '@/components/BookLayout';
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
    const contentPath = path.join(process.cwd(), 'src/content');
    try {
        const items = await fs.readdir(contentPath, { withFileTypes: true });
        const exclude = ['ar', 'de', 'en', 'ug', 'essays'];

        return items
            .filter(item => item.isDirectory() && !exclude.includes(item.name))
            .map(item => ({ bookId: item.name }));
    } catch (error) {
        console.error('Failed to generate static params for books:', error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ bookId: string }> }): Promise<Metadata> {
    const { bookId } = await params;
    const book = await getBook(bookId);
    if (!book) {
        return {
            title: '诗集未找到',
        };
    }

    return {
        title: book.title,
        description: book.description || `阅读李瑜诗集《${book.title}》全文。`,
        openGraph: {
            title: book.title,
            description: book.description || `阅读李瑜诗集《${book.title}》全文。`,
            type: 'book',
        }
    };
}

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
    const { bookId } = await params;
    const book = await getBook(bookId);

    if (!book) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-2xl font-bold">Book Not Found</h1>
                <p className="mt-4">The book "{bookId}" does not exist.</p>
            </main>
        );
    }

    return (
        <BookLayout book={book}>
            <div className="max-w-4xl mx-auto pb-32">
                <header className="pt-24 pb-12 px-8 text-center border-b border-border mb-12">
                    <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4 tracking-wide">{book.title}</h1>
                </header>

                {book.chapters && book.chapters.length > 0 ? (
                    book.chapters.map(chapter => (
                        <div key={chapter.id} className="mb-24 px-4">
                            <h2 className="text-lg md:text-xl font-serif font-medium text-foreground-subtle tracking-widest pl-8 mb-8 border-l-4 border-border">
                                {chapter.title}
                            </h2>
                            {chapter.poems && chapter.poems.map(poem => (
                                <PoemView key={poem.id} chapter={chapter} poem={poem} book={book} />
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-foreground-subtle font-serif">
                        <p>暂无诗歌章节内容</p>
                    </div>
                )}
            </div>
        </BookLayout>
    );
}
