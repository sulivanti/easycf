/**
 * @contract FR-008, FR-009, UX-007, UX-008
 * Tenant hooks — CRUD + tenant-user bindings.
 * Uses @tanstack/react-query for server state (PKG-COD-001 §3.5).
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { tenantsApi } from '../api/tenants.api.js';
import type {
  TenantListItem,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantUserListItem,
  AddTenantUserRequest,
} from '../types/tenant.types.js';
import type { PaginatedResponse } from '../types/common.types.js';

export const tenantKeys = {
  all: ['tenants'] as const,
  list: () => ['tenants', 'list'] as const,
  users: (tenantId: string) => ['tenants', tenantId, 'users'] as const,
};

// -- useTenants (infinite list) --

export function useTenants(initialLimit = 20) {
  const query = useInfiniteQuery<PaginatedResponse<TenantListItem>>({
    queryKey: tenantKeys.list(),
    queryFn: ({ pageParam }) =>
      tenantsApi.list({
        cursor: pageParam as string | undefined,
        limit: initialLimit,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const tenants = query.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    tenants,
    loading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    loadMore: () => query.fetchNextPage(),
    refresh: () => query.refetch(),
  };
}

// -- useCreateTenant --

export function useCreateTenant() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, CreateTenantRequest>({
    mutationFn: (data) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });

  return {
    createTenant: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useUpdateTenant --

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, { id: string; data: UpdateTenantRequest }>({
    mutationFn: ({ id, data }) => tenantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });

  return {
    updateTenant: (id: string, data: UpdateTenantRequest) => mutation.mutateAsync({ id, data }),
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useDeleteTenant --

export function useDeleteTenant() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (id) => tenantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });

  return {
    deleteTenant: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}

// -- useTenantUsers --

export function useTenantUsers(tenantId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<TenantUserListItem[]>({
    queryKey: tenantKeys.users(tenantId ?? ''),
    queryFn: async () => {
      const res = await tenantsApi.listUsers(tenantId!);
      return res.data;
    },
    enabled: !!tenantId,
  });

  const addMutation = useMutation<void, Error, AddTenantUserRequest>({
    mutationFn: (data) => tenantsApi.addUser(tenantId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.users(tenantId!) });
    },
  });

  const removeMutation = useMutation<void, Error, string>({
    mutationFn: (userId) => tenantsApi.removeUser(tenantId!, userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData<TenantUserListItem[]>(
        tenantKeys.users(tenantId!),
        (prev) => prev?.filter((u) => u.user_id !== userId) ?? [],
      );
    },
  });

  return {
    users: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: tenantKeys.users(tenantId!) }),
    addUser: addMutation.mutateAsync,
    removeUser: removeMutation.mutateAsync,
    mutating: addMutation.isPending || removeMutation.isPending,
  };
}
