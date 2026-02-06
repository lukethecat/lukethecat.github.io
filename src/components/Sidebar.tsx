'use client';

import React, { useState } from 'react';
import { Book, Chapter, Poem } from '@/lib/types';
import { ChevronRight, ChevronDown, Search, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
    book: Book;
    isDesktopCollapsed: boolean;
    isMobileOpen: boolean;
    onToggleDesktop: () => void;
    onToggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    book,
    isDesktopCollapsed,
    isMobileOpen,
    onToggleDesktop,
    onToggleMobile
}) => {
    // Keep expandedChapters state internal as it's UI state specific to the tree
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(book.chapters.map(c => c.id)));
    const [search, setSearch] = useState('');

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

    // Shared content renderer
    const renderContent = (collapsed: boolean) => {
        if (collapsed) {
            return (
                <div className="flex flex-col items-center py-4 h-full">
                    <button
                        onClick={onToggleDesktop}
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
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition text-xs"
                        >
                            <Home className="w-3.5 h-3.5 mr-1" />
                            返回首页
                        </Link>

                        {/* Desktop controls */}
                        <button
                            onClick={onToggleDesktop}
                            className="hidden md:block p-1 hover:bg-gray-200 rounded transition"
                            title="折叠侧边栏"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Mobile controls */}
                        <button
                            onClick={onToggleMobile}
                            className="md:hidden p-1 hover:bg-gray-200 rounded transition"
                            title="关闭菜单"
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

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
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
                                <span className="font-medium truncate text-left">{chapter.title}</span>
                            </button>

                            {expandedChapters.has(chapter.id) && (
                                <div className="ml-5 mt-0.5 border-l border-gray-200 pl-2">
                                    {chapter.poems.map(poem => (
                                        <Link
                                            key={poem.id}
                                            href={`#${poem.id}`}
                                            // Mobile: Close menu on link click
                                            onClick={() => window.innerWidth < 768 && onToggleMobile()}
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
            </div>
        );
    };

    // Responsive Sidebar Container
    // Mobile: fixed inset z-50 transform
    // Desktop: fixed left-0 width transition

    // Width logic
    const widthClass = isDesktopCollapsed ? 'w-16' : 'w-80';

    // Transform logic for mobile
    const mobileTransform = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

    // Combined classes
    // Base: fixed h-screen bg-[#f7f7f7] border-r
    // Mobile Overrides: z-50 w-72 (or 80) max-w-[85vw] inset-y-0 left-0 transition-transform
    // Desktop Overrides: md:translate-x-0 md:z-auto

    return (
        <>
            {/* Desktop Wrapper */}
            <aside
                className={`
                    hidden md:block fixed left-0 top-0 h-screen bg-[#f7f7f7] border-r border-gray-200 
                    transition-all duration-300 ease-in-out z-20
                    ${widthClass}
                `}
            >
                {renderContent(isDesktopCollapsed)}
            </aside>

            {/* Mobile Wrapper (Drawer) */}
            <aside
                className={`
                    md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#f7f7f7] border-r border-gray-200 
                    transition-transform duration-300 ease-in-out shadow-xl
                    ${mobileTransform}
                `}
            >
                {renderContent(false)}
            </aside>
        </>
    );
};
