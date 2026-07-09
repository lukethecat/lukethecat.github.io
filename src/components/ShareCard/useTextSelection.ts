'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface PoemContext {
  poemId: string;
  poemTitle: string;
  chapterTitle: string;
  bookTitle: string;
  bookAuthor: string;
  bookYear: string;
  pageNumber: string;
  bookId: string;
}

export interface TextSelectionState {
  text: string;
  rect: DOMRect | null;
  poemContext: PoemContext | null;
}

const EMPTY_STATE: TextSelectionState = {
  text: '',
  rect: null,
  poemContext: null,
};

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelectionState>(EMPTY_STATE);
  const isMouseDownRef = useRef(false);

  const handleSelectionChange = useCallback(() => {
    // Don't process during mouse drag — wait for mouseup
    if (isMouseDownRef.current) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      // Small delay before clearing to avoid flickering when clicking the share button
      setTimeout(() => {
        const currentSel = window.getSelection();
        if (!currentSel || currentSel.isCollapsed || !currentSel.toString().trim()) {
          setSelection(EMPTY_STATE);
        }
      }, 200);
      return;
    }

    const text = sel.toString().trim();
    if (text.length < 2) return; // Ignore single character selections

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Walk up the DOM to find the poem article with data attributes
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as Element;
    const poemArticle = element?.closest('[data-poem-id]');

    if (!poemArticle) {
      setSelection(EMPTY_STATE);
      return;
    }

    const poemContext: PoemContext = {
      poemId: poemArticle.getAttribute('data-poem-id') || '',
      poemTitle: poemArticle.getAttribute('data-poem-title') || '',
      chapterTitle: poemArticle.getAttribute('data-chapter-title') || '',
      bookTitle: poemArticle.getAttribute('data-book-title') || '',
      bookAuthor: poemArticle.getAttribute('data-book-author') || '',
      bookYear: poemArticle.getAttribute('data-book-year') || '',
      pageNumber: poemArticle.getAttribute('data-page-number') || '',
      bookId: poemArticle.getAttribute('data-book-id') || '',
    };

    setSelection({ text, rect, poemContext });
  }, []);

  useEffect(() => {
    const handleMouseDown = () => { isMouseDownRef.current = true; };
    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      // Slight delay so getSelection() reflects the final state
      setTimeout(handleSelectionChange, 50);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelection(EMPTY_STATE);
    window.getSelection()?.removeAllRanges();
  }, []);

  return { selection, clearSelection };
}
