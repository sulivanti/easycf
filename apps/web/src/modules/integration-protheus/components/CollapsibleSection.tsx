/**
 * @contract UX-008-M01 §5
 *
 * Collapsible section with rotating chevron icon.
 */

import { useState } from 'react';

export interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  titleColor?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  titleColor = '#111',
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 py-1"
      >
        <svg
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            color: titleColor,
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span
          className="text-sm font-bold"
          style={{ color: titleColor }}
        >
          {title}
        </span>
      </button>
      {isOpen && <div className="pl-5.5 pt-1">{children}</div>}
    </div>
  );
}
