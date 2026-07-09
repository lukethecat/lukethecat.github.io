'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTextSelection } from './useTextSelection';
import { ShareCardModal } from './ShareCardModal';

/**
 * ShareCardProvider — wraps around poem reading pages.
 * Detects text selection and shows a floating "生成卡片" button.
 * When clicked, opens the ShareCardModal.
 */
export const ShareCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selection, clearSelection } = useTextSelection();
  const [modalOpen, setModalOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<typeof selection | null>(null);

  const hasSelection = selection.text.length > 0 && selection.rect && selection.poemContext;

  const handleOpenModal = () => {
    // Preserve the selection state before the modal opens (selection may collapse)
    setSavedSelection(selection);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSavedSelection(null);
    clearSelection();
  };

  // Calculate floating button position (above the selection, centered)
  const buttonStyle: React.CSSProperties = selection.rect ? {
    position: 'fixed',
    left: Math.min(
      Math.max(selection.rect.left + selection.rect.width / 2 - 64, 16),
      window.innerWidth - 144
    ),
    top: Math.max(selection.rect.top - 52, 16),
    zIndex: 9998,
  } : {};

  const activeSelection = modalOpen ? savedSelection : selection;

  return (
    <>
      {children}

      {/* Floating share button */}
      <AnimatePresence>
        {hasSelection && !modalOpen && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={buttonStyle}
            onMouseDown={(e) => e.preventDefault()} // Prevent focus steal
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-full shadow-lg text-sm font-sans font-medium hover:opacity-90 transition-opacity active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            生成读诗卡片
          </motion.button>
        )}
      </AnimatePresence>

      {/* Share card modal */}
      {activeSelection?.poemContext && (
        <ShareCardModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          text={activeSelection.text}
          poemContext={activeSelection.poemContext}
        />
      )}
    </>
  );
};
