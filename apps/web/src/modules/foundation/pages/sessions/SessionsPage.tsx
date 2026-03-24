/**
 * @contract UX-003, FR-002
 * Sessions management — list active sessions + kill-switch (individual/global).
 * States: Loading (skeleton), Empty, Error (toast RFC 9457).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { useSessions } from '../../hooks/use-sessions.js';

function SessionsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function SessionsPage() {
  const { sessions, loading, error, revokeSession, revokeAll, revoking } = useSessions();

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
    } catch {
      toast.error('Erro ao encerrar sessões.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sessões ativas</h1>
        {sessions.length > 0 && (
          <Button variant="destructive" size="sm" isLoading={revoking} onClick={handleRevokeAll}>
            Encerrar todas
          </Button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p>{error.message}</p>
        </div>
      )}

      {loading ? (
        <SessionsSkeleton />
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma sessão ativa encontrada.</p>
      ) : (
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
                <TableCell className="font-medium">{session.device_fp ?? 'Desconhecido'}</TableCell>
                <TableCell>{new Date(session.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell>{new Date(session.expires_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  {session.is_current ? (
                    <Badge variant="default">Atual</Badge>
                  ) : (
                    <Badge variant="secondary">Ativa</Badge>
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
      )}
    </div>
  );
}

export default SessionsPage;
