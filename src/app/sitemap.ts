import { MetadataRoute } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-static';

const BASE_URL = 'https://www.liyupoetry.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Get Essays from markdown files
    const essaysDir = path.join(process.cwd(), 'src/content/essays');
    const essayFiles = await fs.readdir(essaysDir);
    const essayIds = essayFiles
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace(/\.md$/, ''));

    // 2. Get Books from works.json
    const worksJsonPath = path.join(process.cwd(), 'src/content/works.json');
    const worksJsonContent = await fs.readFile(worksJsonPath, 'utf8');
    const worksData = JSON.parse(worksJsonContent);
    const bookIds = worksData.books.map((b: any) => b.id);

    const entries: MetadataRoute.Sitemap = [
        // Home
        {
            url: `${BASE_URL}/`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        ...bookIds.map((id: string) => ({
            url: `${BASE_URL}/books/${id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        })),
        ...essayIds.map((id: string) => ({
            url: `${BASE_URL}/essays/${id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
    ];

    return entries;
}
