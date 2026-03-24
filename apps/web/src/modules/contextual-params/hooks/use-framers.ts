/**
 * @contract FR-001, FR-002, UX-007
 *
 * React Query hooks for framer types and framers.
 * queryKey: ['contextual-params', 'framer-types'] / ['contextual-params', 'framers', filters]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listFramerTypes,
  createFramerType,
  listFramers,
  createFramer,
  updateFramer,
  deleteFramer,
} from '../api/contextual-params.api.js';
import type {
  FramerListFilters,
  CreateFramerTypeRequest,
  CreateFramerRequest,
  UpdateFramerRequest,
} from '../types/contextual-params.types.js';

export const FRAMER_TYPES_KEY = ['contextual-params', 'framer-types'] as const;
export const FRAMERS_KEY = ['contextual-params', 'framers'] as const;

/** @contract FR-001 — GET /admin/framer-types */
export function useFramerTypes() {
  return useQuery({
    queryKey: [...FRAMER_TYPES_KEY],
    queryFn: ({ signal }) => listFramerTypes(signal),
  });
}

/** @contract FR-001 — POST /admin/framer-types */
export function useCreateFramerType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFramerTypeRequest) => createFramerType(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: FRAMER_TYPES_KEY }),
  });
}

/** @contract FR-002 — GET /admin/framers */
export function useFramersList(filters: FramerListFilters) {
  return useQuery({
    queryKey: [...FRAMERS_KEY, filters],
    queryFn: ({ signal }) => listFramers(filters, signal),
  });
}

/** @contract FR-002 — POST /admin/framers */
export function useCreateFramer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFramerRequest) => createFramer(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: FRAMERS_KEY }),
  });
}

/** @contract FR-002 — PATCH /admin/framers/:id */
export function useUpdateFramer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFramerRequest }) => updateFramer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: FRAMERS_KEY }),
  });
}

/** @contract FR-002 — DELETE /admin/framers/:id */
export function useDeleteFramer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFramer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FRAMERS_KEY });
      qc.invalidateQueries({ queryKey: ['contextual-params', 'incidence-rules'] });
    },
  });
}
