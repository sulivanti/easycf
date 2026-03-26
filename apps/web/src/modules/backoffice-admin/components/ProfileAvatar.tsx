/**
 * @contract FR-000-C06, UX-SHELL-001, DOC-UX-011 §2.2
 *
 * ProfileAvatar — renders user avatar image with initials fallback.
 * Supports A1 brand color (useA1Color) or deterministic background color.
 */

import { useState } from 'react';
import { cn } from '@shared/lib/utils';

interface ProfileAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  useA1Color?: boolean;
}

const SIZE_CLASSES = {
  sm: 'size-[30px] text-[11px]',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
} as const;

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ProfileAvatar({ name, avatarUrl, size = 'md', className, useA1Color }: ProfileAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZE_CLASSES[size];

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn('rounded-full object-cover', sizeClass, className)}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold text-white',
        sizeClass,
        useA1Color ? 'bg-a1-accent' : getAvatarColor(name),
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
