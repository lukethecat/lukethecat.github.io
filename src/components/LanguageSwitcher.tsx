'use client';

import { i18n, localeNames, type Locale } from '@/lib/i18n/config';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher({ currentLocale }: { currentLocale?: Locale }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const current = currentLocale || 'zh';

    function getLocalePath(locale: Locale) {
        if (typeof window === 'undefined') {
            // During SSG, return simple paths
            return locale === 'zh' ? '/' : `/${locale}`;
        }

        const pathname = window.location.pathname;
        // Remove current locale prefix if any
        let cleanPath = pathname;
        for (const loc of i18n.locales) {
            if (loc !== 'zh' && cleanPath.startsWith(`/${loc}`)) {
                cleanPath = cleanPath.substring(`/${loc}`.length) || '/';
                break;
            }
        }
        // Add new locale prefix (except for default zh)
        if (locale === 'zh') {
            return cleanPath;
        }
        return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100"
                aria-label="Switch language"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span>{localeNames[current]}</span>
                <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {i18n.locales.map((locale) => (
                        <a
                            key={locale}
                            href={getLocalePath(locale)}
                            className={`block px-4 py-2 text-sm transition-colors ${locale === current
                                    ? 'text-gray-900 bg-gray-50 font-medium'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            onClick={() => setIsOpen(false)}
                        >
                            {localeNames[locale]}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
