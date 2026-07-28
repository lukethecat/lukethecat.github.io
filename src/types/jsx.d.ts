import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'search-bar-snippet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'api-url'?: string;
                placeholder?: string;
                'max-results'?: string | number;
                class?: string;
            }, HTMLElement>;
            'chat-bubble-snippet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'api-url'?: string;
                title?: string;
                placeholder?: string;
                class?: string;
            }, HTMLElement>;
        }
    }
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'search-bar-snippet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'api-url'?: string;
                placeholder?: string;
                'max-results'?: string | number;
                class?: string;
            }, HTMLElement>;
            'chat-bubble-snippet': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                'api-url'?: string;
                title?: string;
                placeholder?: string;
                class?: string;
            }, HTMLElement>;
        }
    }
}
