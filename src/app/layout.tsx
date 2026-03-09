import type { Metadata } from "next";
import { Inter, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSerif = Noto_Serif_SC({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-noto-serif"
});

export const metadata: Metadata = {
    title: {
        default: '李瑜诗歌数字档案馆 | Li Yu Poetry Digital Archive',
        template: '%s | 李瑜诗歌数字档案馆',
    },
    description: '李瑜（1939—），当代著名西部诗人、新边塞诗代表人物。数字档案馆收录诗集《汗血马》《准噶尔诗草》全文，涵盖丝绸之路、天山、伊犁河、新疆兵团等西域主题。Li Yu, a celebrated contemporary Chinese western frontier poet. Digital archive of his complete poetry collections.',
    keywords: [
        '李瑜', '李瑜诗歌', '西部诗人', '新边塞诗', '中国现代诗歌', '当代诗歌',
        '新疆诗歌', '西域诗歌', '丝绸之路', '天山', '伊犁河', '准噶尔',
        '汗血马', '准噶尔诗草', '兵团文学', '新疆兵团', '边塞诗',
        'Li Yu', 'Chinese poetry', 'modern Chinese poetry', 'Xinjiang poetry',
        'frontier poetry', 'Silk Road poetry', 'Western China poet',
        'Tianshan', 'Ili River', 'Junggar', 'contemporary Chinese literature',
    ],
    authors: [{ name: '李瑜', url: 'https://www.liyupoetry.com' }],
    creator: '李瑜诗歌数字档案馆',
    metadataBase: new URL('https://www.liyupoetry.com'),
    openGraph: {
        title: '李瑜诗歌数字档案馆',
        description: '当代著名西部诗人李瑜作品全集——丝绸之路上的诗魂，天山脚下的歌者。收录《汗血马》《准噶尔诗草》等诗集全文。',
        url: 'https://www.liyupoetry.com',
        siteName: '李瑜诗歌数字档案馆',
        locale: 'zh_CN',
        alternateLocale: ['en_US', 'de_DE', 'ar_SA'],
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: '李瑜诗歌数字档案馆 | Li Yu Poetry Archive',
        description: '当代著名西部诗人李瑜作品数字档案——新边塞诗、丝绸之路诗歌、新疆主题诗歌全集。',
    },
    alternates: {
        canonical: 'https://www.liyupoetry.com',
        languages: {
            'zh-CN': 'https://www.liyupoetry.com',
            'en': 'https://www.liyupoetry.com/en',
            'de': 'https://www.liyupoetry.com/de',
            'ar': 'https://www.liyupoetry.com/ar',
            'ug': 'https://www.liyupoetry.com/ug',
        },
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
            <body className={`${inter.variable} ${notoSerif.variable} font-sans antialiased bg-white text-gray-900`}>{children}</body>
        </html>
    );
}
