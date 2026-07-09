'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { domToPng } from 'modern-screenshot';
import { ShareCardContent, CardTheme, THEME_LABELS, THEME_ORDER } from './CardTemplates';
import { PoemContext } from './useTextSelection';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  poemContext: PoemContext;
}

const MAX_LINES = 15;
const MAX_CHARS = 300;

/** Truncate text if too long */
function truncateText(text: string): { text: string; truncated: boolean } {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length <= MAX_LINES && text.length <= MAX_CHARS) {
    return { text, truncated: false };
  }
  const trimmed = lines.slice(0, MAX_LINES).join('\n');
  const finalText = trimmed.length > MAX_CHARS ? trimmed.substring(0, MAX_CHARS) : trimmed;
  return { text: finalText + '\n⋯⋯', truncated: true };
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  text: rawText,
  poemContext,
}) => {
  const [theme, setTheme] = useState<CardTheme>('stationery');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { text, truncated } = truncateText(rawText);

  // Build the URL for the QR code
  const poemUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/books/${poemContext.bookId}#${poemContext.poemId}`
    : `https://www.liyupoetry.com/books/${poemContext.bookId}#${poemContext.poemId}`;

  // QR colors per theme
  const qrFgColor = theme === 'darkgold' ? '#C6B28A' : '#2C2418';
  const qrBgColor = theme === 'darkgold' ? '#201C16' : '#F8F4ED';
  const qrSize = theme === 'stationery' ? 80 : theme === 'calendar' ? 72 : 80;

  // Generate the card image
  const generateImage = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await domToPng(cardRef.current, {
        scale: 2,
        quality: 1,
        backgroundColor: theme === 'darkgold' ? '#201C16' : '#F8F4ED',
      });
      setGeneratedImageUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate card image:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [theme]);

  // Regenerate image when theme changes or modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure card DOM is fully rendered (including QR)
      const timer = setTimeout(generateImage, 500);
      return () => clearTimeout(timer);
    } else {
      setGeneratedImageUrl(null);
    }
  }, [isOpen, theme, generateImage]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `读诗卡片-${poemContext.poemTitle.substring(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [generatedImageUrl, poemContext.poemTitle]);

  // Handle native share (mobile)
  const handleShare = useCallback(async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'poem-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `「${poemContext.poemTitle}」— 李瑜诗歌档案馆`,
        });
        return;
      }
    } catch {
      // Fallback to download
    }
    handleDownload();
  }, [generatedImageUrl, poemContext.poemTitle, handleDownload]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (typeof window === 'undefined') return null;

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Card preview area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative max-w-[90vw] max-h-[70vh] overflow-hidden rounded-lg shadow-2xl"
          >
            {/* Show generated image or loading state */}
            {generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="读诗卡片"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                style={{ display: 'block' }}
              />
            ) : (
              <div className="w-[270px] h-[360px] md:w-[324px] md:h-[432px] bg-surface rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-foreground-muted font-sans">正在生成卡片...</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Instruction for mobile */}
          {generatedImageUrl && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm text-white/60 font-sans text-center px-4"
            >
              长按图片保存到相册 · 微信中可长按识别二维码
            </motion.p>
          )}

          {/* Theme switcher & action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-col items-center gap-4"
          >
            {/* Theme tabs */}
            <div className="flex gap-2 bg-white/10 rounded-full p-1">
              {THEME_ORDER.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-sans transition-all ${
                    theme === t
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {THEME_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={canNativeShare ? handleShare : handleDownload}
                disabled={!generatedImageUrl}
                className="px-6 py-2.5 bg-white text-neutral-900 rounded-full text-sm font-sans font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                {canNativeShare ? '分享' : '保存图片'}
              </button>
              {canNativeShare && (
                <button
                  onClick={handleDownload}
                  disabled={!generatedImageUrl}
                  className="px-6 py-2.5 bg-white/15 text-white rounded-full text-sm font-sans hover:bg-white/25 transition-colors disabled:opacity-40"
                >
                  下载
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/10 text-white/70 rounded-full text-sm font-sans hover:bg-white/15 transition-colors"
              >
                关闭
              </button>
            </div>

            {truncated && (
              <p className="text-xs text-white/40 font-sans">
                选中文字较长，已截取前 {MAX_LINES} 行
              </p>
            )}
          </motion.div>

          {/* Hidden: Off-screen card rendering area for screenshot */}
          <div
            style={{
              position: 'fixed',
              left: '-9999px',
              top: 0,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <div ref={cardRef} style={{ width: 1080 }}>
              <ShareCardContent text={text} poemContext={poemContext} theme={theme} />
              {/* Render QR code directly inside the card's placeholder using CSS positioning */}
              <div
                style={{
                  position: 'absolute',
                  bottom: theme === 'stationery' ? 40 : theme === 'calendar' ? 48 : 48,
                  right: theme === 'stationery' ? 56 : 72,
                }}
              >
                <QRCodeSVG
                  value={poemUrl}
                  size={qrSize}
                  fgColor={qrFgColor}
                  bgColor={qrBgColor}
                  level="M"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
