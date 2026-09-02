import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, startAdornment, endAdornment, ...props }, ref) => {
    if (startAdornment || endAdornment) {
      return (
        <div className="relative flex w-full items-center">
          {startAdornment && (
            <div className="pointer-events-none absolute start-3 flex items-center text-muted-foreground">
              {startAdornment}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              startAdornment && 'ps-9',
              endAdornment && 'pe-9',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute end-3 flex items-center text-muted-foreground">
              {endAdornment}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
