// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Builder e emitter de UIActionEnvelope — DOC-ARC-003, FR-000-F13

import type {
    UIActionCompletePayload,
    UIActionEnvelope,
    UIActionStartPayload,
    UIActionStatus,
} from './types.js';

/**
 * UIActionEmitter
 *
 * Utilitário para emitir envelopes de telemetria de UI em três eventos:
 * - `ux.action.requested`: quando a ação é iniciada
 * - `ux.action.succeeded`: quando a ação conclui com êxito
 * - `ux.action.failed`: quando a ação falha
 *
 * Ref: DOC-ARC-003, FR-000-F13, SEC-000 (sem PII no payload)
 *
 * @example
 * const emitter = new UIActionEmitter((event, envelope) => {
 *   analytics.track(event, envelope);
 * });
 *
 * const startedAt = Date.now();
 * emitter.requested({ screen_id: 'SCR-AUTH-LOGIN', action: 'login',
 *   operation_id: 'postAuthLogin', correlation_id: headers['x-correlation-id'] });
 *
 * try {
 *   await api.login(credentials);
 *   emitter.succeeded({ duration_ms: Date.now() - startedAt, http_status: 200 });
 * } catch (err) {
 *   emitter.failed({ duration_ms: Date.now() - startedAt, error_message: err.message });
 * }
 */
export class UIActionEmitter {
    private currentPayload: UIActionStartPayload | null = null;

    constructor(
        private readonly emit: (
            eventName: `ux.action.${UIActionStatus}`,
            envelope: UIActionEnvelope,
        ) => void,
    ) { }

    /**
     * Emite `ux.action.requested` e armazena o payload para os próximos eventos
     */
    requested(payload: UIActionStartPayload): void {
        this.currentPayload = payload;
        const envelope = buildEnvelope(payload, 'requested', {
            duration_ms: 0,
        });
        this.emit('ux.action.requested', envelope);
    }

    /**
     * Emite `ux.action.succeeded` — requer que `requested()` tenha sido chamado antes
     */
    succeeded(payload: Omit<UIActionCompletePayload, 'status'>): void {
        if (!this.currentPayload) {
            throw new Error('[UIActionEmitter] Chame requested() antes de succeeded()');
        }
        const envelope = buildEnvelope(this.currentPayload, 'succeeded', {
            ...payload,
        });
        this.emit('ux.action.succeeded', envelope);
        this.currentPayload = null;
    }

    /**
     * Emite `ux.action.failed` — requer que `requested()` tenha sido chamado antes
     */
    failed(payload: Omit<UIActionCompletePayload, 'status'>): void {
        if (!this.currentPayload) {
            throw new Error('[UIActionEmitter] Chame requested() antes de failed()');
        }
        const envelope = buildEnvelope(this.currentPayload, 'failed', {
            ...payload,
        });
        this.emit('ux.action.failed', envelope);
        this.currentPayload = null;
    }
}

/**
 * Função pura para construir um UIActionEnvelope
 */
export function buildEnvelope(
    start: UIActionStartPayload,
    status: UIActionStatus,
    complete: Omit<UIActionCompletePayload, 'status'>,
): UIActionEnvelope {
    return {
        screen_id: start.screen_id,
        action: start.action,
        operation_id: start.operation_id,
        correlation_id: start.correlation_id,
        status,
        duration_ms: complete.duration_ms,
        timestamp: new Date().toISOString(),
        http_status: complete.http_status,
        error_message: complete.error_message,
        metadata: {
            ...start.metadata,
            ...complete.metadata,
        },
    };
}
