/**
 * @contract UX-008 §3.3, FR-009
 *
 * Split-view detail panel: Summary, Request, Response, Error, Reprocess chain.
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
      <h3 className="text-base font-semibold">Detalhe</h3>

      {/* Status */}
      <div>
        <p className="text-xs text-muted-foreground">Status</p>
        <Badge className={STATUS_BADGE[log.status]}>{log.status}</Badge>
      </div>

      {/* Correlation ID */}
      <div>
        <p className="text-xs text-muted-foreground">Correlation ID</p>
        <p className="font-mono text-xs">{log.correlation_id}</p>
      </div>

      {/* Attempt */}
      <div>
        <p className="text-xs text-muted-foreground">Tentativa</p>
        <p className="text-sm">
          {log.attempt_number} de {log.retry_max}
        </p>
      </div>

      {/* HTTP Status */}
      {log.response_status && (
        <div>
          <p className="text-xs text-muted-foreground">HTTP Status</p>
          <p className={`text-sm ${httpStatusClass(log.response_status)}`}>{log.response_status}</p>
        </div>
      )}

      {/* Duration */}
      {log.duration_ms != null && (
        <div>
          <p className="text-xs text-muted-foreground">Duração</p>
          <p className="text-sm">{log.duration_ms}ms</p>
        </div>
      )}

      {/* Link to case */}
      {log.case_id && (
        <a
          href={`/casos/${log.case_id}`}
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          {COPY.link_view_case}
        </a>
      )}

      {/* Error */}
      {log.error_message && (
        <details open>
          <summary className="cursor-pointer text-sm font-medium text-red-700">Erro</summary>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-red-50 p-3 text-xs text-red-800">
            {log.error_message}
          </pre>
        </details>
      )}

      {/* Request payload */}
      {log.request_payload && (
        <details>
          <summary className="cursor-pointer text-sm font-medium">Request Payload</summary>
          <pre className="mt-1 max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(log.request_payload, null, 2)}
          </pre>
        </details>
      )}

      {/* Request headers */}
      {log.request_headers && (
        <details>
          <summary className="cursor-pointer text-sm font-medium">Request Headers</summary>
          <TooltipProvider>
            <pre className="mt-1 max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
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
        </details>
      )}

      {/* Response body */}
      {log.response_body && (
        <details>
          <summary className="cursor-pointer text-sm font-medium">Response Body</summary>
          <pre className="mt-1 max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(log.response_body, null, 2)}
          </pre>
        </details>
      )}

      {/* Chain: parent log */}
      {log.parent_log_id && (
        <div>
          <p className="text-xs text-muted-foreground">Log anterior (reprocessamento)</p>
          <button
            onClick={() => onSelectLog(log.parent_log_id!)}
            className="text-sm text-blue-600 hover:underline"
          >
            {log.parent_log_id.slice(0, 12)}...
          </button>
        </div>
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
