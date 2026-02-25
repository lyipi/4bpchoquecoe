import React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80',
  secondary: 'border transparent bg-slate-200 text-slate-900 hover:bg-slate-200/80',
  destructive: 'border transparent bg-red-500 text-slate-50 hover:bg-red-600',
  outline: 'text-slate-950 border border-slate-200 hover:bg-slate-100 dark:text-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
};

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
      badgeVariants[variant],
      className
    )}
    {...props}
  />
));

Badge.displayName = 'Badge';

export { Badge };