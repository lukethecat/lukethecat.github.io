'use client';

import React, { useState, useEffect } from 'react';

interface FeaturedPoemData {
    id: string;
    lines: string[];
    source: string;
    author?: string;
}

export const FeaturedPoem: React.FC<{ poems: FeaturedPoemData[] }> = ({ poems }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        if (poems.length <= 1) return;

        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % poems.length);
                setFade(true);
            }, 500); // Wait for fade out
        }, 8000); // 8 seconds per poem

        return () => clearInterval(interval);
    }, [poems.length]);

    const poem = poems[currentIndex];
    if (!poem) return null;

    return (
        <div className={`transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative inline-block px-12 py-6">
                {/* Decorative Quote Marks */}
                <span className="absolute top-0 left-0 text-6xl font-serif text-gray-200 leading-none select-none -translate-x-4 -translate-y-4">
                    “
                </span>

                <div className="space-y-3 mb-6 relative z-10">
                    {poem.lines.map((line, i) => (
                        <p key={i} className="text-gray-800 text-xl md:text-2xl font-serif leading-relaxed tracking-wide italic text-opacity-90">
                            {line}
                        </p>
                    ))}
                </div>

                <span className="absolute bottom-0 right-0 text-6xl font-serif text-gray-200 leading-none select-none translate-x-4 translate-y-4">
                    ”
                </span>
            </div>

            <div className="flex justify-center mt-4">
                <div className="w-12 h-px bg-gray-300 mb-4 mx-auto"></div>
            </div>

            <p className="text-gray-500 text-sm font-sans tracking-[0.2em] uppercase">
                {poem.source}
            </p>
        </div>
    );
};
