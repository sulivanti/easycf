/**
 * @contract UX-005 §3 (UX-PROC-002), UX-005-M02, FR-006, FR-007, FR-008, FR-009, FR-010, FR-013
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
  Badge,
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
import type {
  FlowStageItem,
  FlowGateItem,
  GateType,
} from '../types/process-modeling.types.js';
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
    <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 flex flex-col z-50 shadow-[-4px_0_12px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <div className="font-bold text-sm">
            {stage.codigo} — {stage.nome}
          </div>
          {saveStatus !== 'idle' && (
            <span
              className={`text-[11px] ${
                saveStatus === 'error'
                  ? 'text-red-600'
                  : saveStatus === 'saving'
                    ? 'text-gray-400'
                    : 'text-green-600'
              }`}
            >
              {saveStatus === 'saving'
                ? COPY.auto_save_saving
                : saveStatus === 'saved'
                  ? COPY.auto_save_saved
                  : COPY.auto_save_error}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-lg leading-none">
          ×
        </Button>
      </div>

      {/* Readonly banner */}
      {readonly && (
        <div className="px-4 py-2 bg-amber-50 text-amber-800 text-xs">
          {COPY.readonly_panel_banner}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 text-xs border-b-2 bg-transparent cursor-pointer
              ${
                activeTab === tab.id
                  ? 'border-blue-500 font-semibold text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
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
        const nextOrdem = stage.gates.length > 0
          ? Math.max(...stage.gates.map((g) => g.ordem)) + 1
          : 1;
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
                className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-md text-sm"
              >
                <Badge variant={meta.variant} className="text-[10px] px-1.5 py-0 shrink-0">
                  {meta.label}
                </Badge>
                <span className="flex-1 truncate">{gate.nome}</span>
                <span
                  className={`text-[11px] ${gate.required ? 'text-red-700' : 'text-gray-400'}`}
                >
                  {gate.required ? 'Obrigatório' : 'Opcional'}
                </span>
                {!readonly && (
                  <>
                    <button
                      onClick={() => openEdit(gate)}
                      className="text-gray-400 hover:text-blue-600 text-xs bg-transparent border-none cursor-pointer"
                      title="Editar"
                    >
                      &#9998;
                    </button>
                    <button
                      onClick={() => setDeleteTarget(gate)}
                      className="text-gray-400 hover:text-red-600 text-xs bg-transparent border-none cursor-pointer"
                      title="Excluir"
                    >
                      &#10005;
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
                <span className="text-[10px] text-gray-400 ml-1">
                  ({COPY.tooltip_informative})
                </span>
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
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; role_id: string; nome: string } | null>(null);
  const [form, setForm] = useState<RoleFormState>({ role_id: '', required: false, max_assignees: '' });

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
                className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-md text-sm"
              >
                <span className="flex-1 truncate">
                  {roleName}
                  {role?.can_approve && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="default" className="ml-1.5 text-[10px] px-1.5 py-0">
                            Poder decisório
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Este papel possui poder de aprovação</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </span>
                <span
                  className={`text-[11px] ${roleLink.required ? 'text-red-700' : 'text-gray-400'}`}
                >
                  {roleLink.required ? 'Obrigatório' : 'Opcional'}
                </span>
                {!readonly && (
                  <button
                    onClick={() =>
                      setUnlinkTarget({ id: roleLink.id, role_id: roleLink.role_id, nome: roleName })
                    }
                    className="text-gray-400 hover:text-red-600 text-xs bg-transparent border-none cursor-pointer"
                    title="Desvincular"
                  >
                    &#10005;
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
                options={availableRoles.map((r) => ({ value: r.id, label: `${r.codigo} — ${r.nome}` }))}
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
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold">Saída</h4>
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
          <ul className="flex flex-col gap-1.5">
            {stage.transitions_out.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-md text-sm"
              >
                <span className="flex-1 truncate">
                  {t.nome} → <span className="font-semibold">{t.to_stage_codigo}</span>
                </span>
                {t.gate_required && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-700 bg-orange-50"
                  >
                    Requer gate
                  </Badge>
                )}
                {!readonly && (
                  <button
                    onClick={() => setDeleteTarget({ id: t.id, nome: t.nome })}
                    className="text-gray-400 hover:text-red-600 text-xs bg-transparent border-none cursor-pointer"
                    title="Excluir"
                  >
                    &#10005;
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
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
