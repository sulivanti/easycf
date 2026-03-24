/**
 * @contract FR-002, BR-005, UX-USR-002
 * React Query mutation for user creation with Idempotency-Key.
 * Invalidates users list on success.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '../api/users.api.js';
import { USERS_LIST_KEY } from './use-users-list.js';
import type { CreateUserRequest } from '../types/users.types.js';

export function useCreateUser() {
  const qc = useQueryClient();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_LIST_KEY });
    },
  });

  const regenerateKey = useCallback(() => setIdempotencyKey(crypto.randomUUID()), []);

  return { ...mutation, idempotencyKey, regenerateKey };
}
