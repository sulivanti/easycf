/**
 * @contract FR-001, FR-003, FR-004, FR-005, FR-015, UX-001
 * Auth hooks — login, logout, profile, MFA, password flows.
 * Uses @tanstack/react-query for server state (DOC-UX-012 §5, PKG-COD-001 §3.5).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '../api/auth.api.js';
import type {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MfaVerifyRequest,
  MfaSetupResponse,
} from '../types/auth.types.js';
import { isMfaRequired } from '../types/auth.types.js';

// -- Token storage --

const AUTH_STORAGE_KEY = 'auth_tokens';

function persistTokens(tokens: LoginResponse): void {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    }),
  );
}

function clearTokens(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// -- Query keys --

export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

// -- useLogin --

export function useLogin() {
  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (result) => {
      if (!isMfaRequired(result)) {
        persistTokens(result);
      }
    },
  });

  return {
    login: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useLogout --

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearTokens();
      queryClient.clear();
      navigate({ to: '/login' });
    },
  });

  return {
    logout: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}

// -- useProfile --

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: authKeys.profile,
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProfileResponse>(authKeys.profile, updated);
    },
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: authKeys.profile }),
    updateProfile: updateMutation.mutateAsync,
  };
}

// -- useMfaVerify (login flow) --

export function useMfaVerify() {
  const mutation = useMutation({
    mutationFn: (data: MfaVerifyRequest) => authApi.mfaVerify(data),
    onSuccess: (result) => {
      persistTokens(result);
    },
  });

  return {
    verify: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useMfaSetup --

export function useMfaSetup() {
  const setupMutation = useMutation({
    mutationFn: () => authApi.mfaSetup(),
  });

  const disableMutation = useMutation({
    mutationFn: () => authApi.mfaDisable(),
  });

  return {
    setup: setupMutation.mutateAsync as () => Promise<MfaSetupResponse>,
    disable: disableMutation.mutateAsync,
    loading: setupMutation.isPending || disableMutation.isPending,
  };
}

// -- useChangePassword --

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  });

  return {
    changePassword: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}

// -- useForgotPassword --

export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });

  return {
    forgotPassword: mutation.mutateAsync,
    loading: mutation.isPending,
    submitted: mutation.isSuccess,
  };
}

// -- useResetPassword --

export function useResetPassword() {
  const mutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });

  return {
    resetPassword: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    success: mutation.isSuccess,
  };
}
