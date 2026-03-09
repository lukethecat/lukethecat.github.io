import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.liyupoetry.com';

const locales = ['en', 'de', 'ar', 'ug'];

export default function sitemap(): MetadataRoute.Sitemap {
    const bookIds = ['hanxuema1995', 'zhungaer1984'];
    const essayIds = [
        'hanxuema-introduction',
        'hanxuema-preface',
        'hanxuema-afterword',
        'hanxuema-publication',
        'zhungaer-preface',
        'zhungaer-afterword',
    ];

    const entries: MetadataRoute.Sitemap = [
        // Chinese (default)
        {
            url: `${BASE_URL}/`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        ...bookIds.map((id) => ({
            url: `${BASE_URL}/books/${id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        })),
        ...essayIds.map((id) => ({
            url: `${BASE_URL}/essays/${id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
    ];

    // Multi-language pages
    for (const locale of locales) {
        entries.push({
            url: `${BASE_URL}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        });
        for (const id of bookIds) {
            entries.push({
                url: `${BASE_URL}/${locale}/books/${id}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            });
        }
        for (const id of essayIds) {
            entries.push({
                url: `${BASE_URL}/${locale}/essays/${id}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            });
        }
    }

    return entries;
}

