'use client';

import React, { useState, type ReactNode, type ReactElement } from 'react';
import { useFloating, type FloatingPlacement } from '@/hooks/use-floating';
import { Portal } from '@/components/ui/portal';
import { cn } from '@/lib/utils';

export function Tooltip({
  content,
  children,
  placement = 'top',
  className,
}: {
  content: ReactNode;
  children: ReactElement | ReactNode;
  placement?: FloatingPlacement;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { triggerRef, setFloatingRef } = useFloating<HTMLSpanElement, HTMLDivElement>({
    placement,
    isOpen,
    offset: 6,
  });

  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex shrink-0 cursor-default"
      >
        {children}
      </span>
      {isOpen && (
        <Portal>
          <div
            ref={setFloatingRef}
            role="tooltip"
            className={cn(
              'z-50 max-w-xs rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md animate-fade-in focus:outline-none will-change-transform',
              className
            )}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}
