/**
 * @contract UX-APROV-001
 * Countdown timer showing time remaining until SLA deadline.
 * Displays in hh:mm:ss format; turns red when < 1 hour.
 */

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: string;
  className?: string;
}

function computeRemaining(deadline: string): number {
  return Math.max(0, new Date(deadline).getTime() - Date.now());
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function CountdownTimer({ deadline, className }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => computeRemaining(deadline));

  useEffect(() => {
    const id = setInterval(() => {
      const r = computeRemaining(deadline);
      setRemaining(r);
      if (r <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const isUrgent = remaining > 0 && remaining < 3_600_000;
  const isExpired = remaining <= 0;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono ${
        isExpired
          ? 'bg-muted text-muted-foreground line-through'
          : isUrgent
            ? 'bg-destructive/10 text-destructive font-semibold'
            : 'bg-secondary text-secondary-foreground'
      } ${className ?? ''}`}
      title={`Prazo: ${new Date(deadline).toLocaleString('pt-BR')}`}
    >
      {isExpired ? 'Expirado' : formatTime(remaining)}
    </span>
  );
}
