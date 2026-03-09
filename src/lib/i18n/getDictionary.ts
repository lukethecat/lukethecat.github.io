import type { Locale } from './config';

const dictionaries = {
    zh: () => import('./dictionaries/zh.json').then((module) => module.default),
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    de: () => import('./dictionaries/de.json').then((module) => module.default),
    ar: () => import('./dictionaries/ar.json').then((module) => module.default),
    ug: () => import('./dictionaries/ug.json').then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['zh']>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]();
};
