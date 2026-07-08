'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

// Declare custom element for TypeScript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'search-bar-snippet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'api-url'?: string;
                placeholder?: string;
                'max-results'?: string | number;
                class?: string;
            }, HTMLElement>;
        }
    }
}

export function AISearchToggle() {
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    
    // In a real scenario, this should be in .env.local
    const instanceId = process.env.NEXT_PUBLIC_AI_SEARCH_ID || 'demo_mode';

    useEffect(() => {
        setMounted(true);
        // Import web component on client-side only to avoid SSR HTMLElement errors
        import("@cloudflare/ai-search-snippet").catch(console.error);

        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (!mounted || !instanceId) return null;

    // The API URL provided by Cloudflare
    const apiUrl = instanceId === 'demo_mode' 
        ? 'https://example.search.ai.cloudflare.com/' 
        : `https://${instanceId}.search.ai.cloudflare.com/`;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-elevated border border-border hover:border-border-hover shadow-sm transition-all duration-200 group relative"
                aria-label="Open AI Search"
                title="AI Search (Cmd/Ctrl + K)"
            >
                <Search className="w-4 h-4 text-foreground-muted group-hover:text-foreground" />
                <span className="absolute -top-2 -right-2 bg-accent/90 text-background text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-accent">AI</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-6">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Modal */}
                    <div 
                        ref={searchRef}
                        className="relative w-full max-w-2xl bg-surface-elevated border border-border rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center p-3 border-b border-border bg-surface-elevated rounded-t-xl z-10">
                            <Search className="w-5 h-5 text-foreground-muted ml-2 mr-3" />
                            <div className="flex-1 min-w-0 mr-3" style={{
                                // CSS variables to style the internal web component
                                '--cf-search-bar-bg': 'transparent',
                                '--cf-search-bar-border': 'transparent',
                                '--cf-search-bar-text': 'var(--text-foreground)',
                                '--search-snippet-primary-color': 'var(--text-accent)',
                            } as React.CSSProperties}>
                                <search-bar-snippet
                                    api-url={apiUrl}
                                    placeholder="通过 AI 搜索全站档案..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline-block text-xs text-foreground-muted bg-surface px-1.5 py-0.5 rounded border border-border">ESC</span>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-surface text-foreground-muted hover:text-foreground transition-colors rounded-md"
                                    aria-label="Close search"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Search dropdown will naturally render below the input, overflowing this container if necessary. 
                            We don't use overflow-hidden so the dropdown can safely overlap the border. */}
                        
                        {instanceId === 'demo_mode' && (
                            <div className="p-4 text-sm text-foreground-muted bg-surface/50 leading-relaxed rounded-b-xl border-t border-border">
                                <strong>配置提示：</strong><br />
                                这是一个 Beta 演示模式。请在 Cloudflare 开启 AI Search 的 Public Endpoint，然后将您的 Endpoint ID 添加到 <code>.env.local</code> 文件的 <code>NEXT_PUBLIC_AI_SEARCH_ID</code> 中，即可激活真实搜索功能。
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
