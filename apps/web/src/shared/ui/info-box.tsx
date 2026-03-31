/**
 * @contract UX-000-M04, 07-role-form-spec
 * InfoBox — informational box with icon + text.
 * bg #F0F8FF, radius 8px, text #2E86C1.
 */

import * as React from 'react';
import { InfoIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';

interface InfoBoxProps {
  children: React.ReactNode;
  className?: string;
}

function InfoBox({ children, className }: InfoBoxProps) {
  return (
    <div
      data-slot="info-box"
      className={cn('flex items-start gap-2.5 rounded-lg bg-[#F0F8FF] px-4 py-3', className)}
    >
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary-600" />
      <span className="text-[13px] text-primary-600">{children}</span>
    </div>
  );
}

export { InfoBox };
export type { InfoBoxProps };
