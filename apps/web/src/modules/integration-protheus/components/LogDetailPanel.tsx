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
            <p className="text-sm">
              {log.attempt_number} de {log.retry_max}
            </p>
          </div>
          {log.response_status && (
            <div>
              <p className="text-xs text-muted-foreground">HTTP Status</p>
              <p className={`text-sm ${httpStatusClass(log.response_status)}`}>{log.response_status}</p>
            </div>
          )}
          {log.duration_ms != null && (
            <div>
              <p className="text-xs text-muted-foreground">Duração</p>
              <p className="text-sm">{log.duration_ms}ms</p>
            </div>
          )}
          {log.case_id && (
            <a
              href={`/casos/${log.case_id}`}
              className="inline-block text-sm text-blue-600 hover:underline"
            >
              {COPY.link_view_case}
            </a>
          )}
        </div>
      </CollapsibleSection>

      {/* Error */}
      {log.error_message && (
        <CollapsibleSection title="Erro" defaultOpen titleColor="#C0392B">
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-red-50 p-3 text-xs text-red-800">
            {log.error_message}
          </pre>
        </CollapsibleSection>
      )}

      {/* Request payload */}
      {log.request_payload && (
        <CollapsibleSection title="Request Payload">
          <JSONViewer data={log.request_payload} maxHeight={200} />
        </CollapsibleSection>
      )}

      {/* Request headers */}
      {log.request_headers && (
        <CollapsibleSection title="Request Headers">
          <TooltipProvider>
            <pre className="max-h-48 overflow-auto rounded-md border border-[#E8E8E6] bg-[#F8F8F6] p-3 text-xs">
              {Object.entries(log.request_headers).map(([k, v]) => (
                <div key={k}>
                  <span className="font-semibold">{k}:</span>{' '}
                  {v === '***' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground">***</span>
                      </TooltipTrigger>
                      <TooltipContent>{COPY.sensitive_masked_tooltip}</TooltipContent>
                    </Tooltip>
                  ) : (
                    String(v)
                  )}
                </div>
              ))}
            </pre>
          </TooltipProvider>
        </CollapsibleSection>
      )}

      {/* Response body */}
      {log.response_body && (
        <CollapsibleSection title="Response Body">
          <JSONViewer data={log.response_body} maxHeight={200} />
        </CollapsibleSection>
      )}

      {/* Chain: parent log */}
      {log.parent_log_id && (
        <CollapsibleSection title="Cadeia de Reprocessamento" defaultOpen>
          <div>
            <p className="text-xs text-muted-foreground">Log anterior</p>
            <button
              onClick={() => onSelectLog(log.parent_log_id!)}
              className="text-sm text-blue-600 hover:underline"
            >
              {log.parent_log_id.slice(0, 12)}...
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
