/**
 * @contract UX-000-M02, UX-DASH-001
 * Activity item — colored dot + actor bold + description + badge + timestamp.
 */

import { cn } from '@shared/lib/utils';

interface ActivityBadge {
  code: string;
  variant?: 'normal' | 'danger';
}

interface ActivityItemProps {
  dotColor: string;
  actor: string;
  description: string;
  badge?: ActivityBadge;
  timestamp: string;
}

function ActivityItem({ dotColor, actor, description, badge, timestamp }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[#FAFAF8]">
      <span
        className="mt-1.5 inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-a1-text-tertiary">
          <strong className="font-bold text-a1-text-primary">{actor}</strong> {description}
          {badge && (
            <span
              className={cn(
                'ml-1 inline-flex rounded px-2 py-0.5 text-[10px] font-bold',
                badge.variant === 'danger'
                  ? 'bg-[#FFEBEE] text-[#C0392B]'
                  : 'bg-[#F5F5F3] text-a1-text-secondary',
              )}
            >
              {badge.code}
            </span>
          )}
        </p>
        <p className="mt-1 text-[11px] text-a1-text-hint">{timestamp}</p>
      </div>
    </div>
  );
}

export { ActivityItem };
export type { ActivityItemProps, ActivityBadge };
