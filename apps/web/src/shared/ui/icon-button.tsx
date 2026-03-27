import * as React from 'react';

import { cn } from '@shared/lib/utils';
import { buttonVariants } from '@shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip';

interface IconButtonProps extends React.ComponentProps<'button'> {
  icon: React.ReactNode;
  label: string;
  size?: 'xs' | 'sm' | 'default';
  variant?: 'ghost' | 'outline' | 'default';
}

function IconButton({
  icon,
  label,
  size = 'default',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  const sizeMap = { xs: 'icon-xs', sm: 'icon-sm', default: 'icon' } as const;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot="icon-button"
          aria-label={label}
          className={cn(buttonVariants({ variant, size: sizeMap[size] }), className)}
          {...props}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { IconButton };
export type { IconButtonProps };
