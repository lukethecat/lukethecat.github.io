import React from 'react';
import { Poem, Chapter } from '@/lib/types';
import { TitleRenderer } from './TitleRenderer';

interface PoemViewProps {
    chapter: Chapter;
    poem: Poem;
}

export const PoemView: React.FC<PoemViewProps> = ({ chapter, poem }) => {
    return (
        <article id={poem.id} className="max-w-2xl mx-auto py-24 px-8 scroll-mt-12">
            <div className="mb-12 text-center">
                <TitleRenderer
                    title={poem.title}
                    as="h2"
                    className="text-2xl font-bold text-gray-900 font-serif leading-relaxed"
                />
            </div>

            <div className="space-y-4 font-serif text-lg text-gray-800 leading-loose">
                {poem.lines.map((line, index) => (
                    <p key={index} className={`min-h-[1.5em] ${line === '' ? 'h-4' : ''}`}>
                        {line}
                    </p>
                ))}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between text-xs text-gray-400 font-sans uppercase tracking-widest">
                <span>{chapter.title}</span>
                {poem.pageNumber && <span>Page {poem.pageNumber}</span>}
            </div>
        </article>
    );
};
