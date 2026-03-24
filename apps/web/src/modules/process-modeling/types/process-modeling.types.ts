/**
 * @contract INT-005, DATA-005, SEC-005, UX-005, EX-OAS-001
 * MOD-005 DTO types, enums, copy constants, and permission helpers.
 * Aligned with OpenAPI schemas in apps/api/openapi/v1.yaml.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export type CycleStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
export type GateType = 'APPROVAL' | 'DOCUMENT' | 'CHECKLIST' | 'INFORMATIVE';

// ---------------------------------------------------------------------------
// Cycle
// ---------------------------------------------------------------------------
export interface CycleListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  version: number;
  status: CycleStatus;
  published_at: string | null;
  created_at: string;
}

export interface CycleDetailDTO {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  version: number;
  status: CycleStatus;
  parent_cycle_id: string | null;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCycleRequest {
  codigo: string;
  nome: string;
  descricao?: string | null;
}

export interface UpdateCycleRequest {
  nome?: string;
  descricao?: string | null;
}

// ---------------------------------------------------------------------------
// Macro-stage
// ---------------------------------------------------------------------------
export interface MacroStageDTO {
  id: string;
  cycle_id: string;
  codigo: string;
  nome: string;
  ordem: number;
}

export interface CreateMacroStageRequest {
  codigo: string;
  nome: string;
  ordem: number;
}

export interface UpdateMacroStageRequest {
  nome?: string;
  ordem?: number;
}

// ---------------------------------------------------------------------------
// Stage
// ---------------------------------------------------------------------------
export interface StageDTO {
  id: string;
  macro_stage_id: string;
  cycle_id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  is_initial: boolean;
  is_terminal: boolean;
  canvas_x: number | null;
  canvas_y: number | null;
}

export interface CreateStageRequest {
  codigo: string;
  nome: string;
  descricao?: string | null;
  ordem: number;
  is_initial?: boolean;
  is_terminal?: boolean;
  canvas_x?: number | null;
  canvas_y?: number | null;
}

export interface UpdateStageRequest {
  nome?: string;
  descricao?: string | null;
  ordem?: number;
  is_initial?: boolean;
  is_terminal?: boolean;
  canvas_x?: number | null;
  canvas_y?: number | null;
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------
export interface GateDTO {
  id: string;
  stage_id: string;
  nome: string;
  descricao: string | null;
  gate_type: GateType;
  required: boolean;
  ordem: number;
}

export interface CreateGateRequest {
  nome: string;
  descricao?: string | null;
  gate_type: GateType;
  required?: boolean;
  ordem: number;
}

export interface UpdateGateRequest {
  nome?: string;
  descricao?: string | null;
  gate_type?: GateType;
  required?: boolean;
  ordem?: number;
}

// ---------------------------------------------------------------------------
// Process Role (global catalog)
// ---------------------------------------------------------------------------
export interface ProcessRoleListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  can_approve: boolean;
}

export interface ProcessRoleDTO {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  can_approve: boolean;
}

export interface CreateProcessRoleRequest {
  codigo: string;
  nome: string;
  descricao?: string | null;
  can_approve?: boolean;
}

// ---------------------------------------------------------------------------
// Stage-Role link
// ---------------------------------------------------------------------------
export interface StageRoleLinkDTO {
  id: string;
  stage_id: string;
  role_id: string;
  required: boolean;
  max_assignees: number | null;
}

export interface LinkStageRoleRequest {
  role_id: string;
  required?: boolean;
  max_assignees?: number | null;
}

// ---------------------------------------------------------------------------
// Transition
// ---------------------------------------------------------------------------
export interface TransitionDTO {
  id: string;
  from_stage_id: string;
  to_stage_id: string;
  nome: string;
  condicao: string | null;
  gate_required: boolean;
  evidence_required: boolean;
  allowed_roles: string[] | null;
}

export interface CreateTransitionRequest {
  from_stage_id: string;
  to_stage_id: string;
  nome: string;
  condicao?: string | null;
  gate_required?: boolean;
  evidence_required?: boolean;
  allowed_roles?: string[] | null;
}

// ---------------------------------------------------------------------------
// Flow graph (GET /admin/cycles/:id/flow)
// ---------------------------------------------------------------------------
export interface FlowGateItem {
  id: string;
  stage_id: string;
  nome: string;
  descricao: string | null;
  gate_type: GateType;
  required: boolean;
  ordem: number;
}

export interface FlowRoleItem {
  id: string;
  stage_id: string;
  role_id: string;
  required: boolean;
  max_assignees: number | null;
}

export interface FlowTransitionItem {
  id: string;
  to_stage_id: string;
  to_stage_codigo: string;
  nome: string;
  gate_required: boolean;
  evidence_required: boolean;
  allowed_roles: string[] | null;
}

export interface FlowStageItem {
  id: string;
  codigo: string;
  nome: string;
  ordem: number;
  is_initial: boolean;
  is_terminal: boolean;
  canvas_x: number | null;
  canvas_y: number | null;
  gates: FlowGateItem[];
  roles: FlowRoleItem[];
  transitions_out: FlowTransitionItem[];
}

export interface FlowMacroStageItem {
  id: string;
  codigo: string;
  nome: string;
  ordem: number;
  stages: FlowStageItem[];
}

export interface FlowResponseDTO {
  cycle: {
    id: string;
    codigo: string;
    nome: string;
    version: number;
    status: CycleStatus;
  };
  macro_stages: FlowMacroStageItem[];
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
export interface CycleListFilters {
  status?: CycleStatus;
  cursor?: string;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Copy constants (UX-005 §2.6, §3.6)
// ---------------------------------------------------------------------------
export const COPY = {
  // Editor (UX-PROC-001)
  success_publish: 'Ciclo publicado com sucesso.',
  success_fork: (version: number) => `Nova versão criada. Você está editando a versão ${version}.`,
  success_deprecate: 'Ciclo depreciado. Novas instâncias bloqueadas.',
  confirm_publish: 'Ao publicar, o ciclo se tornará imutável. Continuar?',
  confirm_deprecate:
    'Ao deprecar, novas instâncias serão bloqueadas. Instâncias ativas continuarão normalmente. Continuar?',
  confirm_delete_stage: (nome: string) => `Deseja remover o estágio '${nome}'?`,
  confirm_delete_cycle: (nome: string) => `Deseja excluir o ciclo "${nome}"?`,
  error_publish_no_initial:
    'O ciclo precisa de ao menos um estágio inicial antes de ser publicado.',
  error_immutable: 'Ciclos publicados são imutáveis. Use o fork para criar uma nova versão.',
  error_active_instances: (count: number) =>
    `Este estágio possui ${count} instância(s) ativa(s) em andamento.`,
  empty_canvas: 'Dê duplo clique para criar o primeiro estágio.',
  readonly_banner: "Ciclo publicado — use 'Nova versão' para editar.",
  deprecated_banner: 'Ciclo depreciado — novas instâncias bloqueadas.',
  history_empty: 'Nenhum evento registrado para este ciclo.',

  // Stage Config Panel (UX-PROC-002)
  error_duplicate_role: 'Este papel já está vinculado a este estágio.',
  error_initial_conflict: (codigo: string) =>
    `O estágio '${codigo}' já é o inicial. Desmarque-o primeiro.`,
  error_cross_cycle: 'Os estágios de origem e destino devem pertencer ao mesmo ciclo.',
  error_auto_transition: 'Um estágio não pode transitar para si mesmo.',
  tooltip_entrada_readonly: 'Configure esta transição no estágio de origem.',
  tooltip_informative: 'Este gate registra informação mas não impede o avanço.',
  readonly_panel_banner: 'Ciclo publicado — somente leitura.',
  auto_save_saving: 'Salvando...',
  auto_save_saved: 'Salvo',
  auto_save_error: 'Erro ao salvar',
  empty_cycles: 'Nenhum ciclo encontrado.',
  empty_gates: 'Nenhum gate configurado.',
  empty_roles: 'Nenhum papel vinculado.',
  empty_transitions_out: 'Nenhuma transição de saída.',
} as const;

// ---------------------------------------------------------------------------
// Scopes & Permission helpers (SEC-005 §2)
// ---------------------------------------------------------------------------
export const SCOPES = {
  CYCLE_READ: 'process:cycle:read',
  CYCLE_WRITE: 'process:cycle:write',
  CYCLE_PUBLISH: 'process:cycle:publish',
  CYCLE_DELETE: 'process:cycle:delete',
} as const;

export function hasScope(userScopes: readonly string[], scope: string): boolean {
  return userScopes.includes(scope);
}

export function canReadCycles(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.CYCLE_READ);
}

export function canWriteCycle(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.CYCLE_WRITE);
}

/** @contract SEC-005 §2.2 — publish is a separate privilege from write */
export function canPublishCycle(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.CYCLE_PUBLISH);
}

