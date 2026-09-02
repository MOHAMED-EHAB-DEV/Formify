'use client';

import React, { useState, type ReactNode, type ReactElement } from 'react';
import { useFloating, type FloatingPlacement } from '@/hooks/use-floating';
import { useOverlay } from '@/hooks/use-overlay';
import { Portal } from '@/components/ui/portal';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: ReactElement | ReactNode;
  children: ReactNode;
  placement?: FloatingPlacement;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
  trigger,
  children,
  placement = 'bottom-end',
  className,
  onOpenChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const { triggerRef, setFloatingRef } = useFloating<HTMLDivElement, HTMLDivElement>({
    placement,
    isOpen,
    offset: 6,
  });

  const { overlayRef } = useOverlay({
    isOpen,
    onClose: () => setOpen(false),
    lockScroll: false,
    closeOnClickOutside: true,
    closeOnEscape: true,
    ignoreElements: [triggerRef.current],
  });

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex shrink-0 cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!isOpen);
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <Portal>
          <div
            ref={(node) => {
              setFloatingRef(node);
              overlayRef.current = node;
            }}
            role="menu"
            aria-orientation="vertical"
            className={cn(
              'z-50 min-w-[180px] rounded-xl border border-border bg-card p-1 text-card-foreground shadow-lg animate-fade-in focus:outline-none will-change-transform',
              className
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  );
}

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownItem({ className, destructive = false, children, ...props }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm font-medium cursor-pointer transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50',
        destructive ? 'text-destructive hover:bg-destructive/10' : 'text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border-subtle" role="separator" />;
}

export function DropdownLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)}>
      {children}
    </div>
  );
}
