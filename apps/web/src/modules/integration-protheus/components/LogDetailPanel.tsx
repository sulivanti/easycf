/**
 * @contract UX-008 §3.3, FR-009, UX-008-M01 §7
 *
 * Split-view detail panel: Summary, Request, Response, Error, Reprocess chain.
 * Uses CollapsibleSection and JSONViewer for payload display.
 */

import {
  Badge,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui';
import { STATUS_BADGE, httpStatusClass, COPY } from '../types/view-model.js';
import { CollapsibleSection } from './CollapsibleSection.js';
import { JSONViewer } from './JSONViewer.js';
import type { CallLogDetailDTO } from '../types/integration-protheus.types.js';

interface LogDetailPanelProps {
  log: CallLogDetailDTO | undefined;
  isLoading: boolean;
  onSelectLog: (id: string) => void;
}

export function LogDetailPanel({ log, isLoading, onSelectLog }: LogDetailPanelProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!log) return null;

  return (
    <div className="space-y-4 overflow-y-auto">
      {/* Summary section */}
      <CollapsibleSection title="Resumo" defaultOpen>
        <div className="space-y-3">
          {log.routine_name && (
            <div>
              <p className="text-xs text-muted-foreground">Rotina</p>
              <p className="text-[13px]">{log.routine_name}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className={STATUS_BADGE[log.status]}>{log.status}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Correlation ID</p>
            <p className="font-mono text-xs">{log.correlation_id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tentativa</p>
            <p className="text-[13px]">
              {log.attempt_number} de {log.retry_max}
            </p>
          </div>
          {log.response_status && (
            <div>
              <p className="text-xs text-muted-foreground">HTTP Status</p>
              <p className={`text-[13px] ${httpStatusClass(log.response_status)}`}>
                {log.response_status}
              </p>
            </div>
          )}
          {log.duration_ms != null && (
            <div>
              <p className="text-xs text-muted-foreground">Duração</p>
              <p className="text-[13px]">{log.duration_ms}ms</p>
            </div>
          )}
          {log.case_id && (
            <div>
              <p className="text-xs text-muted-foreground">Caso</p>
              <a
                href={`/casos/${log.case_id}`}
                className="text-[13px] font-semibold text-[#2E86C1] hover:underline"
              >
                {COPY.link_view_case}
              </a>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Error — only for FAILED/DLQ */}
      {log.error_message && (log.status === 'FAILED' || log.status === 'DLQ') && (
        <CollapsibleSection title="Erro" defaultOpen titleColor="#C0392B">
          <div className="rounded-md bg-[#FFEBEE] p-3 text-[13px] text-[#333]">
            {log.error_message}
          </div>
        </CollapsibleSection>
      )}

      {/* Request */}
      {(log.request_payload || log.request_headers) && (
        <CollapsibleSection title="Request" defaultOpen>
          <div className="space-y-2">
            {log.request_headers && (
              <TooltipProvider>
                <pre className="max-h-48 overflow-auto rounded-md border border-[#E8E8E6] bg-[#F8F8F6] p-3 font-mono text-xs">
                  {Object.entries(log.request_headers).map(([k, v]) => (
                    <div key={k}>
                      <span className="font-semibold">{k}:</span>{' '}
                      {v === '***' ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[#C0392B]">***</span>
                          </TooltipTrigger>
                          <TooltipContent>{COPY.sensitive_masked_tooltip}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-[#333]">{String(v)}</span>
                      )}
                    </div>
                  ))}
                </pre>
              </TooltipProvider>
            )}
            {log.request_payload && <JSONViewer data={log.request_payload} maxHeight={200} />}
          </div>
        </CollapsibleSection>
      )}

      {/* Response */}
      {log.response_body && (
        <CollapsibleSection title="Response" defaultOpen>
          {log.response_status && (
            <Badge className={`mb-2 ${httpStatusClass(log.response_status)}`}>
              {log.response_status}
            </Badge>
          )}
          <JSONViewer data={log.response_body} maxHeight={200} />
        </CollapsibleSection>
      )}

      {/* Histórico de Tentativas */}
      {log.parent_log_id && (
        <CollapsibleSection title="Histórico de Tentativas">
          <div className="flex items-center gap-2 border-b border-[#F0F0EE] py-2">
            <span className="text-xs font-semibold text-[#333]">Log anterior</span>
            <button
              onClick={() => onSelectLog(log.parent_log_id!)}
              className="text-xs font-semibold text-[#2E86C1] hover:underline"
            >
              Ver
            </button>
          </div>
        </CollapsibleSection>
      )}

      {/* Reprocess info */}
      {log.reprocess_reason && (
        <div>
          <p className="text-xs text-muted-foreground">Motivo do reprocessamento</p>
          <p className="text-sm">{log.reprocess_reason}</p>
          {log.reprocessed_by && (
            <p className="text-xs text-muted-foreground">por {log.reprocessed_by}</p>
          )}
        </div>
      )}
    </div>
  );
}
