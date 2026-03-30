import Link from 'next/link'

// Image data mapping
const imageData: Record<string, { src: string; title: string; description: string; backLink: string }> = {
  'liyu-xinjiang-economy-2017': {
    src: '/images/newspaper/liyu-xinjiang-economy-2017-small.jpg',
    title: '那丛野罂粟依然火焰般燃烧 · 原版扫描',
    description: '新疆经济报 · 新疆作家巡礼（三十四）',
    backLink: '/essays/xinjiang-economy-2017-liyu'
  }
}

export function generateStaticParams() {
  return Object.keys(imageData).map((imageId) => ({ imageId }))
}

export default function ImageViewPage({ params }: { params: { imageId: string } }) {
  const image = imageData[params.imageId]
  
  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground-muted">图片不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link href={image.backLink} className="inline-flex items-center text-foreground-muted hover:text-foreground transition">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回文章
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif text-foreground mb-2">{image.title}</h1>
          <p className="text-foreground-muted">{image.description}</p>
        </div>

        <div className="flex justify-center">
          {/* Use regular img tag instead of Next.js Image to avoid optimization issues */}
          <img 
            src={image.src} 
            alt={image.title}
            className="rounded-lg shadow-lg max-w-full h-auto"
          />
        </div>
      </main>
    </div>
  )
}
