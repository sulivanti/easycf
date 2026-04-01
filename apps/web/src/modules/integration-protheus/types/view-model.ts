/**
 * @contract UX-008 §2.6, §2.7, §3.6
 * UI copy/messages, badge classes and helpers for Integration Protheus module (MOD-008).
 */

import type {
  CallLogStatus,
  Environment,
  MappingType,
  ParamType,
  RoutineStatus,
} from './integration-protheus.types.js';

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
export const COPY = {
  // -- Editor (UX-INTEG-001) --
  success_save_config: 'Configuração HTTP salva.',
  success_delete_mapping: 'Mapeamento removido.',
  success_publish: 'Rotina publicada com sucesso.',
  success_fork: (version: number) => `Nova versão criada. Você está editando a versão ${version}.`,
  success_test_queued: 'Teste enfileirado. Acompanhe no Monitor.',

  confirm_test_hml: 'Este teste usará o serviço de homologação (HML). Continuar?',
  confirm_fork_title: 'Nova versão (fork)',
  confirm_fork_body: 'Ao criar nova versão, a rotina atual permanecerá publicada.',
  confirm_delete_mapping: (targetField: string) =>
    `Deseja remover o mapeamento para '${targetField}'?`,

  error_immutable: "Rotina publicada é imutável. Use 'Nova versão' para editar.",
  error_no_hml_service: 'Cadastre um serviço de homologação (HML) para habilitar testes.',
  error_duplicate_mapping: 'Mapeamento duplicado para estes campos.',
  error_duplicate_param: 'Chave de parâmetro já existe.',
  error_reason_too_short: 'Motivo deve ter no mínimo 10 caracteres.',

  prod_warning: 'Atenção: esta rotina chamará o ambiente de PRODUÇÃO.',
  readonly_banner: "Rotina publicada — use 'Nova versão' para editar.",
  sensitive_tooltip: 'Valor sensível — nunca exibido ou logado.',
  endpoint_preview_tooltip: 'Variáveis entre {} são resolvidas no momento da execução.',

  empty_routines: 'Nenhuma rotina de integração cadastrada. Crie a primeira.',
  empty_mappings: 'Nenhum mapeamento definido. Adicione o primeiro campo.',
  empty_params: 'Nenhum parâmetro definido. Adicione o primeiro.',

  // -- Monitor (UX-INTEG-002) --
  dlq_badge: (count: number) => `DLQ: ${count}`,
  success_reprocess: 'Reprocessamento enfileirado. Log original preservado.',
  confirm_reprocess_title: 'Reprocessar chamada?',
  confirm_reprocess_body: 'Será criada uma nova tentativa. O log original será preservado.',
  reprocess_reason_label: 'Motivo (mín. 10 caracteres)',
  no_permission: 'Sem permissão para esta ação.',
  no_logs: 'Nenhuma chamada de integração registrada.',
  empty_dlq: 'Nenhuma chamada em DLQ. Tudo certo!',
  metrics_label_total: 'Total (24h)',
  metrics_label_success_rate: 'Taxa de sucesso',
  metrics_label_dlq: 'DLQ',
  metrics_label_avg_latency: 'Latência Média',
  link_view_case: 'Ver caso',
  auto_refresh_label: 'Atualizando...',
  sensitive_masked_tooltip: 'Dado sensível mascarado por política de segurança.',
} as const;

// ---------------------------------------------------------------------------
// Badge classes (Tailwind v4)
// ---------------------------------------------------------------------------
export const STATUS_BADGE: Record<CallLogStatus, string> = {
  QUEUED: 'border border-[#E8E8E6] bg-[#F5F5F3] text-[#888888]',
  RUNNING: 'border border-[#90CAF9] bg-[#E3F2FD] text-[#2E86C1] animate-pulse',
  SUCCESS: 'border border-[#B5E8C9] bg-[#E8F8EF] text-[#1E7A42]',
  FAILED: 'border border-[#F5C6CB] bg-[#FFEBEE] text-[#C0392B]',
  DLQ: 'border border-[#C0392B] bg-[#C0392B] text-white',
  REPROCESSED: 'bg-indigo-100 text-indigo-800',
};

export const ENVIRONMENT_BADGE: Record<Environment, string> = {
  PROD: 'bg-red-100 text-red-800',
  HML: 'bg-amber-100 text-amber-800',
  DEV: 'bg-gray-100 text-gray-600',
};

export const MAPPING_TYPE_BADGE: Record<MappingType, string> = {
  FIELD: 'bg-indigo-100 text-indigo-800',
  PARAM: 'bg-amber-100 text-amber-800',
  HEADER: 'bg-cyan-100 text-cyan-800',
  FIXED_VALUE: 'bg-gray-100 text-gray-700',
  DERIVED: 'bg-violet-100 text-violet-800',
};

export const PARAM_TYPE_BADGE: Record<ParamType, string> = {
  FIXED: 'bg-gray-100 text-gray-700',
  DERIVED_FROM_TENANT: 'bg-blue-100 text-blue-800',
  DERIVED_FROM_CONTEXT: 'bg-teal-100 text-teal-800',
  HEADER: 'bg-cyan-100 text-cyan-800',
};

export const ROUTINE_STATUS_BADGE: Record<RoutineStatus, string> = {
  DRAFT: 'border border-[#FFE0B2] bg-[#FFF3E0] text-[#B8860B]',
  PUBLISHED: 'border border-[#B5E8C9] bg-[#E8F8EF] text-[#1E7A42]',
  DEPRECATED: 'bg-gray-100 text-gray-500',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format HTTP status with color hint */
export function httpStatusClass(status: number | null): string {
  if (!status) return 'text-muted-foreground';
  if (status >= 200 && status < 300) return 'text-emerald-600 font-semibold';
  if (status >= 400) return 'text-red-600 font-semibold';
  return 'text-foreground';
}

/** Relative time label for queued_at */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}
