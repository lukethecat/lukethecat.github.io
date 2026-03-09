import { i18n, type Locale } from "@/lib/i18n/config";

export async function generateStaticParams() {
    return i18n.locales
        .filter(locale => locale !== 'zh')
        .map((locale) => ({ lang: locale }));
}

export default function LangLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
