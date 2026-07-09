import React from 'react';
import { PoemContext } from './useTextSelection';

export type CardTheme = 'editorial' | 'stationery' | 'darkgold';

interface CardProps {
  text: string;
  poemContext: PoemContext;
  theme: CardTheme;
}

/** Format today's date in Chinese */
function formatDateChinese(): string {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
}

/** Split text into lines for display */
function splitLines(text: string): string[] {
  return text.split('\n').filter(line => line.trim().length > 0);
}

/** Get short title (before the ／) */
function shortTitle(title: string): string {
  return title.includes('／') ? title.split('／')[0] : title;
}

// ═══════════════════════════════════════════
// THEME A: Editorial (Claude Style) - Default
// ═══════════════════════════════════════════
function EditorialCard({ text, poemContext }: Omit<CardProps, 'theme'>) {
  const lines = splitLines(text);

  return (
    <div
      style={{
        width: 1080,
        minHeight: 1440,
        background: '#FAF9F5', // Warm off-white
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-eb-garamond), var(--font-noto-serif-sc), var(--font-noto-serif-latin), Georgia, serif',
        position: 'relative',
        padding: '80px',
      }}
    >
      {/* Top Accent Line */}
      <div style={{ width: '100%', height: 4, background: '#D97757', marginBottom: 64 }} />

      {/* Header Attribution */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 80 }}>
        <div>
          <h1 style={{ fontSize: 42, color: '#2D2926', margin: '0 0 16px', fontWeight: 600 }}>
            {shortTitle(poemContext.poemTitle)}
          </h1>
          <p style={{ fontSize: 24, color: '#6B655F', margin: 0 }}>
            {poemContext.bookAuthor} · 《{poemContext.bookTitle}》
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 20, color: '#D97757', margin: 0, fontWeight: 500, letterSpacing: '0.05em' }}>
            CLAUDE
          </p>
        </div>
      </div>

      {/* Poetry text (Left aligned, elegant) */}
      <div style={{ flex: 1, paddingLeft: 32, borderLeft: '3px solid #EBE5D9', marginBottom: 80 }}>
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: 44,
              lineHeight: 2.2,
              color: '#332F2C',
              textAlign: 'left',
              margin: 0,
              letterSpacing: '0.05em',
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #EBE5D9', marginBottom: 40 }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: 96 }}>
        <div>
          <p style={{ fontSize: 20, color: '#8F8982', margin: '0 0 8px' }}>
            {poemContext.chapterTitle} {poemContext.pageNumber && ` · 页码 ${poemContext.pageNumber}`}
          </p>
          <p style={{ fontSize: 20, color: '#8F8982', margin: 0 }}>
            liyupoetry.com · {formatDateChinese()}
          </p>
        </div>
        {/* QR Placeholder */}
        <div data-qr-placeholder="true" style={{ width: 96, height: 96 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// THEME B: Poetry Stationery
// ═══════════════════════════════════════════
function StationeryCard({ text, poemContext }: Omit<CardProps, 'theme'>) {
  const lines = splitLines(text);

  return (
    <div
      style={{
        width: 1080,
        minHeight: 1440,
        background: '#F8F4ED',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-eb-garamond), var(--font-noto-serif-sc), var(--font-noto-serif-latin), Georgia, serif',
        padding: 48,
      }}
    >
      {/* Inner border frame */}
      <div
        style={{
          border: '1px solid #E8DFD0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 56px',
        }}
      >
        <div style={{ textAlign: 'left', marginBottom: 32, paddingLeft: 40 }}>
          <span style={{ fontSize: 80, color: '#D2C6B2', fontFamily: 'serif', lineHeight: 1 }}>
            「
          </span>
        </div>

        {/* Poetry text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 80, paddingRight: 40 }}>
          {lines.map((line, i) => (
            <p
              key={i}
              style={{
                fontSize: 46,
                lineHeight: 2.2,
                color: '#2C2418',
                textAlign: 'left',
                margin: 0,
                letterSpacing: '0.05em',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <div style={{ textAlign: 'right', marginTop: 16, marginBottom: 40, paddingRight: 40 }}>
          <span style={{ fontSize: 80, color: '#D2C6B2', fontFamily: 'serif', lineHeight: 1 }}>
            」
          </span>
        </div>

        <div style={{ borderTop: '1px solid #D2C6B2', marginBottom: 40, marginLeft: 40, marginRight: 40 }} />

        <div style={{ textAlign: 'left', paddingLeft: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: 26, color: '#2C2418', margin: '0 0 12px', letterSpacing: '0.1em' }}>
              ——「{shortTitle(poemContext.poemTitle)}」
            </p>
            <p style={{ fontSize: 22, color: '#7A6E5D', margin: '0 0 8px', letterSpacing: '0.05em' }}>
              《{poemContext.bookTitle}》· {poemContext.chapterTitle}
            </p>
            <p style={{ fontSize: 20, color: '#A39682', margin: '0 0 8px' }}>
              {poemContext.bookAuthor} / {poemContext.bookYear}
            </p>
            <p style={{ fontSize: 18, color: '#A39682', margin: 0 }}>
              {formatDateChinese()}
            </p>
          </div>
          <div data-qr-placeholder="true" style={{ width: 90, height: 90 }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// THEME C: Dark Gold
// ═══════════════════════════════════════════
function DarkGoldCard({ text, poemContext }: Omit<CardProps, 'theme'>) {
  const lines = splitLines(text);

  return (
    <div
      style={{
        width: 1080,
        minHeight: 1440,
        background: '#201C16',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-eb-garamond), var(--font-noto-serif-sc), var(--font-noto-serif-latin), Georgia, serif',
        padding: '80px',
      }}
    >
      {/* Decorative top element */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 64 }}>
        <div style={{ flex: 1, maxWidth: 240, borderTop: '1px solid #504737' }} />
        <span style={{ margin: '0 24px', fontSize: 16, color: '#C6B28A' }}>◆</span>
        <div style={{ flex: 1, maxWidth: 240, borderTop: '1px solid #504737' }} />
      </div>

      {/* Poetry */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 40 }}>
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: 48,
              lineHeight: 2.2,
              color: '#EDE6DA',
              margin: 0,
              letterSpacing: '0.05em',
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #504737', marginTop: 64, marginBottom: 40 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 26, color: '#C6B28A', margin: '0 0 12px', letterSpacing: '0.08em' }}>
            「{shortTitle(poemContext.poemTitle)}」
          </p>
          <p style={{ fontSize: 22, color: '#8C806C', margin: '0 0 8px' }}>
            《{poemContext.bookTitle}》· {poemContext.chapterTitle}
          </p>
          <p style={{ fontSize: 20, color: '#8C806C', margin: '0 0 8px' }}>
            {poemContext.bookAuthor} / {poemContext.bookYear}
          </p>
          <p style={{ fontSize: 18, color: '#504737', margin: 0 }}>
            {formatDateChinese()}
          </p>
        </div>
        
        <div data-qr-placeholder="true" style={{ width: 96, height: 96 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Card Component
// ═══════════════════════════════════════════
export const ShareCardContent: React.FC<CardProps> = ({ text, poemContext, theme }) => {
  switch (theme) {
    case 'stationery':
      return <StationeryCard text={text} poemContext={poemContext} />;
    case 'darkgold':
      return <DarkGoldCard text={text} poemContext={poemContext} />;
    case 'editorial':
    default:
      return <EditorialCard text={text} poemContext={poemContext} />;
  }
};

export const THEME_LABELS: Record<CardTheme, string> = {
  editorial: '克劳德',
  stationery: '诗笺',
  darkgold: '墨金',
};

export const THEME_ORDER: CardTheme[] = ['editorial', 'stationery', 'darkgold'];
