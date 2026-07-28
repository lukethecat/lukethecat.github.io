import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PoemContext } from './useTextSelection';

export type CardTheme = 'darkgold' | 'stationery' | 'celadon' | 'darkwood';

interface CardProps {
  text: string;
  poemContext: PoemContext;
  theme: CardTheme;
  poemUrl?: string;
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

/** Rich Traditional Chinese Serif Font Family Stack */
const TRADITIONAL_SERIF_FONT = '"STSong", "Songti SC", "SimSun", "Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC", "Georgia", serif';

/** WebFont Calligraphy Seal Font Stack */
const WEBFONT_SEAL_STACK = 'var(--font-ma-shan-zheng), "Ma Shan Zheng", "Zhi Mang Xing", "LiSu", "STLiti", "KaiTi", serif';

/** Calculate dynamic font size based on max line length to prevent overflow */
function getAdaptiveFontSize(lines: string[]): number {
  const maxLen = Math.max(...lines.map(l => l.length), 1);
  if (maxLen <= 10) return 54;
  if (maxLen <= 13) return 46;
  if (maxLen <= 16) return 40;
  if (maxLen <= 20) return 34;
  return Math.max(26, Math.floor(700 / maxLen));
}

// ═══════════════════════════════════════════════════════════════
// WebFont Seal Stamp Component
// ═══════════════════════════════════════════════════════════════
interface SealStampProps {
  borderColor: string;
  textColor: string;
  bgColor?: string;
  variant?: 'zhuwen' | 'yinwen';
  size?: number;
}

function WebFontSealStamp({
  borderColor,
  textColor,
  bgColor = 'transparent',
  variant = 'zhuwen',
  size = 72,
}: SealStampProps) {
  const isYin = variant === 'yinwen';
  const actualBg = isYin ? borderColor : bgColor;
  const actualColor = isYin ? textColor : textColor;

  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${borderColor}`,
        outline: `1.5px solid ${borderColor}`,
        outlineOffset: '-5px',
        borderRadius: 4,
        backgroundColor: actualBg,
        color: actualColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: WEBFONT_SEAL_STACK,
        fontWeight: 800,
        boxSizing: 'border-box',
        padding: '2px',
        boxShadow: isYin ? '0 4px 12px rgba(140, 36, 36, 0.2)' : '0 2px 6px rgba(0,0,0,0.1)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyItems: 'center',
          fontSize: Math.round(size * 0.34),
          lineHeight: 1,
          letterSpacing: 0,
        }}
      >
        <span>{'\u85CF'}</span>{/* 藏 */}
        <span>{'\u674E'}</span>{/* 李 */}
        <span>{'\u5370'}</span>{/* 印 */}
        <span>{'\u7600'}</span>{/* 瑜 */}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Shared layout: poetry body with subtle "" + bottom attribution
// ═══════════════════════════════════════════════════════════════

interface ThemeColors {
  bg: string;
  frameBg: string;
  frameBorder: string;
  quoteMark: string;
  poemText: string;
  titleText: string;
  metaText: string;
  mutedText: string;
  sealBorder: string;
  sealText: string;
  sealBg: string;
  sealVariant: 'zhuwen' | 'yinwen';
  qrFg: string;
  qrBg: string;
  divider: string;
}

function PoemCard({ text, poemContext, poemUrl, colors }: { text: string; poemContext: PoemContext; poemUrl?: string; colors: ThemeColors }) {
  const lines = splitLines(text);
  const fontSize = getAdaptiveFontSize(lines);
  const fullTitle = poemContext.poemTitle.replace('／', '\n');

  return (
    <div
      style={{
        width: 1080,
        minHeight: 1440,
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: TRADITIONAL_SERIF_FONT,
        padding: '64px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Inner frame */}
      <div
        style={{
          border: `1px solid ${colors.frameBorder}`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 64px 56px',
          background: colors.frameBg,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* ── Poetry body with subtle quotation marks ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          {/* Opening " */}
          <span
            style={{
              fontSize: 72,
              color: colors.quoteMark,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
              marginBottom: 24,
              userSelect: 'none',
              opacity: 0.5,
            }}
          >
            {'\u201C'}
          </span>

          {/* Poem lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '8px', overflow: 'hidden' }}>
            {lines.map((line, i) => (
              <p
                key={i}
                style={{
                  fontSize,
                  lineHeight: 1.7,
                  color: colors.poemText,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  wordBreak: 'keep-all',
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Closing " */}
          <span
            style={{
              fontSize: 72,
              color: colors.quoteMark,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
              textAlign: 'right',
              marginTop: 24,
              userSelect: 'none',
              opacity: 0.5,
            }}
          >
            {'\u201D'}
          </span>
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: `1px solid ${colors.divider}`, marginTop: 32, marginBottom: 32 }} />

        {/* ── Bottom attribution: title + meta + seal/QR ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* Left: full title + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 28,
                color: colors.titleText,
                fontWeight: 700,
                margin: '0 0 10px',
                letterSpacing: '0.04em',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}
            >
              {fullTitle}
            </p>
            <p style={{ fontSize: 22, color: colors.metaText, margin: '0 0 6px', letterSpacing: '0.03em' }}>
              {poemContext.bookAuthor} · 《{poemContext.bookTitle}》
            </p>
            <p style={{ fontSize: 20, color: colors.mutedText, margin: '0 0 4px' }}>
              {poemContext.chapterTitle}{poemContext.pageNumber && ` · 页 ${poemContext.pageNumber}`}
            </p>
            <p style={{ fontSize: 18, color: colors.mutedText, margin: 0, opacity: 0.7 }}>
              liyupoetry.com · {formatDateChinese()}
            </p>
          </div>

          {/* Right: seal + QR, perfectly aligned side by side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, marginLeft: 32 }}>
            <WebFontSealStamp
              borderColor={colors.sealBorder}
              textColor={colors.sealText}
              bgColor={colors.sealBg}
              variant={colors.sealVariant}
              size={72}
            />
            {poemUrl ? (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 4,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: colors.qrBg,
                }}
              >
                <QRCodeSVG
                  value={poemUrl}
                  size={72}
                  fgColor={colors.qrFg}
                  bgColor={colors.qrBg}
                  level="M"
                />
              </div>
            ) : (
              <div style={{ width: 72, height: 72 }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// THEME 1: DarkGold (墨金)
// ═══════════════════════════════════════════
function DarkGoldCard(props: Omit<CardProps, 'theme'>) {
  return (
    <PoemCard
      {...props}
      colors={{
        bg: '#161412',
        frameBg: 'linear-gradient(180deg, rgba(32, 28, 22, 0.5) 0%, rgba(22, 20, 18, 0.7) 100%)',
        frameBorder: '#504030',
        quoteMark: '#8C7652',
        poemText: '#FAF4E8',
        titleText: '#E8D8B8',
        metaText: '#A69575',
        mutedText: '#73644B',
        sealBorder: '#D9C398',
        sealText: '#D9C398',
        sealBg: 'rgba(217, 195, 152, 0.06)',
        sealVariant: 'zhuwen',
        qrFg: '#D9C398',
        qrBg: '#161412',
        divider: '#3A3020',
      }}
    />
  );
}

// ═══════════════════════════════════════════
// THEME 2: XuanPaper (宣纸)
// ═══════════════════════════════════════════
function XuanPaperCard(props: Omit<CardProps, 'theme'>) {
  return (
    <PoemCard
      {...props}
      colors={{
        bg: '#F5F0E6',
        frameBg: 'rgba(255, 255, 255, 0.35)',
        frameBorder: '#D6C8B4',
        quoteMark: '#8C2424',
        poemText: '#1A1412',
        titleText: '#2C2418',
        metaText: '#66594C',
        mutedText: '#8C7D6B',
        sealBorder: '#8C2424',
        sealText: '#F5F0E6',
        sealBg: '#8C2424',
        sealVariant: 'yinwen',
        qrFg: '#8C2424',
        qrBg: '#F5F0E6',
        divider: '#D6C8B4',
      }}
    />
  );
}

// ═══════════════════════════════════════════
// THEME 3: Celadon (青绀)
// ═══════════════════════════════════════════
function CeladonCard(props: Omit<CardProps, 'theme'>) {
  return (
    <PoemCard
      {...props}
      colors={{
        bg: '#0F172A',
        frameBg: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        frameBorder: '#334155',
        quoteMark: '#38BDF8',
        poemText: '#E2E8F0',
        titleText: '#CBD5E1',
        metaText: '#94A3B8',
        mutedText: '#64748B',
        sealBorder: '#38BDF8',
        sealText: '#38BDF8',
        sealBg: 'rgba(56, 189, 248, 0.06)',
        sealVariant: 'zhuwen',
        qrFg: '#38BDF8',
        qrBg: '#0F172A',
        divider: '#293548',
      }}
    />
  );
}

// ═══════════════════════════════════════════
// THEME 4: DarkWood (紫檀)
// ═══════════════════════════════════════════
function DarkWoodCard(props: Omit<CardProps, 'theme'>) {
  return (
    <PoemCard
      {...props}
      colors={{
        bg: '#231B15',
        frameBg: 'rgba(0, 0, 0, 0.25)',
        frameBorder: '#5C4535',
        quoteMark: '#D4A373',
        poemText: '#FAF3E0',
        titleText: '#EADBC8',
        metaText: '#A8927C',
        mutedText: '#785E4A',
        sealBorder: '#D4A373',
        sealText: '#D4A373',
        sealBg: 'rgba(212, 163, 115, 0.06)',
        sealVariant: 'zhuwen',
        qrFg: '#D4A373',
        qrBg: '#231B15',
        divider: '#4A3828',
      }}
    />
  );
}

// ═══════════════════════════════════════════
// Main Card Component
// ═══════════════════════════════════════════
export const ShareCardContent: React.FC<CardProps> = ({ text, poemContext, theme, poemUrl }) => {
  switch (theme) {
    case 'stationery':
      return <XuanPaperCard text={text} poemContext={poemContext} poemUrl={poemUrl} />;
    case 'celadon':
      return <CeladonCard text={text} poemContext={poemContext} poemUrl={poemUrl} />;
    case 'darkwood':
      return <DarkWoodCard text={text} poemContext={poemContext} poemUrl={poemUrl} />;
    case 'darkgold':
    default:
      return <DarkGoldCard text={text} poemContext={poemContext} poemUrl={poemUrl} />;
  }
};

export const THEME_LABELS: Record<CardTheme, string> = {
  darkgold: '墨金',
  stationery: '宣纸',
  celadon: '青绀',
  darkwood: '紫檀',
};

export const THEME_ORDER: CardTheme[] = ['darkgold', 'stationery', 'celadon', 'darkwood'];
