/**
 * @contract UX-003, FR-002
 * Sessions management — list active sessions + kill-switch (individual/global).
 * States: Loading (skeleton), Empty, Error (toast RFC 9457).
 * Design: A1 visual identity with PageHeader, StatusBadge, EmptyState.
 */

import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { PageHeader } from '@shared/ui/page-header';
import { StatusBadge } from '@shared/ui/status-badge';
import { EmptyState } from '@shared/ui/empty-state';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';
import { useState } from 'react';
import { MonitorIcon } from 'lucide-react';
import { useSessions } from '../../hooks/use-sessions.js';

function SessionsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-a1-border" />
      ))}
    </div>
  );
}

export function SessionsPage() {
  const { sessions, loading, error, revokeSession, revokeAll, revoking } = useSessions();
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  async function handleRevoke(sessionId: string) {
    try {
      await revokeSession(sessionId);
      toast.success('Sessão encerrada.');
    } catch {
      toast.error('Erro ao encerrar sessão.');
    }
  }

  async function handleRevokeAll() {
    try {
      await revokeAll();
      toast.success('Todas as sessões encerradas.');
      setConfirmRevokeAll(false);
    } catch {
      toast.error('Erro ao encerrar sessões.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessões ativas"
        description="Gerencie os dispositivos conectados à sua conta."
        actions={
          sessions.length > 0 ? (
            <Button variant="destructive" size="sm" onClick={() => setConfirmRevokeAll(true)}>
              Encerrar todas
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
        >
          <p>{error.message}</p>
        </div>
      )}

      {loading ? (
        <SessionsSkeleton />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<MonitorIcon className="size-12" />}
          title="Nenhuma sessão ativa"
          description="Não há sessões ativas para sua conta no momento."
        />
      ) : (
        <div className="rounded-lg border border-a1-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium text-a1-text-primary">
                    {session.device_fp ?? 'Desconhecido'}
                  </TableCell>
                  <TableCell className="text-a1-text-auxiliary">
                    {new Date(session.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-a1-text-auxiliary">
                    {new Date(session.expires_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {session.is_current ? (
                      <StatusBadge status="success">Atual</StatusBadge>
                    ) : (
                      <StatusBadge status="neutral">Ativa</StatusBadge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!session.is_current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={revoking}
                        onClick={() => handleRevoke(session.id)}
                      >
                        Encerrar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmationModal
        open={confirmRevokeAll}
        onOpenChange={setConfirmRevokeAll}
        title="Encerrar todas as sessões"
        description="Isso encerrará todas as sessões ativas, incluindo dispositivos remotos. Você precisará fazer login novamente."
        variant="destructive"
        confirmLabel="Encerrar todas"
        onConfirm={handleRevokeAll}
        isLoading={revoking}
      />
    </div>
  );
}

export default SessionsPage;
