export const i18n = {
    defaultLocale: 'zh',
    locales: ['zh', 'en', 'de', 'ar', 'ug'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

export const rtlLocales: Locale[] = ['ar', 'ug'];

export function isRtl(locale: Locale): boolean {
    return rtlLocales.includes(locale);
}

export const localeNames: Record<Locale, string> = {
    zh: '中文',
    en: 'English',
    de: 'Deutsch',
    ar: 'العربية',
    ug: 'ئۇيغۇرچە',
};

export const localeHtmlLang: Record<Locale, string> = {
    zh: 'zh-CN',
    en: 'en',
    de: 'de',
    ar: 'ar',
    ug: 'ug',
};
