import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                serif: ["var(--font-noto-serif-latin)", "var(--font-noto-serif-sc)", "serif"],
            },
            colors: {
                background: "rgb(var(--color-background) / <alpha-value>)",
                foreground: "rgb(var(--color-foreground) / <alpha-value>)",
                "foreground-muted": "rgb(var(--color-foreground-muted) / <alpha-value>)",
                "foreground-subtle": "rgb(var(--color-foreground-subtle) / <alpha-value>)",
                surface: "rgb(var(--color-surface) / <alpha-value>)",
                "surface-elevated": "rgb(var(--color-surface-elevated) / <alpha-value>)",
                border: "rgb(var(--color-border) / <alpha-value>)",
                "border-hover": "rgb(var(--color-border-hover) / <alpha-value>)",
                accent: "rgb(var(--color-accent) / <alpha-value>)",
                "accent-hover": "rgb(var(--color-accent-hover) / <alpha-value>)",
                "accent-bg": "rgb(var(--color-accent-bg) / <alpha-value>)",
                "sidebar-bg": "rgb(var(--color-sidebar-bg) / <alpha-value>)",
                "sidebar-border": "rgb(var(--color-sidebar-border) / <alpha-value>)",
                "sidebar-active": "rgb(var(--color-sidebar-active) / <alpha-value>)",
            },
        },
    },
    plugins: [],
};
export default config;
