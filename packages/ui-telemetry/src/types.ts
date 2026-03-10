// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Tipos do UIActionEnvelope — DOC-ARC-003, FR-000-F13

/**
 * Status de uma ação de UI
 * - `requested`: ação iniciada pelo usuário
 * - `succeeded`: ação concluída com sucesso
 * - `failed`: ação falhou
 */
export type UIActionStatus = 'requested' | 'succeeded' | 'failed';

/**
 * UIActionEnvelope — DOC-ARC-003
 *
 * Envelope padrão para telemetria de ações de UI no EasyCodeFramework.
 * Todos os campos marcados como obrigatórios são requeridos pelo FR-000-F13.
 *
 * Rastreia: screen_id (DOC-UX-010), operation_id (OpenAPI), correlation_id (DOC-ARC-003)
 */
export interface UIActionEnvelope {
    /** ID da tela de origem conforme DOC-UX-010 (ex: 'SCR-AUTH-LOGIN') */
    screen_id: string;

    /** Nome canônico da ação (ex: 'login', 'create_user', 'upload_avatar') */
    action: string;

    /** operationId da rota OpenAPI correspondente (ex: 'postAuthLogin') */
    operation_id: string;

    /** X-Correlation-ID propagado da API — rastreabilidade E2E */
    correlation_id: string;

    /** Status atual da ação */
    status: UIActionStatus;

    /** Duração em milissegundos (0 quando status=requested) */
    duration_ms: number;

    /** Timestamp ISO 8601 do momento do envelope */
    timestamp: string;

    /** HTTP status code (apenas quando status !== 'requested') */
    http_status?: number;

    /** Mensagem de erro (apenas quando status === 'failed') */
    error_message?: string;

    /** Metadados adicionais sem PII obrigatório (LGPD — SEC-000) */
    metadata?: Record<string, unknown>;
}

/**
 * Payload para construir um UIActionEnvelope de abertura (status: 'requested')
 */
export interface UIActionStartPayload {
    screen_id: string;
    action: string;
    operation_id: string;
    correlation_id: string;
    metadata?: Record<string, unknown>;
}

/**
 * Payload para finalizar um UIActionEnvelope (succeeded ou failed)
 */
export interface UIActionCompletePayload {
    status: 'succeeded' | 'failed';
    duration_ms: number;
    http_status?: number;
    error_message?: string;
    metadata?: Record<string, unknown>;
}
