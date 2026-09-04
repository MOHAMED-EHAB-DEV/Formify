'use client';

import { useCallback, useEffect, useRef } from 'react';

export type FloatingPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right';

interface UseFloatingOptions {
  placement?: FloatingPlacement;
  offset?: number;
  isOpen?: boolean;
}

export function useFloating<
  TriggerElement extends HTMLElement = HTMLElement,
  FloatingElement extends HTMLElement = HTMLElement
>({
  placement = 'bottom-end',
  offset = 6,
  isOpen = false,
}: UseFloatingOptions = {}) {
  const triggerRef = useRef<TriggerElement | null>(null);
  const floatingRef = useRef<FloatingElement | null>(null);

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const floatingEl = floatingRef.current;

    if (!triggerEl || !floatingEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const floatingRect = floatingEl.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;
    let resolvedPlacement = placement;

    // Flip check
    if (placement.startsWith('bottom') && triggerRect.bottom + floatingRect.height + offset > viewportHeight) {
      if (triggerRect.top - floatingRect.height - offset >= 0) {
        resolvedPlacement = placement.replace('bottom', 'top') as FloatingPlacement;
      }
    } else if (placement.startsWith('top') && triggerRect.top - floatingRect.height - offset < 0) {
      if (triggerRect.bottom + floatingRect.height + offset <= viewportHeight) {
        resolvedPlacement = placement.replace('top', 'bottom') as FloatingPlacement;
      }
    }

    // Calculate Y
    if (resolvedPlacement.startsWith('top')) {
      y = triggerRect.top - floatingRect.height - offset;
    } else if (resolvedPlacement.startsWith('bottom')) {
      y = triggerRect.bottom + offset;
    } else {
      y = triggerRect.top + (triggerRect.height - floatingRect.height) / 2;
    }

    const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

    // Calculate X
    if (resolvedPlacement.endsWith('-start')) {
      x = isRtl ? triggerRect.right - floatingRect.width : triggerRect.left;
    } else if (resolvedPlacement.endsWith('-end')) {
      x = isRtl ? triggerRect.left : triggerRect.right - floatingRect.width;
    } else if (resolvedPlacement === 'top' || resolvedPlacement === 'bottom') {
      x = triggerRect.left + (triggerRect.width - floatingRect.width) / 2;
    } else if (resolvedPlacement === 'left') {
      x = triggerRect.left - floatingRect.width - offset;
    } else if (resolvedPlacement === 'right') {
      x = triggerRect.right + offset;
    }

    // Clamp inside viewport boundaries
    const padding = 8;
    const clampedX = Math.round(Math.max(padding, Math.min(x, viewportWidth - floatingRect.width - padding)));
    const clampedY = Math.round(Math.max(padding, Math.min(y, viewportHeight - floatingRect.height - padding)));

    // Direct 60FPS DOM style mutation — Zero React State
    floatingEl.style.position = 'fixed';
    floatingEl.style.top = `${clampedY}px`;
    floatingEl.style.left = `${clampedX}px`;
    floatingEl.style.transform = '';
    floatingEl.style.transformOrigin = resolvedPlacement.startsWith('top') ? 'bottom' : 'top';
    floatingEl.style.visibility = 'visible';
  }, [placement, offset]);

  // Direct ref callback that positions immediately when DOM node mounts
  const setFloatingRef = useCallback(
    (node: FloatingElement | null) => {
      floatingRef.current = node;
      if (node) {
        node.style.visibility = 'hidden';
        node.style.position = 'fixed';
        updatePosition();
        requestAnimationFrame(updatePosition);
      }
    },
    [updatePosition]
  );

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const frameId = requestAnimationFrame(updatePosition);

    const handleScrollOrResize = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  return {
    triggerRef,
    floatingRef,
    setFloatingRef,
    updatePosition,
  };
}
