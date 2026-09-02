'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseOverlayOptions {
  isOpen: boolean;
  onClose: () => void;
  lockScroll?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  ignoreElements?: (HTMLElement | null)[];
}

export function useOverlay({
  isOpen,
  onClose,
  lockScroll = true,
  closeOnEscape = true,
  closeOnClickOutside = true,
  ignoreElements = [],
}: UseOverlayOptions) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!closeOnClickOutside || !overlayRef.current) return;
      const target = event.target as Node;

      const isIgnored = ignoreElements.some((el) => el && el.contains(target));
      if (isIgnored) return;

      if (!overlayRef.current.contains(target)) {
        onClose();
      }
    },
    [closeOnClickOutside, onClose, ignoreElements]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (lockScroll) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen, lockScroll]);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleKeyDown, handleClickOutside]);

  return { overlayRef };
}
