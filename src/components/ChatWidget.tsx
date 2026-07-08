'use client';

import { useEffect, useState } from 'react';

// Declare custom element for TypeScript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'chat-bubble-snippet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'api-url'?: string;
                class?: string;
            }, HTMLElement>;
        }
    }
}

export const ChatWidget = () => {
    const [mounted, setMounted] = useState(false);
    const instanceId = process.env.NEXT_PUBLIC_AI_SEARCH_ID || 'demo_mode';

    useEffect(() => {
        setMounted(true);
        // Import web component on client-side only
        import("@cloudflare/ai-search-snippet").catch(console.error);
    }, []);

    // Prevent hydration errors by only rendering on client
    if (!mounted) return null;

    // The API URL provided by Cloudflare
    const apiUrl = instanceId === 'demo_mode' 
        ? 'https://example.search.ai.cloudflare.com/' 
        : `https://${instanceId}.search.ai.cloudflare.com/`;

    return (
        <div className="fixed bottom-6 right-6 z-50" style={{
            // Pass CSS variables to match the site's theme
            '--search-snippet-primary-color': 'var(--text-accent)',
            '--search-snippet-border-radius': '1rem',
            '--cf-search-bar-bg': 'var(--bg-surface)',
            '--cf-search-bar-text': 'var(--text-foreground)',
            '--cf-search-bar-border': 'var(--border-border)',
        } as React.CSSProperties}>
            <chat-bubble-snippet api-url={apiUrl}></chat-bubble-snippet>
        </div>
    );
};
