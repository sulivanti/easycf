/**
 * @contract FR-006, DATA-003, NFR-001 §3, SEC-002
 *
 * Telemetria UI via UIActionEnvelope (DOC-ARC-003 §2).
 * - Pré-auth (UX-AUTH-001): sem tenant_id
 * - Pós-auth (UX-SHELL-001, UX-DASH-001): com tenant_id
 * - X-Correlation-ID propagado via apiRequest
 * - Fire-and-forget: falha na emissão NÃO bloqueia a ação do usuário
 */

import type { ScreenId, UIActionEnvelope } from '../types/backoffice-admin.types';

export type { ScreenId };

// ---------------------------------------------------------------------------
// Emitter (fire-and-forget)
// ---------------------------------------------------------------------------

type TelemetryListener = (envelope: UIActionEnvelope) => void;

const listeners: TelemetryListener[] = [];

export function onTelemetry(listener: TelemetryListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function emitUIAction(envelope: UIActionEnvelope): void {
  for (const listener of listeners) {
    try {
      listener(envelope);
    } catch {
      // fire-and-forget
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers por lifecycle (requested → succeeded/failed)
// ---------------------------------------------------------------------------

interface EmitOptions {
  screenId: ScreenId;
  actionId: string;
  operationId?: string;
  correlationId: string;
  tenantId?: string;
}

export function emitRequested(opts: EmitOptions): number {
  emitUIAction({
    correlation_id: opts.correlationId,
    screen_id: opts.screenId,
    action_id: opts.actionId,
    operation_id: opts.operationId,
    tenant_id: opts.tenantId,
    status: 'requested',
  });
  return performance.now();
}

export function emitSucceeded(
  opts: EmitOptions & { startTime: number; httpStatus?: number },
): void {
  emitUIAction({
    correlation_id: opts.correlationId,
    screen_id: opts.screenId,
    action_id: opts.actionId,
    operation_id: opts.operationId,
    tenant_id: opts.tenantId,
    status: 'succeeded',
    http_status: opts.httpStatus,
    duration_ms: Math.round(performance.now() - opts.startTime),
  });
}

export function emitFailed(
  opts: EmitOptions & {
    startTime: number;
    httpStatus?: number;
    problemType?: string;
  },
): void {
  emitUIAction({
    correlation_id: opts.correlationId,
    screen_id: opts.screenId,
    action_id: opts.actionId,
    operation_id: opts.operationId,
    tenant_id: opts.tenantId,
    status: 'failed',
    http_status: opts.httpStatus,
    duration_ms: Math.round(performance.now() - opts.startTime),
    problem_type: opts.problemType,
  });
}

// ---------------------------------------------------------------------------
// Client-only helper (navigate_*, skeleton_timeout)
// ---------------------------------------------------------------------------

export function emitClientOnly(opts: {
  screenId: ScreenId;
  actionId: string;
  tenantId?: string;
}): void {
  emitUIAction({
    correlation_id: crypto.randomUUID(),
    screen_id: opts.screenId,
    action_id: opts.actionId,
    tenant_id: opts.tenantId,
    status: 'requested',
  });
}