export function canDeleteCycle(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.CYCLE_DELETE);
}

/** Cycle is editable only in DRAFT status (BR-001) */
export function isCycleEditable(status: CycleStatus): boolean {
  return status === 'DRAFT';
}

/** Publish button visible only for DRAFT cycles with publish scope */
export function canShowPublish(userScopes: readonly string[], status: CycleStatus): boolean {
  return canPublishCycle(userScopes) && status === 'DRAFT';
}

/** Fork button visible only for PUBLISHED cycles with write scope */
export function canShowFork(userScopes: readonly string[], status: CycleStatus): boolean {
  return canWriteCycle(userScopes) && status === 'PUBLISHED';
}

/** Deprecate button visible only for PUBLISHED cycles with write scope */
export function canShowDeprecate(userScopes: readonly string[], status: CycleStatus): boolean {
  return canWriteCycle(userScopes) && status === 'PUBLISHED';
}

/** Delete button visible only for DRAFT cycles with delete scope */
export function canShowDelete(userScopes: readonly string[], status: CycleStatus): boolean {
  return canDeleteCycle(userScopes) && status === 'DRAFT';
}

// ---------------------------------------------------------------------------
// Gate type display metadata
// ---------------------------------------------------------------------------
export const GATE_TYPE_META: Record<
  GateType,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  APPROVAL: { label: 'Aprovação', variant: 'default' },
  DOCUMENT: { label: 'Documento', variant: 'secondary' },
  CHECKLIST: { label: 'Checklist', variant: 'outline' },
  INFORMATIVE: { label: 'Informativo', variant: 'secondary' },
};

export const STATUS_META: Record<
  CycleStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  DRAFT: { label: 'Rascunho', variant: 'default' },
  PUBLISHED: { label: 'Publicado', variant: 'secondary' },
  DEPRECATED: { label: 'Depreciado', variant: 'outline' },
};
