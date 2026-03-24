/**
 * @contract FR-002, FR-008, FR-010, UX-008 §2
 *
 * React Query hooks for integration routines (list, configure, publish, fork).
 * queryKey: ['integration-protheus', 'routines']
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listIntegrationRoutines,
  configureRoutine,
  forkRoutine,
  publishRoutine,
} from '../api/integration-protheus.api.js';
import type { ConfigureRoutineRequest } from '../types/integration-protheus.types.js';

export const ROUTINES_KEY = ['integration-protheus', 'routines'] as const;

/** @contract FR-002 — GET /admin/routines?type=INTEGRATION */
export function useIntegrationRoutines() {
  return useQuery({
    queryKey: [...ROUTINES_KEY],
    queryFn: ({ signal }) => listIntegrationRoutines(signal),
  });
}

/** @contract FR-002 — POST /admin/routines/:id/integration-config */
export function useConfigureRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, data }: { routineId: string; data: ConfigureRoutineRequest }) =>
      configureRoutine(routineId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINES_KEY }),
  });
}

/** @contract FR-010 — POST /admin/routines/:id/publish */
export function usePublishRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (routineId: string) => publishRoutine(routineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINES_KEY }),
  });
}

/** @contract FR-008 — POST /admin/routines/:id/fork */
export function useForkRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routineId, changeReason }: { routineId: string; changeReason: string }) =>
      forkRoutine(routineId, { change_reason: changeReason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROUTINES_KEY }),
  });
}
