'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolvedTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'liyupoetry-theme',
}: {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)
    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null
        if (stored) setTheme(stored)
    }, [storageKey])

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')

        const resolved = theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            : theme

        root.classList.add(resolved)
        setResolvedTheme(resolved)
    }, [theme])

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme: (t) => { localStorage.setItem(storageKey, t); setTheme(t) },
            resolvedTheme,
        }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within ThemeProvider')
    return context
}
