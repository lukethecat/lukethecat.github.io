"use client";

import { useState, useEffect } from 'react';
import chapterTitles from '@/data/chapterTitles.json';

export default function FooterEasterEgg() {
    const [easterEgg, setEasterEgg] = useState<{ book: string; chapter: string } | null>(null);

    useEffect(() => {
        if (chapterTitles && chapterTitles.length > 0) {
            const randomIndex = Math.floor(Math.random() * chapterTitles.length);
            setEasterEgg(chapterTitles[randomIndex]);
        }
    }, []);

    if (!easterEgg) {
        return <div className="mt-4 h-4"></div>; // Placeholder to avoid layout shift
    }

    return (
        <div className="mt-4 text-xs italic text-foreground-muted animate-in fade-in duration-1000">
            <span className="opacity-70 hover:opacity-100 transition-opacity cursor-default" title="每次刷新都会随机展示一句卷名">
                「{easterEgg.chapter}」 —— 《{easterEgg.book}》
            </span>
        </div>
    );
}
