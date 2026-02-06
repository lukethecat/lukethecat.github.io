'use client';

import React, { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

interface BookLayoutProps {
    book: Book;
    children: React.ReactNode;
}

export const BookLayout: React.FC<BookLayoutProps> = ({ book, children }) => {
    // Desktop: false means Expanded (default), true means Collapsed (mini)
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    // Mobile: false means Closed (default), true means Open (drawer)
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu when screen resizes to desktop to reset state
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Main section marginLeft logic:
    // Mobile: ml-0 (always full width)
    // Desktop: transition with ml-80 (expanded) or ml-16 (collapsed)
    const mainMarginClass = isDesktopCollapsed ? 'md:ml-16' : 'md:ml-80';

    return (
        <div className="flex min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* Mobile Header Trigger (Only visible on mobile when sidebar closed) */}
            <div className={`md:hidden fixed top-4 left-4 z-30 transition-opacity duration-300 ${isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-gray-100 border border-gray-200 transition"
                    aria-label="打开菜单"
                >
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            <Sidebar
                book={book}
                isDesktopCollapsed={isDesktopCollapsed}
                isMobileOpen={isMobileOpen}
                onToggleDesktop={() => setIsDesktopCollapsed(prev => !prev)}
                onToggleMobile={() => setIsMobileOpen(prev => !prev)}
            />

            {/* Overlay for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            <main className={`flex-1 min-h-screen bg-white transition-all duration-300 ease-in-out ml-0 ${mainMarginClass} w-full`}>
                {children}
            </main>
        </div>
    );
};
