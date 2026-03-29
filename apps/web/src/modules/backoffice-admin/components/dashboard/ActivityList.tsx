/**
 * @contract UX-000-M02, UX-DASH-001
 * Activity list — header with title + "VER TUDO" link, vertical item list.
 */

import { ActivityItem, type ActivityItemProps } from './ActivityItem';

interface ActivityListProps {
  title: string;
  items: ActivityItemProps[];
  onViewAll?: () => void;
}

function ActivityList({ title, items, onViewAll }: ActivityListProps) {
  return (
    <div className="rounded-2xl border border-a1-border bg-white p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-a1-text-primary">{title}</h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[10px] font-bold uppercase tracking-[1px] text-primary-600 hover:text-primary-700"
          >
            VER TUDO
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <ActivityItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

export { ActivityList };
export type { ActivityListProps };
