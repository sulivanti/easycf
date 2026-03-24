/**
 * @contract UX-USR-003, FR-003, BR-002, BR-004, BR-006
 * Invite status page — status card + resend with 60s cooldown.
 * Scope guard: users:user:read for viewing, users:user:write for resend.
 * LGPD: title and card use NAME, never email.
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui';
import { Badge } from '@shared/ui';
import { Skeleton } from '@shared/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/ui';
import { useUserDetail } from '../hooks/use-user-detail.js';
import { useResendInvite } from '../hooks/use-resend-invite.js';
import { COPY, toUserInviteViewModel } from '../types/users.types.js';
import { ApiError } from '../../foundation/api/http-client.js';

interface UserInvitePageProps {
  userId: string;
  userScopes: readonly string[];
  onNavigateBack: () => void;
}

export function UserInvitePage({ userId, userScopes, onNavigateBack }: UserInvitePageProps) {
  const { data: userDetail, isLoading, isError, error, refetch } = useUserDetail(userId);
  const {
    mutateAsync: resend,
    isPending: resendLoading,
    cooldownRemaining,
    isCoolingDown,
  } = useResendInvite(userId);

  const viewModel = userDetail ? toUserInviteViewModel(userDetail, userScopes) : null;

  const handleResend = useCallback(async () => {
    try {
      await resend();
      // @contract BR-002 — toast never shows email
      toast.success(COPY.toast.inviteResent);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 422) {
        toast.error(COPY.error.userStatusChanged);
        refetch();
      } else {
        toast.error(COPY.error.resendInviteFailed, {
          description: apiErr?.correlationId ? `ID: ${apiErr.correlationId}` : undefined,
        });
      }
    }
  }, [resend, refetch]);

  // ── Skeleton loading ─────────────────────────────────────
  if (isLoading && !userDetail) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onNavigateBack}>
            &larr; Usuários
          </Button>
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  // ── 404 — user not found ─────────────────────────────────
  if (isError && error instanceof ApiError && error.status === 404) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onNavigateBack}>
            &larr; Usuários
          </Button>
          <h1 className="text-xl font-semibold">Convite</h1>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">{COPY.label.userNotFound}</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────
  if (isError) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onNavigateBack}>
            &larr; Usuários
          </Button>
          <h1 className="text-xl font-semibold">Convite</h1>
        </div>
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{COPY.error.loadUserFailed}</p>
          {error instanceof ApiError && error.correlationId && (
            <p className="mt-1 text-xs text-destructive/70">
              Correlation ID: {error.correlationId}
            </p>
          )}
          <Button variant="link" size="sm" className="mt-2 p-0" onClick={() => refetch()}>
            {COPY.label.retry}
          </Button>
        </div>
      </div>
    );
  }

  if (!viewModel) return null;

  const isResendDisabled = resendLoading || isCoolingDown;

  function getResendButtonText(): string {
    if (resendLoading) return 'Enviando...';
    if (isCoolingDown) return COPY.label.cooldownTimer(cooldownRemaining);
    return 'Reenviar convite';
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onNavigateBack}>
          &larr; Usuários
        </Button>
        <h1 className="text-xl font-semibold">Convite — {viewModel.displayName}</h1>
      </div>

      {/* Status Card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">{viewModel.displayName}</h2>
          <Badge variant={viewModel.statusBadge.variant}>{viewModel.statusBadge.label}</Badge>
        </div>

        {/* Status-specific content */}
        {viewModel.status === 'PENDING' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{COPY.label.invitePending}</p>
            {viewModel.isInviteExpired && (
              <div className="rounded-md bg-warning/10 p-3">
                <p className="text-sm text-warning">{COPY.label.inviteExpired}</p>
              </div>
            )}
          </div>
        )}

        {viewModel.status === 'ACTIVE' && (
          <p className="text-sm text-muted-foreground">{COPY.label.userActive}</p>
        )}

        {viewModel.status === 'BLOCKED' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground">{COPY.label.userBlocked}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{COPY.label.userBlocked}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {viewModel.status === 'INACTIVE' && (
          <p className="text-sm text-muted-foreground">{COPY.label.userInactive}</p>
        )}

        {/* Resend section — only for PENDING with write scope */}
        {viewModel.showResendSection && viewModel.canResendInvite && (
          <div className="border-t pt-4">
            <Button
              onClick={handleResend}
              disabled={isResendDisabled}
              aria-busy={resendLoading}
              aria-disabled={isResendDisabled}
            >
              {getResendButtonText()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
