import React from 'react';
import { PoemContext } from './useTextSelection';

export type CardTheme = 'stationery' | 'calendar' | 'darkgold';

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

/** Format date parts for the calendar theme */
function getDateParts() {
  const now = new Date();
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return {
    day: now.getDate(),
    month: months[now.getMonth()],
    year: now.getFullYear(),
    weekday: weekdays[now.getDay()],
  };
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
// THEME C: Poetry Stationery (Default)
// ═══════════════════════════════════════════
function StationeryCard({ text, poemContext }: Omit<CardProps, 'theme'>) {
  const lines = splitLines(text);

  return (
    <div
      style={{
        width: 1080,
        height: 1440,
        background: '#F8F4ED',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Serif SC", "Noto Serif", "LXGW WenKai", serif',
      }}
    >
      {/* Inner border frame */}
      <div
        style={{
          margin: 48,
          border: '1px solid #E8DFD0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 56px',
          position: 'relative',
        }}
      >
        {/* Decorative opening quote */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 72, color: '#D2C6B2', fontFamily: 'serif', lineHeight: 1 }}>
            「
          </span>
        </div>

        {/* Poetry text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 24, paddingRight: 24 }}>
          {lines.map((line, i) => (
            <p
              key={i}
              style={{
                fontSize: 38,
                lineHeight: 2.4,
                color: '#2C2418',
                textAlign: 'center',
                margin: 0,
                letterSpacing: '0.05em',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Decorative closing quote */}
        <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 24 }}>
          <span style={{ fontSize: 72, color: '#D2C6B2', fontFamily: 'serif', lineHeight: 1 }}>
            」
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #D2C6B2', marginBottom: 32, marginLeft: 80, marginRight: 80 }} />

        {/* Attribution */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 24, color: '#2C2418', margin: '0 0 8px', letterSpacing: '0.1em' }}>
            ——「{shortTitle(poemContext.poemTitle)}」
          </p>
          <p style={{ fontSize: 20, color: '#7A6E5D', margin: '0 0 6px', letterSpacing: '0.05em' }}>
            《{poemContext.bookTitle}》· {poemContext.chapterTitle}
            {poemContext.pageNumber && ` · 页码 ${poemContext.pageNumber}`}
          </p>
          <p style={{ fontSize: 18, color: '#A39682', margin: '0 0 6px' }}>
            {poemContext.bookAuthor} / {poemContext.bookYear}
          </p>
          <p style={{ fontSize: 16, color: '#A39682', margin: 0 }}>
            {formatDateChinese()}
          </p>
        </div>
      </div>

      {/* Footer outside frame */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 56px 40px',
          marginTop: -8,
        }}
      >
        <span style={{ fontSize: 16, color: '#A39682', letterSpacing: '0.05em' }}>
          liyupoetry.com · 李瑜诗歌档案馆
        </span>
        <div data-qr-placeholder="true" style={{ width: 80, height: 80 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// THEME A: Calendar Bookmark
// ═══════════════════════════════════════════
function CalendarCard({ text, poemContext }: Omit<CardProps, 'theme'>) {
  const lines = splitLines(text);
  const date = getDateParts();

  return (
    <div
      style={{
        width: 1080,
        height: 1440,
        background: '#F8F4ED',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Serif SC", "Noto Serif", "LXGW WenKai", serif',
        padding: '72px 72px 48px',
      }}
    >
      {/* Date header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: 96, color: '#2C2418', margin: 0, fontWeight: 700, lineHeight: 1.1, fontFamily: '"EB Garamond", "Noto Serif", Georgia, serif' }}>
          {date.day}
        </p>
        <p style={{ fontSize: 22, color: '#2C2418', margin: '4px 0', letterSpacing: '0.25em', fontFamily: '"EB Garamond", "Noto Serif", Georgia, serif' }}>
          {date.month} {date.year}
        </p>
        <p style={{ fontSize: 18, color: '#7A6E5D', margin: 0, letterSpacing: '0.15em' }}>
          {date.weekday}
        </p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #D2C6B2', marginBottom: 48, marginLeft: 120, marginRight: 120 }} />

      {/* Poetry */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: 36,
              lineHeight: 2.4,
              color: '#2C2418',
              margin: 0,
              letterSpacing: '0.05em',
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #E8DFD0', marginTop: 40, marginBottom: 28 }} />

      {/* Attribution */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ fontSize: 22, color: '#2C2418', margin: '0 0 6px', letterSpacing: '0.08em' }}>
          「{shortTitle(poemContext.poemTitle)}」
        </p>
        <p style={{ fontSize: 18, color: '#7A6E5D', margin: '0 0 4px' }}>
          《{poemContext.bookTitle}》· {poemContext.chapterTitle}
          {poemContext.pageNumber && ` · 页码 ${poemContext.pageNumber}`}
        </p>
        <p style={{ fontSize: 16, color: '#A39682', margin: 0 }}>
          {poemContext.bookAuthor} / {poemContext.bookYear}
        </p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
        <span style={{ fontSize: 16, color: '#A39682' }}>liyupoetry.com</span>
        <div data-qr-placeholder="true" style={{ width: 72, height: 72 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// THEME B: Dark Gold
// ═══════════════════════════════════════════
function DarkGoldCard({ text, poemContext }: Omit<CardProps, 'theme'>) {
  const lines = splitLines(text);

  return (
    <div
      style={{
        width: 1080,
        height: 1440,
        background: '#201C16',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Noto Serif SC", "Noto Serif", "LXGW WenKai", serif',
        padding: '72px 72px 48px',
      }}
    >
      {/* Decorative top element */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 56 }}>
        <div style={{ flex: 1, maxWidth: 200, borderTop: '1px solid #504737' }} />
        <span style={{ margin: '0 16px', fontSize: 14, color: '#C6B28A' }}>◆</span>
        <div style={{ flex: 1, maxWidth: 200, borderTop: '1px solid #504737' }} />
      </div>

      {/* Poetry */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {lines.map((line, i) => (
          <p
            key={i}
            style={{
              fontSize: 38,
              lineHeight: 2.4,
              color: '#EDE6DA',
              margin: 0,
              letterSpacing: '0.05em',
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #504737', marginTop: 48, marginBottom: 32 }} />

      {/* Attribution */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 22, color: '#C6B28A', margin: '0 0 8px', letterSpacing: '0.08em' }}>
          「{shortTitle(poemContext.poemTitle)}」
        </p>
        <p style={{ fontSize: 18, color: '#8C806C', margin: '0 0 6px' }}>
          《{poemContext.bookTitle}》· {poemContext.chapterTitle}
          {poemContext.pageNumber && ` · 页码 ${poemContext.pageNumber}`}
        </p>
        <p style={{ fontSize: 16, color: '#8C806C', margin: '0 0 6px' }}>
          {poemContext.bookAuthor} / {poemContext.bookYear}
        </p>
        <p style={{ fontSize: 14, color: '#504737', margin: 0 }}>
          {formatDateChinese()}
        </p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, color: '#8C806C' }}>liyupoetry.com · 李瑜诗歌档案馆</span>
        <div data-qr-placeholder="true" style={{ width: 80, height: 80 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Card Component
// ═══════════════════════════════════════════
export const ShareCardContent: React.FC<CardProps> = ({ text, poemContext, theme }) => {
  switch (theme) {
    case 'calendar':
      return <CalendarCard text={text} poemContext={poemContext} />;
    case 'darkgold':
      return <DarkGoldCard text={text} poemContext={poemContext} />;
    case 'stationery':
    default:
      return <StationeryCard text={text} poemContext={poemContext} />;
  }
};

export const THEME_LABELS: Record<CardTheme, string> = {
  stationery: '诗笺',
  calendar: '日历',
  darkgold: '墨金',
};

export const THEME_ORDER: CardTheme[] = ['stationery', 'calendar', 'darkgold'];
