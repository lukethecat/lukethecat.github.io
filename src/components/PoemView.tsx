import React from 'react';
import { Poem, Chapter, Book, Annotation } from '@/lib/types';

interface PoemViewProps {
    chapter: Chapter;
    poem: Poem;
    book: Book;
}

function AnnotatedLine({ line, annotations }: { line: string; annotations: Annotation[] }) {
    if (!annotations || annotations.length === 0 || !line.trim()) {
        return <>{line}</>;
    }

    // Find which annotations appear in this line
    const matchedAnnotations = annotations.filter(a => line.includes(a.term));
    if (matchedAnnotations.length === 0) {
        return <>{line}</>;
    }

    // Build segments: split by annotation terms
    const parts: (string | { term: string; index: number })[] = [];
    let remaining = line;

    while (remaining.length > 0) {
        let earliestMatch: { term: string; pos: number; index: number } | null = null;

        for (const ann of matchedAnnotations) {
            const pos = remaining.indexOf(ann.term);
            if (pos !== -1 && (earliestMatch === null || pos < earliestMatch.pos)) {
                earliestMatch = {
                    term: ann.term,
                    pos,
                    index: annotations.indexOf(ann),
                };
            }
        }

        if (earliestMatch === null) {
            parts.push(remaining);
            break;
        }

        if (earliestMatch.pos > 0) {
            parts.push(remaining.substring(0, earliestMatch.pos));
        }
        parts.push({ term: earliestMatch.term, index: earliestMatch.index });
        remaining = remaining.substring(earliestMatch.pos + earliestMatch.term.length);
    }

    return (
        <>
            {parts.map((part, i) => {
                if (typeof part === 'string') {
                    return <React.Fragment key={i}>{part}</React.Fragment>;
                }
                return (
                    <span
                        key={i}
                        className="annotation-term border-b border-dotted border-border-hover cursor-help"
                        title={annotations[part.index]?.note}
                    >
                        {part.term}
                        <sup className="text-xs text-foreground-subtle ml-px select-none">
                            {part.index + 1}
                        </sup>
                    </span>
                );
            })}
        </>
    );
}

export const PoemView: React.FC<PoemViewProps> = ({ chapter, poem, book }) => {
    const annotations = poem.annotations || [];

    return (
        <article id={poem.id} className="max-w-2xl mx-auto py-32 px-8 scroll-mt-12">
            {/* Poem Title */}
            <div className="mb-16">
                {poem.title.includes('／') ? (
                    <>
                        <h3 className="text-3xl font-bold text-foreground font-serif leading-relaxed">
                            {poem.title.split('／')[0]}
                        </h3>
                        <h3 className="text-3xl font-bold text-foreground-muted font-serif leading-relaxed">
                            {poem.title.split('／')[1]}
                        </h3>
                    </>
                ) : (
                    <h3 className="text-3xl font-bold text-foreground font-serif leading-relaxed">
                        {poem.title}
                    </h3>
                )}
            </div>

            {/* Poem Content */}
            <div className="space-y-1 font-serif text-xl text-foreground leading-[2.2]">
                {poem.lines.map((line, index) => (
                    <p key={index} className={`min-h-[1.5em] ${line === '' || !line.trim() ? 'h-6' : ''}`}>
                        <AnnotatedLine line={line} annotations={annotations} />
                    </p>
                ))}
            </div>

            {/* Annotations / Footnotes */}
            {annotations.length > 0 && (
                <div className="mt-16 pt-8 border-t border-border">
                    <h4 className="text-xs font-sans font-semibold text-foreground-subtle uppercase tracking-widest mb-4">
                        注释
                    </h4>
                    <ol className="space-y-2">
                        {annotations.map((ann, i) => (
                            <li key={i} className="flex text-sm text-foreground-muted leading-relaxed">
                                <span className="text-xs text-foreground-subtle mr-2 mt-0.5 flex-shrink-0 font-mono">
                                    {i + 1}.
                                </span>
                                <span>
                                    <span className="font-medium text-foreground-muted">{ann.term}</span>
                                    <span className="mx-1.5 text-gray-300">—</span>
                                    {ann.note}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* Enhanced Meta Information */}
            <div className="mt-20 pt-6 border-t border-border">
                <div className="flex justify-between items-center text-sm text-foreground-muted font-sans">
                    <span>《{book.title}》 · {chapter.title}</span>
                    {poem.pageNumber && <span>页码 {poem.pageNumber}</span>}
                </div>
                <p className="mt-2 text-xs text-foreground-subtle text-center">
                    {book.author} / {book.year}
                </p>
            </div>
        </article>
    );
};
