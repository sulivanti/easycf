/**
 * @contract UX-005 §3 (UX-PROC-002), UX-005-M02, UX-005-M03 §D7–D11, FR-006, FR-007, FR-008, FR-009, FR-010, FR-013
 *
 * Stage configuration side panel with 4 tabs:
 * - Info: name, description, is_initial, is_terminal (auto-save debounce 800ms)
 * - Gates: CRUD with create/edit/delete dialogs (FR-007)
 * - Roles: link/unlink with dialog (FR-009)
 * - Transitions: create/delete with dialog (FR-010)
 *
 * BR-001: readonly hides all mutation buttons (PUBLISHED cycles)
 * BR-007: INFORMATIVE gates force required=false
 * BR-008: self-transitions filtered from target select
 * BR-012: gate ordem auto-managed
 *
 * Tailwind CSS v4 + shared UI components.
 */

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Select,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ConfirmationModal,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../shared/ui/index.js';
import {
  useUpdateStage,
  useCreateGate,
  useUpdateGate,
  useDeleteGate,
  useLinkStageRole,
  useUnlinkStageRole,
  useCreateTransition,
  useDeleteTransition,
} from '../hooks/use-stage-config.js';
import { useProcessRoles } from '../hooks/use-process-roles.js';
import type { FlowStageItem, FlowGateItem, GateType } from '../types/process-modeling.types.js';
import { COPY, GATE_TYPE_META } from '../types/process-modeling.types.js';

type TabId = 'info' | 'gates' | 'roles' | 'transitions';

const GATE_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'APPROVAL', label: 'Aprovação' },
  { value: 'DOCUMENT', label: 'Documento' },
  { value: 'CHECKLIST', label: 'Checklist' },
  { value: 'INFORMATIVE', label: 'Informativo' },
];

export interface StageConfigPanelProps {
  stage: FlowStageItem;
  allStages: FlowStageItem[];
  readonly: boolean;
  onClose: () => void;
}

export function StageConfigPanel({ stage, allStages, readonly, onClose }: StageConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { data: roles } = useProcessRoles();
  const rolesMap = useMemo(() => new Map((roles ?? []).map((r) => [r.id, r])), [roles]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'info', label: 'Informações' },
    { id: 'gates', label: 'Gates' },
    { id: 'roles', label: 'Papéis' },
    { id: 'transitions', label: 'Transições' },
  ];

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white flex flex-col z-40 shadow-[-4px_0_24px_rgba(0,0,0,0.08)]">
      {/* Header — UX-005-M03 §D7 */}
      <div className="h-16 min-h-16 px-6 border-b flex justify-between items-center" style={{ borderColor: '#E8E8E6' }}>
        <div className="text-[16px] font-bold text-[#111111] truncate">
          {stage.codigo} — {stage.nome}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* AutoSaveIndicator — 3 states */}
          {saveStatus !== 'idle' && (
            <span
              className={`text-[11px] font-medium ${
                saveStatus === 'saving'
                  ? 'text-[#888888] animate-pulse'
                  : saveStatus === 'saved'
                    ? 'text-[#27AE60]'
                    : 'text-[#E74C3C]'
              }`}
            >
              {saveStatus === 'saving'
                ? COPY.auto_save_saving
                : saveStatus === 'saved'
                  ? (<>{COPY.auto_save_saved} <span className="inline-block ml-0.5">✓</span></>)
                  : COPY.auto_save_error}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#888888] hover:text-[#333333] transition-colors"
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Readonly banner */}
      {readonly && (
        <div className="px-4 py-2 bg-amber-50 text-amber-800 text-xs">
          {COPY.readonly_panel_banner}
        </div>
      )}

      {/* TabBar — UX-005-M03 §D7 */}
      <div className="flex h-11 min-h-11 px-6 border-b" style={{ borderColor: '#E8E8E6' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="bg-transparent border-none cursor-pointer px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors"
            style={
              activeTab === tab.id
                ? { color: '#2E86C1', borderBottomColor: '#2E86C1' }
                : { color: '#888888', borderBottomColor: 'transparent' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PanelBody — UX-005-M03 §D7 */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'info' && (
          <InfoTab stage={stage} readonly={readonly} onSaveStatusChange={setSaveStatus} />
        )}
        {activeTab === 'gates' && <GatesTab stage={stage} readonly={readonly} />}
        {activeTab === 'roles' && (
          <RolesTab stage={stage} readonly={readonly} rolesMap={rolesMap} allRoles={roles ?? []} />
        )}
        {activeTab === 'transitions' && (
          <TransitionsTab stage={stage} readonly={readonly} allStages={allStages} />
        )}
      </div>
    </div>
  );
}

// ── Info Tab ───────────────────────────────────────────────────

function InfoTab({
  stage,
  readonly,
  onSaveStatusChange,
}: {
  stage: FlowStageItem;
  readonly: boolean;
  onSaveStatusChange: (s: 'idle' | 'saving' | 'saved' | 'error') => void;
}) {
  const [nome, setNome] = useState(stage.nome);
  const { mutateAsync: updateStage } = useUpdateStage();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startTransition(() => setNome(stage.nome));
  }, [stage.id, stage.nome]);

  const handleNomeChange = useCallback(
    (value: string) => {
      setNome(value);
      if (readonly) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        onSaveStatusChange('saving');
        try {
          await updateStage({ id: stage.id, data: { nome: value } });
          onSaveStatusChange('saved');
        } catch {
          onSaveStatusChange('error');
        }
      }, 800);
    },
    [stage.id, readonly, updateStage, onSaveStatusChange],
  );

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label htmlFor="stage-nome" className="text-xs font-semibold">
          Nome
        </Label>
        <Input
          id="stage-nome"
          value={nome}
          onChange={(e) => handleNomeChange(e.target.value)}
          disabled={readonly}
          className="mt-1 text-sm"
        />
      </div>

      <div className="flex gap-4">
        <label className="text-xs flex items-center gap-1.5">
          <input type="checkbox" checked={stage.is_initial} disabled={readonly} readOnly />⚑ Inicial
        </label>
        <label className="text-xs flex items-center gap-1.5">
          <input type="checkbox" checked={stage.is_terminal} disabled={readonly} readOnly />⊠
          Terminal
        </label>
      </div>
    </div>
  );
}

