'use client';

import React, { useState } from 'react';
import { Book, Chapter, Poem } from '@/lib/types';
import { ChevronRight, ChevronDown, Search, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
    book: Book;
}

export const Sidebar: React.FC<SidebarProps> = ({ book }) => {
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(book.chapters.map(c => c.id)));
    const [search, setSearch] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleChapter = (id: string) => {
        const next = new Set(expandedChapters);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedChapters(next);
    };

    const filteredChapters = book.chapters.map(chapter => ({
        ...chapter,
        poems: chapter.poems.filter(p =>
            p.title.includes(search) || p.lines.some(l => l.includes(search))
        )
    })).filter(c => c.poems.length > 0 || c.title.includes(search));

    if (isCollapsed) {
        return (
            <aside className="w-16 h-screen bg-[#f7f7f7] border-r border-gray-200 flex flex-col items-center py-4 fixed left-0 top-0">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-2 hover:bg-gray-200 rounded transition mb-4"
                    title="展开侧边栏"
                >
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <Link
                    href="/"
                    className="p-2 hover:bg-gray-200 rounded transition"
                    title="返回首页"
                >
                    <Home className="w-5 h-5 text-gray-600" />
                </Link>
            </aside>
        );
    }

    return (
        <aside className="w-80 h-screen bg-[#f7f7f7] border-r border-gray-200 flex flex-col font-sans text-sm fixed left-0 top-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition text-xs"
                    >
                        <Home className="w-3.5 h-3.5 mr-1" />
                        返回首页
                    </Link>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                        title="折叠侧边栏"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <h1 className="font-bold text-gray-900 mb-1">{book.title}</h1>
                <p className="text-xs text-gray-500">{book.author} {book.year}</p>
            </div>

            <div className="p-2 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-8 pr-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {filteredChapters.map(chapter => (
                    <div key={chapter.id} className="mb-2">
                        <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex items-center px-2 py-1 hover:bg-gray-100 rounded text-gray-700 group transition-colors"
                        >
                            {expandedChapters.has(chapter.id) ? (
                                <ChevronDown className="w-3.5 h-3.5 mr-1.5 text-gray-400 group-hover:text-gray-600" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 mr-1.5 text-gray-400 group-hover:text-gray-600" />
                            )}
                            <span className="font-medium truncate">{chapter.title}</span>
                        </button>

                        {expandedChapters.has(chapter.id) && (
                            <div className="ml-5 mt-0.5 border-l border-gray-200 pl-2">
                                {chapter.poems.map(poem => (
                                    <Link
                                        key={poem.id}
                                        href={`#${poem.id}`}
                                        className="block px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded truncate transition-colors"
                                    >
                                        {poem.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};
