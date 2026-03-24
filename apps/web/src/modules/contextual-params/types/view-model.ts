/**
 * @contract UX-007, DOC-UX-010
 * View model helpers and COPY constants for MOD-007 contextual-params.
 * All user-facing strings centralized here for i18n readiness.
 */

import type { FramerStatus, RoutineStatus, ItemType } from './contextual-params.types.js';

// ---------------------------------------------------------------------------
// Status → Tailwind color class mappings
// ---------------------------------------------------------------------------

export function framerStatusVariant(status: FramerStatus): 'default' | 'secondary' {
  return status === 'ACTIVE' ? 'default' : 'secondary';
}

export function routineStatusVariant(
  status: RoutineStatus,
): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'PUBLISHED':
      return 'default';
    case 'DEPRECATED':
      return 'secondary';
  }
}

export function routineStatusClass(status: RoutineStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-amber-500 text-white';
    case 'PUBLISHED':
      return 'bg-green-500 text-white';
    case 'DEPRECATED':
      return 'bg-gray-400 text-white';
  }
}

export function framerStatusClass(status: FramerStatus): string {
  return status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white';
}

export function itemTypeBadgeClass(type: ItemType): string {
  const classes: Record<ItemType, string> = {
    FIELD_VISIBILITY: 'bg-blue-500 text-white',
    REQUIRED: 'bg-red-500 text-white',
    DEFAULT: 'bg-violet-500 text-white',
    DOMAIN: 'bg-cyan-500 text-white',
    DERIVATION: 'bg-orange-500 text-white',
    VALIDATION: 'bg-pink-500 text-white',
    EVIDENCE: 'bg-teal-500 text-white',
  };
  return classes[type] ?? 'bg-gray-500 text-white';
}

/** @contract UX-007 §2.5 — ExpirationBadge: valid_until < now + 7 days */
export function isExpiringSoon(validUntil: string | null): boolean {
  if (!validUntil) return false;
  const expiry = new Date(validUntil);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + 7);
  return expiry <= threshold && expiry > new Date();
}

// ---------------------------------------------------------------------------
// COPY — all user-facing strings (UX-007 §2.6, §3.6)
// ---------------------------------------------------------------------------

export const COPY = {
  // UX-PARAM-001 — Enquadradores
  success_create_framer: 'Enquadrador criado com sucesso.',
  success_update_framer: 'Enquadrador atualizado.',
  success_deactivate_framer: 'Enquadrador inativado.',
  error_unique_codigo: 'Ja existe um enquadrador com este codigo.',
  error_unique_incidence: 'Conflito de incidencia detectado. Resolva o conflito antes de salvar.',
  error_no_permission_framers: 'Sem permissao para acessar enquadradores.',
  error_simulate: 'Nao foi possivel simular a avaliacao.',
  confirm_deactivate:
    'Enquadradores inativos nao disparam regras de incidencia. Rotinas vinculadas deixarao de ser aplicadas. Deseja continuar?',
  tooltip_codigo_imutavel: 'O codigo nao pode ser alterado apos a criacao.',
  tooltip_expirando: 'Este enquadrador expirara em breve e sera inativado automaticamente.',
  tooltip_campo_sistema: 'Campo de sistema — nao editavel.',
  empty_framers: 'Nenhum enquadrador cadastrado. Clique em "Novo enquadrador" para comecar.',
  dry_run_aviso_param: 'Simulacao sem efeito — nenhum registro e criado.',
  error_load_framers: 'Nao foi possivel carregar os enquadradores.',
  error_load_objects: 'Nao foi possivel carregar os objetos-alvo.',
  error_load_rules: 'Nao foi possivel carregar as regras.',

  // UX-ROTINA-001 — Rotinas
  success_create_routine: 'Rotina criada com sucesso.',
  success_publish: 'Rotina publicada com sucesso.',
  success_fork: (version: number) => `Nova versao criada. Voce esta editando a versao ${version}.`,
  error_publish_no_items: 'Adicione ao menos um item antes de publicar.',
  error_publish_already: 'Rotina ja esta publicada.',
  error_immutable: 'Rotinas publicadas sao imutaveis. Use o fork para criar nova versao.',
  error_fork_reason: 'O motivo deve ter pelo menos 10 caracteres.',
  error_auto_save: 'Nao foi possivel salvar o item.',
  error_no_permission_routines: 'Sem permissao para acessar rotinas.',
  confirm_publish: 'Ao publicar, a rotina se tornara imutavel. Continuar?',
  confirm_publish_auto_deprecate: 'A versao anterior sera automaticamente deprecada. Continuar?',
  confirm_fork: 'Informe o motivo da mudanca para criar uma nova versao.',
  tooltip_blocking: 'Este item bloqueia a transicao de estagio no MOD-006 se violado.',
  tooltip_version: (parentVersion: number, date: string) =>
    `Derivada de v${parentVersion} (publicada em ${date}).`,
  empty_routines: 'Nenhuma rotina cadastrada. Clique em "Nova rotina" para comecar.',
  empty_items: 'Adicione itens para definir o comportamento da rotina.',
  readonly_banner: 'Rotina publicada — somente leitura. Use "Nova versao" para modificar.',
  deprecated_banner: 'Rotina deprecada — nao e mais aplicada pelo motor.',
  dry_run_aviso_routine: 'Esta simulacao nao registra domain_events (modo dry-run).',
  history_empty: 'Nenhuma versao anterior registrada.',

  // Shared
  error_generic: 'Ocorreu um erro inesperado.',
  btn_retry: 'Tentar novamente',
} as const;