// ── Gates Tab ─────────────────────────────────────────────────

interface GateFormState {
  nome: string;
  descricao: string;
  gate_type: GateType;
  required: boolean;
}

const INITIAL_GATE_FORM: GateFormState = {
  nome: '',
  descricao: '',
  gate_type: 'APPROVAL',
  required: true,
};

function GatesTab({ stage, readonly }: { stage: FlowStageItem; readonly: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<FlowGateItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlowGateItem | null>(null);
  const [form, setForm] = useState<GateFormState>(INITIAL_GATE_FORM);

  const createGate = useCreateGate();
  const updateGate = useUpdateGate();
  const deleteGate = useDeleteGate();

  const openCreate = () => {
    setEditingGate(null);
    setForm(INITIAL_GATE_FORM);
    setDialogOpen(true);
  };

  const openEdit = (gate: FlowGateItem) => {
    setEditingGate(gate);
    setForm({
      nome: gate.nome,
      descricao: gate.descricao ?? '',
      gate_type: gate.gate_type,
      required: gate.required,
    });
    setDialogOpen(true);
  };

  const handleTypeChange = (type: GateType) => {
    // BR-007: INFORMATIVE gates force required=false
    setForm((f) => ({
      ...f,
      gate_type: type,
      required: type === 'INFORMATIVE' ? false : f.required,
    }));
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) return;

    try {
      if (editingGate) {
        await updateGate.mutateAsync({
          id: editingGate.id,
          data: {
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            gate_type: form.gate_type,
            required: form.gate_type === 'INFORMATIVE' ? false : form.required,
          },
        });
        toast.success('Gate atualizado.');
      } else {
        const nextOrdem =
          stage.gates.length > 0 ? Math.max(...stage.gates.map((g) => g.ordem)) + 1 : 1;
        await createGate.mutateAsync({
          stageId: stage.id,
          data: {
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            gate_type: form.gate_type,
            required: form.gate_type === 'INFORMATIVE' ? false : form.required,
            ordem: nextOrdem,
          },
        });
        toast.success('Gate criado.');
      }
      setDialogOpen(false);
    } catch {
      toast.error(editingGate ? 'Erro ao atualizar gate.' : 'Erro ao criar gate.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGate.mutateAsync(deleteTarget.id);
      toast.success('Gate excluído.');
      setDeleteTarget(null);
    } catch {
      toast.error('Erro ao excluir gate.');
    }
  };

  const isSaving = createGate.isPending || updateGate.isPending;

  return (
    <div className="flex flex-col gap-3">
      {!readonly && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={openCreate}>
            + Novo gate
          </Button>
        </div>
      )}

      {stage.gates.length === 0 ? (
        <p className="text-gray-400 text-sm">{COPY.empty_gates}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {stage.gates.map((gate) => {
            const meta = GATE_TYPE_META[gate.gate_type];
            return (
              <li
                key={gate.id}
                className="flex items-center gap-2 rounded-lg text-[13px]"
                style={{ border: '1px solid #E8E8E6', padding: '12px 16px' }}
              >
                {/* DragHandle — UX-005-M03 §D9 */}
                <span className="shrink-0 cursor-grab flex flex-col gap-[3px] opacity-40" aria-hidden>
                  <span className="flex gap-[3px]"><span className="w-[3px] h-[3px] rounded-full bg-[#CCC]" /><span className="w-[3px] h-[3px] rounded-full bg-[#CCC]" /></span>
                  <span className="flex gap-[3px]"><span className="w-[3px] h-[3px] rounded-full bg-[#CCC]" /><span className="w-[3px] h-[3px] rounded-full bg-[#CCC]" /></span>
                  <span className="flex gap-[3px]"><span className="w-[3px] h-[3px] rounded-full bg-[#CCC]" /><span className="w-[3px] h-[3px] rounded-full bg-[#CCC]" /></span>
                </span>
                <span className="flex-1 truncate text-[#111111]">{gate.nome}</span>
                {/* GateTypeBadge — UX-005-M03 §D9 */}
                <span
                  className="shrink-0 text-[10px] font-bold uppercase rounded px-2 py-[2px]"
                  style={{ color: meta.textColor, backgroundColor: meta.bgColor }}
                >
                  {meta.label}
                </span>
                {!readonly && (
                  <>
                    <button
                      onClick={() => openEdit(gate)}
                      className="text-[#888888] hover:text-[#2E86C1] bg-transparent border-none cursor-pointer p-0"
                      title="Editar"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M10 2l2 2-7 7H3v-2l7-7z"/></svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(gate)}
                      className="text-[#888888] hover:text-[#E74C3C] bg-transparent border-none cursor-pointer p-0"
                      title="Excluir"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGate ? 'Editar gate' : 'Novo gate'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label className="text-xs font-semibold">Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="mt-1 text-sm"
                placeholder="Nome do gate"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Descrição</Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                className="mt-1 text-sm"
                placeholder="Descrição (opcional)"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Tipo</Label>
              <Select
                options={GATE_TYPE_OPTIONS}
                value={form.gate_type}
                onChange={(e) => handleTypeChange(e.target.value as GateType)}
                className="mt-1 w-full"
                size="sm"
              />
            </div>
            <label className="text-xs flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
                disabled={form.gate_type === 'INFORMATIVE'}
              />
              Obrigatório
              {form.gate_type === 'INFORMATIVE' && (
                <span className="text-[10px] text-gray-400 ml-1">({COPY.tooltip_informative})</span>
              )}
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!form.nome.trim() || isSaving}
              isLoading={isSaving}
            >
              {editingGate ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir gate"
        description={`Deseja excluir o gate "${deleteTarget?.nome}"?`}
        variant="destructive"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteGate.isPending}
      />
    </div>
  );
}

// ── Roles Tab ─────────────────────────────────────────────────

interface RoleFormState {
  role_id: string;
  required: boolean;
  max_assignees: string;
}

function RolesTab({
  stage,
  readonly,
  rolesMap,
  allRoles,
}: {
  stage: FlowStageItem;
  readonly: boolean;
  rolesMap: Map<string, { nome?: string; can_approve?: boolean }>;
  allRoles: Array<{ id: string; codigo: string; nome: string; can_approve: boolean }>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{
    id: string;
    role_id: string;
    nome: string;
  } | null>(null);
  const [form, setForm] = useState<RoleFormState>({
    role_id: '',
    required: false,
    max_assignees: '',
  });

  const linkRole = useLinkStageRole();
  const unlinkRole = useUnlinkStageRole();

  // Filter out already linked roles
  const linkedRoleIds = useMemo(() => new Set(stage.roles.map((r) => r.role_id)), [stage.roles]);
  const availableRoles = useMemo(
    () => allRoles.filter((r) => !linkedRoleIds.has(r.id)),
    [allRoles, linkedRoleIds],
  );

  const openLink = () => {
    setForm({ role_id: availableRoles[0]?.id ?? '', required: false, max_assignees: '' });
    setDialogOpen(true);
  };

  const handleLink = async () => {
    if (!form.role_id) return;
    try {
      await linkRole.mutateAsync({
        stageId: stage.id,
        data: {
          role_id: form.role_id,
          required: form.required,
          max_assignees: form.max_assignees ? Number(form.max_assignees) : null,
        },
      });
      toast.success('Papel vinculado.');
      setDialogOpen(false);
    } catch {
      toast.error('Erro ao vincular papel.');
    }
  };

  const handleUnlink = async () => {
    if (!unlinkTarget) return;
    try {
      await unlinkRole.mutateAsync({ stageId: stage.id, roleId: unlinkTarget.role_id });
      toast.success('Papel desvinculado.');
      setUnlinkTarget(null);
    } catch {
      toast.error('Erro ao desvincular papel.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {!readonly && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={openLink}
            disabled={availableRoles.length === 0}
          >
            + Vincular papel
          </Button>
        </div>
      )}

      {stage.roles.length === 0 ? (
        <p className="text-gray-400 text-sm">{COPY.empty_roles}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {stage.roles.map((roleLink) => {
            const role = rolesMap.get(roleLink.role_id);
            const roleName = role?.nome ?? roleLink.role_id;
            return (
              <li
                key={roleLink.id}
                className="flex items-center gap-2 rounded-lg text-[13px]"
                style={{ border: '1px solid #E8E8E6', padding: '12px 16px' }}
              >
                <span className="flex-1 truncate text-[#111111] flex items-center gap-2">
                  {roleName}
                  {/* CanApproveBadge — UX-005-M03 §D10 */}
                  {role?.can_approve && (
                    <span
                      className="shrink-0 text-[10px] font-bold rounded px-2 py-[2px]"
                      style={{ color: '#2E86C1', backgroundColor: '#E3F2FD' }}
                    >
                      Com poder decisório
                    </span>
                  )}
                </span>
                {!readonly && (
                  <button
                    onClick={() =>
                      setUnlinkTarget({
                        id: roleLink.id,
                        role_id: roleLink.role_id,
                        nome: roleName,
                      })
                    }
                    className="text-[#888888] hover:text-[#E74C3C] bg-transparent border-none cursor-pointer p-0"
                    title="Desvincular"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Link Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular papel</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label className="text-xs font-semibold">Papel *</Label>
              <Select
                options={availableRoles.map((r) => ({
                  value: r.id,
                  label: `${r.codigo} — ${r.nome}`,
                }))}
                value={form.role_id}
                onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                placeholder="Selecione um papel"
                className="mt-1 w-full"
                size="sm"
              />
            </div>
            <label className="text-xs flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.required}
                onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              />
              Obrigatório
            </label>
            <div>
              <Label className="text-xs font-semibold">Máx. responsáveis</Label>
              <Input
                type="number"
                min="1"
                value={form.max_assignees}
                onChange={(e) => setForm((f) => ({ ...f, max_assignees: e.target.value }))}
                className="mt-1 text-sm"
                placeholder="Sem limite"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleLink}
              disabled={!form.role_id || linkRole.isPending}
              isLoading={linkRole.isPending}
            >
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirmation */}
      <ConfirmationModal
        open={!!unlinkTarget}
        onOpenChange={(open) => !open && setUnlinkTarget(null)}
        title="Desvincular papel"
        description={`Deseja desvincular o papel "${unlinkTarget?.nome}" deste estágio?`}
        variant="destructive"
        confirmLabel="Desvincular"
        onConfirm={handleUnlink}
        isLoading={unlinkRole.isPending}
      />
    </div>
  );
}

// ── Transitions Tab ───────────────────────────────────────────

interface TransitionFormState {
  to_stage_id: string;
  nome: string;
  gate_required: boolean;
  evidence_required: boolean;
}

function TransitionsTab({
  stage,
  readonly,
  allStages,
}: {
  stage: FlowStageItem;
  readonly: boolean;
  allStages: FlowStageItem[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nome: string } | null>(null);
  const [form, setForm] = useState<TransitionFormState>({
    to_stage_id: '',
    nome: '',
    gate_required: false,
    evidence_required: false,
  });

  const createTransition = useCreateTransition();
  const deleteTransition = useDeleteTransition();

  // BR-008: filter out self-transitions
  const targetStages = useMemo(
    () => allStages.filter((s) => s.id !== stage.id),
    [allStages, stage.id],
  );

  const openCreate = () => {
    setForm({
      to_stage_id: targetStages[0]?.id ?? '',
      nome: '',
      gate_required: false,
      evidence_required: false,
    });
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.nome.trim() || !form.to_stage_id) return;
    try {
      await createTransition.mutateAsync({
        from_stage_id: stage.id,
        to_stage_id: form.to_stage_id,
        nome: form.nome.trim(),
        gate_required: form.gate_required,
        evidence_required: form.evidence_required,
      });
      toast.success('Transição criada.');
      setDialogOpen(false);
    } catch {
      toast.error('Erro ao criar transição.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransition.mutateAsync(deleteTarget.id);
      toast.success('Transição excluída.');
      setDeleteTarget(null);
    } catch {
      toast.error('Erro ao excluir transição.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Saída — UX-005-M03 §D11 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Saída</h4>
          {!readonly && (
            <Button
              size="sm"
              variant="outline"
              onClick={openCreate}
              disabled={targetStages.length === 0}
            >
              + Nova transição
            </Button>
          )}
        </div>
        {stage.transitions_out.length === 0 ? (
          <p className="text-gray-400 text-sm">{COPY.empty_transitions_out}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stage.transitions_out.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-lg text-[13px]"
                style={{ border: '1px solid #E8E8E6', padding: '12px 16px' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#888888" strokeWidth="1.2" className="shrink-0"><path d="M2 7h10M9 4l3 3-3 3"/></svg>
                <span className="flex-1 truncate text-[#111111]">
                  {t.nome} → <span className="font-semibold">{t.to_stage_codigo}</span>
                </span>
                {/* GateRequiredBadge — UX-005-M03 §D11 */}
                {t.gate_required && (
                  <span
                    className="shrink-0 text-[10px] font-bold rounded px-2 py-[2px]"
                    style={{ color: '#F39C12', backgroundColor: '#FFF3E0' }}
                  >
                    Requer gate
                  </span>
                )}
                {!readonly && (
                  <button
                    onClick={() => setDeleteTarget({ id: t.id, nome: t.nome })}
                    className="text-[#888888] hover:text-[#E74C3C] bg-transparent border-none cursor-pointer p-0"
                    title="Excluir"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Entrada (readonly) — UX-005-M03 §D11 */}
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-2">Entrada</h4>
        {(() => {
          const inbound = allStages
            .flatMap((s) =>
              s.transitions_out
                .filter((t) => t.to_stage_id === stage.id)
                .map((t) => ({ ...t, from_codigo: s.codigo })),
            );
          return inbound.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma transição de entrada.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {inbound.map((t) => (
                <TooltipProvider key={t.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <li
                        className="flex items-center gap-2 rounded-lg text-[13px]"
                        style={{ border: '1px solid #F0F0EE', backgroundColor: '#FAFAFA', padding: '12px 16px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#CCCCCC" strokeWidth="1.2" className="shrink-0"><path d="M12 7H2M5 4l-3 3 3 3"/></svg>
                        <span className="flex-1 truncate text-[#888888]">
                          {t.nome} ← <span className="font-semibold">{t.from_codigo}</span>
                        </span>
                      </li>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{COPY.tooltip_entrada_readonly}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </ul>
          );
        })()}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova transição</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label className="text-xs font-semibold">Estágio destino *</Label>
              <Select
                options={targetStages.map((s) => ({
                  value: s.id,
                  label: `${s.codigo} — ${s.nome}`,
                }))}
                value={form.to_stage_id}
                onChange={(e) => setForm((f) => ({ ...f, to_stage_id: e.target.value }))}
                placeholder="Selecione o estágio"
                className="mt-1 w-full"
                size="sm"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="mt-1 text-sm"
                placeholder="Nome da transição"
              />
            </div>
            <label className="text-xs flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.gate_required}
                onChange={(e) => setForm((f) => ({ ...f, gate_required: e.target.checked }))}
              />
              Requer aprovação de gate
            </label>
            <label className="text-xs flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={form.evidence_required}
                onChange={(e) => setForm((f) => ({ ...f, evidence_required: e.target.checked }))}
              />
              Requer evidência
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!form.nome.trim() || !form.to_stage_id || createTransition.isPending}
              isLoading={createTransition.isPending}
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir transição"
        description={`Deseja excluir a transição "${deleteTarget?.nome}"?`}
        variant="destructive"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        isLoading={deleteTransition.isPending}
      />
    </div>
  );
}
