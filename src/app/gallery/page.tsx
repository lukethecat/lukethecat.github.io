import Image from 'next/image'
import Link from 'next/link'

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Link href="/" className="inline-flex items-center text-foreground-muted hover:text-foreground transition">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">文献与速写</h1>
          <p className="text-foreground-muted text-lg">Documents and Sketches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Newspaper Article */}
          <div className="group">
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg border border-border hover:border-border-hover transition-all duration-300">
              <Image
                src="/images/newspaper/liyu-xinjiang-economy-2017.jpg"
                alt="新疆经济报 2017年1月15日 第08版"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-lg text-foreground">新疆经济报 2017年1月15日</h3>
              <p className="text-foreground-muted text-sm mt-1">第08版 · 天山副刊·悦读</p>
              <p className="text-foreground-subtle text-sm mt-2">诗集《为了爱情，巴格达不嫌远》出版</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/essays/xinjiang-economy-2017-liyu"
            className="inline-flex items-center px-6 py-3 border border-border rounded-full text-foreground hover:bg-surface-elevated transition-colors"
          >
            阅读文章
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  )
}
