/**
 * @contract FR-007, FR-010, UX-006
 * Role hooks — list, detail, create, update (full scope replacement), delete.
 * Uses @tanstack/react-query for server state (PKG-COD-001 §3.5).
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api.js';
import type {
  RoleListItem,
  RoleDetail,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../types/role.types.js';
import type { PaginatedResponse } from '../types/common.types.js';

export const roleKeys = {
  all: ['roles'] as const,
  list: () => ['roles', 'list'] as const,
  detail: (id: string) => ['roles', 'detail', id] as const,
};

// -- useRoles (infinite list) --

export function useRoles(initialLimit = 20) {
  const query = useInfiniteQuery<PaginatedResponse<RoleListItem>>({
    queryKey: roleKeys.list(),
    queryFn: ({ pageParam }) =>
      rolesApi.list({
        cursor: pageParam as string | undefined,
        limit: initialLimit,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const roles = query.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    roles,
    loading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    loadMore: () => query.fetchNextPage(),
    refresh: () => query.refetch(),
  };
}

// -- useRole (detail) --

export function useRole(id: string | null) {
  const query = useQuery<RoleDetail>({
    queryKey: roleKeys.detail(id ?? ''),
    queryFn: () => rolesApi.get(id!),
    enabled: !!id,
  });

  return {
    role: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
  };
}

// -- useCreateRole --

export function useCreateRole() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, CreateRoleRequest>({
    mutationFn: (data) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });

  return {
    createRole: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useUpdateRole (full scope replacement — BR-006) --

export function useUpdateRole() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, { id: string; data: UpdateRoleRequest }>({
    mutationFn: ({ id, data }) => rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });

  return {
    updateRole: (id: string, data: UpdateRoleRequest) => mutation.mutateAsync({ id, data }),
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useDeleteRole --

export function useDeleteRole() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (id) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });

  return {
    deleteRole: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}
