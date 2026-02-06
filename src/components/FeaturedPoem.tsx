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
            <div className="space-y-2 mb-4">
                {poem.lines.map((line, i) => (
                    <p key={i} className="text-gray-800 text-xl font-serif leading-relaxed tracking-wide">
                        {line}
                    </p>
                ))}
            </div>
            <p className="text-gray-400 text-sm mt-4 font-sans tracking-widest uppercase">
                —— {poem.source}
            </p>
        </div>
    );
};
