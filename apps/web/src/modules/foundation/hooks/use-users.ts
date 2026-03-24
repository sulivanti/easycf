/**
 * @contract FR-006, UX-004
 * User hooks — list (cursor-based), detail, create, update, delete.
 * Uses @tanstack/react-query for server state (PKG-COD-001 §3.5).
 */

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api.js';
import type {
  UserListItem,
  UserDetail,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
} from '../types/user.types.js';
import type { PaginatedResponse } from '../types/common.types.js';

export const userKeys = {
  all: ['users'] as const,
  list: (q?: string) => ['users', 'list', q ?? ''] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

// -- useUsers (infinite list) --

export function useUsers(initialLimit = 20, searchQuery = '') {
  const query = useInfiniteQuery<PaginatedResponse<UserListItem>>({
    queryKey: userKeys.list(searchQuery),
    queryFn: ({ pageParam }) =>
      usersApi.list({
        cursor: pageParam as string | undefined,
        limit: initialLimit,
        q: searchQuery || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });

  const users = query.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    users,
    loading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    loadMore: () => query.fetchNextPage(),
    refresh: () => query.refetch(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

// -- useUser (detail) --

export function useUser(id: string | null) {
  const query = useQuery<UserDetail>({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  });

  return {
    user: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
  };
}

// -- useCreateUser --

export function useCreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateUserResponse, Error, CreateUserRequest>({
    mutationFn: (data) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  return {
    createUser: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useUpdateUser --

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, { id: string; data: UpdateUserRequest }>({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  return {
    updateUser: (id: string, data: UpdateUserRequest) => mutation.mutateAsync({ id, data }),
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useDeleteUser --

export function useDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}
