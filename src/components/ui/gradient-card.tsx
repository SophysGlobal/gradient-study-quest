import React from 'react';
import { cn } from '@/lib/utils';

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
}

export const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  ({ children, className, onClick, selectable = false, selected = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card-gradient transition-all duration-300 ease-out',
          selectable && 'cursor-pointer hover:scale-[1.02]',
          selected && 'gradient-glow scale-[1.02]',
          className
        )}
        onClick={onClick}
        {...props}
      >
        <div className="card-gradient-content transition-all duration-300 ease-out">
          {children}
        </div>
      </div>
    );
  }
);

GradientCard.displayName = 'GradientCard';