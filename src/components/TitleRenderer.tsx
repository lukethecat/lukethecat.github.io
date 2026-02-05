import React from 'react';

interface TitleRendererProps {
    title: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'span';
}

export const TitleRenderer: React.FC<TitleRendererProps> = ({
    title,
    className = "",
    as: Component = 'span'
}) => {
    // Check for the slash
    if (title.includes('／')) {
        const parts = title.split('／');
        return (
            <Component className={className}>
                <span className="block">{parts[0]}</span>
                <span className="block pl-[2em] text-gray-500 font-normal mt-1">{parts[1]}</span>
            </Component>
        );
    }

    return <Component className={className}>{title}</Component>;
};
