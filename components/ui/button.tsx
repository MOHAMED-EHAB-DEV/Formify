import React, { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LoaderIcon } from '@/components/ui/svgs/icons';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium select-none cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-border bg-card text-foreground hover:bg-muted active:bg-muted/70',
        ghost:
          'text-foreground hover:bg-muted active:bg-muted/70',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        subtle:
          'bg-primary/10 text-primary hover:bg-primary/15',
      },
      size: {
        sm: 'h-8 px-3 text-xs min-h-[36px]',
        default: 'h-10 px-4 text-sm min-h-[40px]',
        lg: 'h-11 px-6 text-base min-h-[44px]',
        icon: 'h-10 w-10 p-0 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <LoaderIcon size={16} aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
