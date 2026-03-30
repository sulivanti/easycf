/**
 * @contract UX-001-M02 M04
 * InlineEditCard — card reutilizável com dois modos (view / edit).
 * View: header cinza claro, ReadOnlyFields.
 * Edit: header azul claro, inputs editáveis com borda azul.
 */

import { PencilIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface InlineEditCardProps {
  title: string;
  isEditing: boolean;
  children: ReactNode;
}

export function InlineEditCard({ title, isEditing, children }: InlineEditCardProps) {
  return (
    <div className="rounded-xl border border-a1-border bg-white">
      {/* Header */}
      <div
        className="rounded-t-xl px-6 py-4"
        style={{ backgroundColor: isEditing ? '#E3F2FD' : '#F8F8F6' }}
      >
        <h3
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: isEditing ? '#2E86C1' : '#888888' }}
        >
          {isEditing && <PencilIcon className="size-3.5" />}
          {title}{isEditing ? ' — EDITANDO' : ''}
        </h3>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}
