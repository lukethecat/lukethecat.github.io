import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

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

export default async function Home() {
    const poet = await getPoetInfo();
    const { books, essays } = await getWorks();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="max-w-5xl mx-auto px-8 pt-32 pb-20">
                <div className="text-center">
                    <h1 className="text-6xl font-serif font-bold text-gray-900 mb-4">
                        {poet?.name || '李瑜'}
                    </h1>
                    <p className="text-gray-500 text-lg tracking-wider">
                        当代著名西部诗人
                    </p>
                </div>
            </section>

            {/* Bio Section */}
            <section className="max-w-3xl mx-auto px-8 pb-20">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">
                        诗人小传
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                        {poet?.bio || '诗人信息加载中...'}
                    </p>
                </div>
            </section>

            {/* Works Section */}
            <section className="max-w-5xl mx-auto px-8 pb-32">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
                    作品
                </h2>

                {/* Books */}
                {books.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xl font-sans font-semibold text-gray-700 mb-6 uppercase tracking-wider">
                            诗集
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {books.map(book => (
                                <Link
                                    key={book.id}
                                    href={book.path}
                                    className="group block bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 p-8"
                                >
                                    <h4 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                        {book.title}
                                    </h4>
                                    <p className="text-gray-500 text-sm mb-4">{book.year}</p>
                                    <p className="text-gray-600 leading-relaxed">
                                        {book.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Essays */}
                {essays.length > 0 && (
                    <div>
                        <h3 className="text-xl font-sans font-semibold text-gray-700 mb-6 uppercase tracking-wider">
                            文章 · 序言
                        </h3>
                        <div className="space-y-4">
                            {essays.map(essay => (
                                <Link
                                    key={essay.id}
                                    href={essay.path}
                                    className="group block bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-300 p-6"
                                >
                                    <h4 className="text-xl font-serif font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                                        {essay.title}
                                    </h4>
                                    <p className="text-gray-500 text-sm mb-3">作者：{essay.author}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {essay.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8">
                <div className="max-w-5xl mx-auto px-8 text-center text-gray-500 text-sm">
                    <p>李瑜诗歌数字档案馆</p>
                </div>
            </footer>
        </div>
    );
}
