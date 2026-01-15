import * as React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',

          // Variants
          variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
          variant === 'secondary' && 'bg-slate-800 text-slate-100 hover:bg-slate-700',
          variant === 'outline' && 'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200',
          variant === 'ghost' && 'hover:bg-slate-800 text-slate-300 hover:text-white',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',

          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-10 px-4 py-2',
          size === 'lg' && 'h-12 px-8 text-lg',
          size === 'icon' && 'h-10 w-10',

          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
