/**
 * @contract FR-001, UX-008 §2.3
 *
 * React Query hooks for integration services CRUD.
 * queryKey: ['integration-protheus', 'services', ...filters]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listServices, createService, updateService } from '../api/integration-protheus.api.js';
import type {
  ServiceListFilters,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '../types/integration-protheus.types.js';

export const SERVICES_KEY = ['integration-protheus', 'services'] as const;

/** @contract FR-001 — GET /admin/integration-services */
export function useServicesList(filters: ServiceListFilters = {}) {
  return useQuery({
    queryKey: [...SERVICES_KEY, filters],
    queryFn: ({ signal }) => listServices(filters, signal),
  });
}

/** @contract FR-001 — POST /admin/integration-services */
export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => createService(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}

/** @contract FR-001 — PATCH /admin/integration-services/:id */
export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) =>
      updateService(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY }),
  });
}
