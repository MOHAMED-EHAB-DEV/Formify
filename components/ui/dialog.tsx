'use client';

import React, { type ReactNode } from 'react';
import { useOverlay } from '@/hooks/use-overlay';
import { Portal } from '@/components/ui/portal';
import { cn } from '@/lib/utils';
import { XIcon } from '@/components/ui/svgs/icons';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const { overlayRef } = useOverlay({
    isOpen: open,
    onClose: () => onOpenChange(false),
    lockScroll: true,
    closeOnEscape: true,
    closeOnClickOutside: false,
  });

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-xs animate-fade-in"
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            onOpenChange(false);
          }
        }}
      >
        <div className="w-full max-w-lg will-change-transform animate-fade-in">
          {children}
        </div>
      </div>
    </Portal>
  );
}

export function DialogContent({
  className,
  children,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  return (
    <div
      className={cn(
        'relative w-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl focus:outline-none sm:p-7',
        className
      )}
      {...props}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute end-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon size={18} aria-hidden="true" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-start', className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-tight tracking-tight text-foreground', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-5', className)}
      {...props}
    />
  );
}
