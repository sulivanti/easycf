/**
 * @contract FR-009, UX-MCP-002, SEC-010, UX-010-M01 (D12)
 *
 * Split-view detail panel for MCP executions.
 * Privilege escalation block (red), sanitized payload viewer,
 * linked movement navigation to UX-APROV-001.
 *
 * D12 — Grouped sections, styled JSON viewer, escalation alert box,
 * full-width "Ver no inbox" button.
 */

import { AlertTriangle } from 'lucide-react';
import {
  Badge,
  Button,
  Skeleton,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@shared/ui';
import type { McpExecutionDetail } from '../types/mcp-automation.types.js';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DIRECT_SUCCESS: 'default',
  EVENT_EMITTED: 'secondary',
  CONTROLLED_PENDING: 'outline',
  CONTROLLED_APPROVED: 'default',
  CONTROLLED_REJECTED: 'destructive',
  DIRECT_FAILED: 'destructive',
  BLOCKED: 'destructive',
  RECEIVED: 'secondary',
  DISPATCHED: 'secondary',
};

interface ExecutionDetailPanelProps {
  detail: McpExecutionDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function ExecutionDetailPanel({ detail, loading, onClose }: ExecutionDetailPanelProps) {
  if (loading) {
    return (
      <aside
        className="flex w-full flex-col gap-4 border-l bg-background p-4 lg:w-[40%]"
        role="complementary"
        aria-label="Detalhe da execução"
      >
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full" />
      </aside>
    );
  }

  if (!detail) return null;

  const isEscalation =
    detail.status === 'BLOCKED' && detail.blocked_reason?.includes('privilege_escalation');

  return (
    <aside
      className="flex w-full flex-col gap-5 overflow-y-auto border-l bg-background p-4 lg:w-[40%]"
      role="complementary"
      aria-label="Detalhe da execução"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Detalhe da Execução</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>

      {/* D12 — Escalation alert box */}
      {isEscalation && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive bg-red-50 p-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-4 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-bold text-destructive">
              TENTATIVA DE ESCALADA DE PRIVILÉGIO
            </p>
            {detail.blocked_reason && (
              <p className="mt-1 text-sm text-destructive/80">{detail.blocked_reason}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Badge variant={STATUS_VARIANT[detail.status] ?? 'secondary'}>{detail.status}</Badge>
        {isEscalation && <Badge variant="destructive">Escalada</Badge>}
      </div>

      {/* D12 — Grouped sections with uppercase headers */}

      {/* AGENTE section */}
      <section className="space-y-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-a1-text-auxiliary">
          Agente
        </h4>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-medium text-muted-foreground">ID</dt>
          <dd className="font-mono text-xs">{detail.agent_id}</dd>
        </dl>
      </section>

      {/* AÇÃO section */}
      <section className="space-y-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-a1-text-auxiliary">
          Ação
        </h4>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-medium text-muted-foreground">ID</dt>
          <dd className="font-mono text-xs">{detail.action_id}</dd>
          <dt className="font-medium text-muted-foreground">Política</dt>
          <dd>{detail.policy_applied}</dd>
        </dl>
      </section>

      {/* EXECUÇÃO section */}
      <section className="space-y-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-a1-text-auxiliary">
          Execução
        </h4>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-medium text-muted-foreground">ID</dt>
          <dd className="font-mono text-xs">{detail.id}</dd>

          <dt className="font-medium text-muted-foreground">Correlation ID</dt>
          <dd>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="cursor-pointer font-mono text-xs hover:underline"
                    onClick={() => navigator.clipboard.writeText(detail.correlation_id)}
                  >
                    {detail.correlation_id}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Clique para copiar o correlation ID</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </dd>

          <dt className="font-medium text-muted-foreground">IP Origem</dt>
          <dd>{detail.origin_ip ?? '\u2014'}</dd>

          <dt className="font-medium text-muted-foreground">Duração</dt>
          <dd>{detail.duration_ms != null ? `${detail.duration_ms}ms` : '\u2014'}</dd>

          <dt className="font-medium text-muted-foreground">Início</dt>
          <dd>{new Date(detail.received_at).toLocaleString('pt-BR')}</dd>

          <dt className="font-medium text-muted-foreground">Conclusão</dt>
          <dd>
            {detail.completed_at ? new Date(detail.completed_at).toLocaleString('pt-BR') : '\u2014'}
          </dd>

          {detail.blocked_reason && (
            <>
              <dt className="font-medium text-muted-foreground">Motivo Bloqueio</dt>
              <dd className="text-destructive">{detail.blocked_reason}</dd>
            </>
          )}

          {detail.error_message && (
            <>
              <dt className="font-medium text-muted-foreground">Erro</dt>
              <dd className="text-destructive">{detail.error_message}</dd>
            </>
          )}
        </dl>
      </section>

      {/* PAYLOAD section — D12 styled JSON viewer */}
      <section className="space-y-3">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-a1-text-auxiliary">
          Payload
        </h4>

        <details open>
          <summary className="cursor-pointer text-sm font-semibold">Request Payload</summary>
          {/* D12 — JSON viewer: bg gray, rounded */}
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed">
            {JSON.stringify(detail.request_payload, null, 2)}
          </pre>
        </details>

        {detail.result_payload && (
          <details>
            <summary className="cursor-pointer text-sm font-semibold">Result Payload</summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed">
              {JSON.stringify(detail.result_payload, null, 2)}
            </pre>
          </details>
        )}
      </section>

      {/* D12 — Full-width "Ver no inbox" button */}
      {detail.linked_movement_id && detail.status === 'CONTROLLED_PENDING' && (
        <Button variant="outline" className="w-full" asChild>
          <a href={`/aprovacoes/${detail.linked_movement_id}`}>Ver no inbox de aprovações</a>
        </Button>
      )}
    </aside>
  );
}
