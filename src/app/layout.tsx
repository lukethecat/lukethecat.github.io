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
    title: "Poet's Digital Archive",
    description: "Digital archive of Li Yu's poetry",
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
