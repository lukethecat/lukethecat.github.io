import React from 'react';
import { Poem, Chapter, Book } from '@/lib/types';

interface PoemViewProps {
    chapter: Chapter;
    poem: Poem;
    book: Book;
}

export const PoemView: React.FC<PoemViewProps> = ({ chapter, poem, book }) => {
    return (
        <article id={poem.id} className="max-w-2xl mx-auto py-32 px-8 scroll-mt-12">
            {/* Poem Title */}
            <div className="mb-16">
                {poem.title.includes('／') ? (
                    <>
                        <h3 className="text-3xl font-bold text-gray-900 font-serif leading-relaxed">
                            {poem.title.split('／')[0]}
                        </h3>
                        <h3 className="text-3xl font-bold text-gray-500 font-serif leading-relaxed">
                            {poem.title.split('／')[1]}
                        </h3>
                    </>
                ) : (
                    <h3 className="text-3xl font-bold text-gray-900 font-serif leading-relaxed">
                        {poem.title}
                    </h3>
                )}
            </div>

            {/* Poem Content */}
            <div className="space-y-1 font-serif text-xl text-gray-800 leading-[2.2]">
                {poem.lines.map((line, index) => (
                    <p key={index} className={`min-h-[1.5em] ${line === '' || !line.trim() ? 'h-6' : ''}`}>
                        {line}
                    </p>
                ))}
            </div>

            {/* Enhanced Meta Information */}
            <div className="mt-20 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-500 font-sans">
                    <span>《{book.title}》 · {chapter.title}</span>
                    {poem.pageNumber && <span>页码 {poem.pageNumber}</span>}
                </div>
                <p className="mt-2 text-xs text-gray-400 text-center">
                    {book.author} / {book.year}
                </p>
            </div>
        </article>
    );
};
