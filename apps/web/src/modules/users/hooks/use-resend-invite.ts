/**
 * @contract FR-003, BR-004, BR-005, UX-USR-003
 * React Query mutation for invite resend with 60s cooldown.
 * Cooldown starts only on success; error does NOT start cooldown.
 * Invalidates user detail on success.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resendInvite } from '../api/users.api.js';
import { USER_DETAIL_KEY } from './use-user-detail.js';

const COOLDOWN_SECONDS = 60;

export function useResendInvite(userId: string) {
  const qc = useQueryClient();
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldownRemaining(COOLDOWN_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mutation = useMutation({
    mutationFn: () => resendInvite(userId),
    onSuccess: () => {
      startCooldown();
      qc.invalidateQueries({ queryKey: [...USER_DETAIL_KEY, userId] });
    },
  });

  return {
    ...mutation,
    cooldownRemaining,
    isCoolingDown: cooldownRemaining > 0,
  };
}
