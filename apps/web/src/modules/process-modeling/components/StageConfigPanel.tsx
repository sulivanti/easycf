/**
 * @contract UX-005 §3 (UX-PROC-002), FR-006, FR-007, FR-008, FR-009, FR-010, FR-013
 *
 * Stage configuration side panel with 4 tabs:
 * - Info: name, description, is_initial, is_terminal (auto-save debounce 800ms)
 * - Gates: list with type badges
 * - Roles: linked roles with can_approve badge
 * - Transitions: outgoing (list) + incoming (readonly)
 *
 * Tailwind CSS v4 + shared UI components.
 */

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import {
  Button,
  Badge,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../shared/ui/index.js';
import { useUpdateStage } from '../hooks/use-stage-config.js';
import { useProcessRoles } from '../hooks/use-process-roles.js';
import type { FlowStageItem } from '../types/process-modeling.types.js';
import { COPY, GATE_TYPE_META } from '../types/process-modeling.types.js';

type TabId = 'info' | 'gates' | 'roles' | 'transitions';

export interface StageConfigPanelProps {
  stage: FlowStageItem;
  readonly: boolean;
  onClose: () => void;
}

export function StageConfigPanel({ stage, readonly, onClose }: StageConfigPanelProps) {
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
        {activeTab === 'gates' && <GatesTab stage={stage} />}
        {activeTab === 'roles' && <RolesTab stage={stage} rolesMap={rolesMap} />}
        {activeTab === 'transitions' && <TransitionsTab stage={stage} />}
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

function GatesTab({ stage }: { stage: FlowStageItem }) {
  if (stage.gates.length === 0) {
    return <p className="text-gray-400 text-sm">{COPY.empty_gates}</p>;
  }

  return (
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
            <span className={`text-[11px] ${gate.required ? 'text-red-700' : 'text-gray-400'}`}>
              {gate.required ? 'Obrigatório' : 'Opcional'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Roles Tab ─────────────────────────────────────────────────

function RolesTab({ stage, rolesMap }: { stage: FlowStageItem; rolesMap: Map<string, { nome?: string; can_approve?: boolean }> }) {
  if (stage.roles.length === 0) {
    return <p className="text-gray-400 text-sm">{COPY.empty_roles}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {stage.roles.map((roleLink) => (
        <li
          key={roleLink.id}
          className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-md text-sm"
        >
          <span className="flex-1 truncate">
            {rolesMap.get(roleLink.role_id)?.nome ?? roleLink.role_id}
            {rolesMap.get(roleLink.role_id)?.can_approve && (
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
          <span className={`text-[11px] ${roleLink.required ? 'text-red-700' : 'text-gray-400'}`}>
            {roleLink.required ? 'Obrigatório' : 'Opcional'}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Transitions Tab ───────────────────────────────────────────

function TransitionsTab({ stage }: { stage: FlowStageItem }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-xs font-semibold mb-2">Saída</h4>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
