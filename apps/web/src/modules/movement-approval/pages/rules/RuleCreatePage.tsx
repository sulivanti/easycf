/**
 * @contract UX-009 §30, UX-009-M01 D8
 *
 * View ⑥ — Nova Regra (/approvals/rules/new)
 * Two-column: config (objectType, operationType, threshold, origens, toggle) + chain builder
 */

import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from 'lucide-react';
import { Button } from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { useCreateControlRule, useCreateApprovalRule } from '../../hooks/use-control-rules.js';
import type {
  CreateControlRuleRequest,
  CreateApprovalRuleRequest,
} from '../../types/movement-approval.types.js';

// ── Chain Level ──────────────────────────────────────────────────────────────

interface ChainLevel {
  id: string;
  approverType: 'ROLE' | 'USER' | 'ORG_LEVEL';
  entity: string;
  criteria: 'ALL' | 'ANY';
  timeout: string;
}

function newLevel(): ChainLevel {
  return {
    id: crypto.randomUUID(),
    approverType: 'ROLE',
    entity: '',
    criteria: 'ALL',
    timeout: '24',
  };
}

// ── Form State ───────────────────────────────────────────────────────────────

interface ConfigState {
  objectType: string;
  operationType: string;
  threshold: string;
  originProtheus: boolean;
  originPortal: boolean;
  originApi: boolean;
  originAuto: boolean;
  requireApproval: boolean;
  allowSelfApprove: boolean;
  validFrom: string;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Component ────────────────────────────────────────────────────────────────

export function RuleCreatePage() {
  const navigate = useNavigate();
  const createRuleMut = useCreateControlRule();
  const createLevelMut = useCreateApprovalRule();

  const [config, setConfig] = useState<ConfigState>({
    objectType: '',
    operationType: '',
    threshold: '',
    originProtheus: false,
    originPortal: true,
    originApi: false,
    originAuto: false,
    requireApproval: true,
    allowSelfApprove: false,
    validFrom: todayStr(),
  });

  const [levels, setLevels] = useState<ChainLevel[]>([]);

  function setConfigField(field: keyof ConfigState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setConfig((prev) => ({ ...prev, [field]: val }));
    };
  }

  function addLevel() {
    setLevels((prev) => [...prev, newLevel()]);
  }

  function removeLevel(id: string) {
    setLevels((prev) => prev.filter((l) => l.id !== id));
  }

  function moveLevel(id: string, direction: 'up' | 'down') {
    setLevels((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const newArr = [...prev];
      if (direction === 'up' && idx > 0) {
        [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
      } else if (direction === 'down' && idx < newArr.length - 1) {
        [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      }
      return newArr;
    });
  }

  function updateLevel(id: string, field: keyof ChainLevel, value: string) {
    setLevels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config.objectType || !config.operationType) {
      toast.error('Preencha Tipo de Objeto e Operação.');
      return;
    }

    const ruleData: CreateControlRuleRequest = {
      operation: config.operationType,
      entity_type: config.objectType,
      by_value: !!config.threshold,
      value_field: config.threshold ? 'value' : undefined,
      valid_from: config.validFrom,
      allow_self_approve: config.allowSelfApprove,
    };

    createRuleMut.mutate(ruleData, {
      onSuccess: async (rule) => {
        // Create chain levels
        for (let i = 0; i < levels.length; i++) {
          const lv = levels[i];
          const levelData: CreateApprovalRuleRequest = {
            level: i + 1,
            sla_hours: parseInt(lv.timeout, 10) || 24,
            role_id: lv.approverType === 'ROLE' ? lv.entity || undefined : undefined,
            user_id: lv.approverType === 'USER' ? lv.entity || undefined : undefined,
            org_unit_id: lv.approverType === 'ORG_LEVEL' ? lv.entity || undefined : undefined,
          };
          await createLevelMut.mutateAsync({ controlRuleId: rule.id, data: levelData });
        }
        toast.success('Regra criada com sucesso.');
        navigate({ to: '/approvals/rules' });
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Erro ao criar regra.'),
    });
  }

  const estimatedImpact = config.objectType && config.operationType ? '~12 movimentos/mês' : null;

  return (
    <div className="space-y-[var(--space-lg)]">
      <PageHeader
        title="Nova Regra de Aprovação"
        description="Configure uma nova regra para o motor de aprovação."
        breadcrumbs={[
          { label: 'Aprovação' },
          { label: 'Regras', href: '/approvals/rules' },
          { label: 'Nova Regra' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── Config Column ── */}
          <div className="space-y-6 rounded-[10px] border border-[#E8E8E6] bg-white p-6">
            <h2 className="text-[14px] font-bold text-[#111111]">Configuração da Regra</h2>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Tipo de Objeto <span className="text-[#dc2626]">*</span>
              </label>
              <select
                value={config.objectType}
                onChange={setConfigField('objectType')}
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              >
                <option value="">Selecione...</option>
                <option value="pedido_compra">Pedido de Compra</option>
                <option value="nota_fiscal">Nota Fiscal</option>
                <option value="ordem_servico">Ordem de Serviço</option>
                <option value="contrato">Contrato</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Tipo de Operação <span className="text-[#dc2626]">*</span>
              </label>
              <select
                value={config.operationType}
                onChange={setConfigField('operationType')}
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              >
                <option value="">Selecione...</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Threshold R$ (opcional)
              </label>
              <input
                type="number"
                value={config.threshold}
                onChange={setConfigField('threshold')}
                placeholder="Ex: 50000"
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 font-mono text-[13px] tabular-nums text-[#111111] outline-none focus:border-[#2E86C1]"
              />
            </div>

            {/* Origens */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Origens
              </label>
              <div className="flex flex-wrap gap-3">
                {([
                  { field: 'originProtheus' as const, label: 'PROTHEUS' },
                  { field: 'originPortal' as const, label: 'PORTAL' },
                  { field: 'originApi' as const, label: 'API' },
                  { field: 'originAuto' as const, label: 'AUTO' },
                ] as const).map(({ field, label }) => (
                  <label key={field} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config[field] as boolean}
                      onChange={setConfigField(field)}
                      className="size-4 rounded border-[#E8E8E6] accent-[#2E86C1]"
                    />
                    <span className="text-[13px] text-[#111111]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Toggle requer aprovação */}
            <div className="flex items-center justify-between rounded-md border border-[#E8E8E6] px-4 py-3">
              <div>
                <p className="text-[13px] font-medium text-[#111111]">Requer Aprovação</p>
                <p className="text-[11px] text-[#888888]">
                  Movimentos desta regra exigirão aprovação humana
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({ ...prev, requireApproval: !prev.requireApproval }))
                }
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  config.requireApproval ? 'bg-[#2E86C1]' : 'bg-[#E8E8E6]',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block size-4 rounded-full bg-white shadow-sm transition-transform',
                    config.requireApproval ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
            </div>

            {/* Allow self approve */}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={config.allowSelfApprove}
                onChange={setConfigField('allowSelfApprove')}
                className="size-4 rounded border-[#E8E8E6] accent-[#2E86C1]"
              />
              <span className="text-[13px] text-[#111111]">Permitir auto-aprovação</span>
            </label>

            {/* Válido a partir de */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Válido a partir de
              </label>
              <input
                type="date"
                value={config.validFrom}
                onChange={setConfigField('validFrom')}
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              />
            </div>

            {/* Impact Card */}
            {estimatedImpact && (
              <div className="rounded-lg bg-[#E3F2FD] p-4">
                <p className="text-[12px] font-semibold text-[#2E86C1]">Impacto estimado</p>
                <p className="mt-1 text-[13px] text-[#111111]">
                  Esta regra afetará {estimatedImpact}
                </p>
              </div>
            )}
          </div>

          {/* ── Chain Builder Column ── */}
          <div className="rounded-[10px] border border-[#E8E8E6] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#111111]">Cadeia de Aprovação</h2>
              <button
                type="button"
                onClick={addLevel}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2E86C1] hover:underline"
              >
                <PlusIcon className="size-3.5" />
                Adicionar Nível
              </button>
            </div>

            {levels.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E8E8E6] py-12 text-center cursor-pointer hover:border-[#2E86C1] transition-colors"
                onClick={addLevel}
              >
                <PlusIcon className="size-8 text-[#CCCCCC]" />
                <p className="mt-2 text-[13px] text-[#888888]">Clique em Adicionar Nível</p>
              </div>
            ) : (
              <div className="space-y-3">
                {levels.map((level, i) => (
                  <div
                    key={level.id}
                    className="rounded-lg border border-[#E8E8E6] bg-[#F5F5F3] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-[#E3F2FD] px-3 py-0.5 text-[11px] font-bold text-[#2E86C1]">
                        Nível {i + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLevel(level.id, 'up')}
                          disabled={i === 0}
                          className="rounded p-1 text-[#888888] hover:text-[#111111] disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ChevronUpIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLevel(level.id, 'down')}
                          disabled={i === levels.length - 1}
                          className="rounded p-1 text-[#888888] hover:text-[#111111] disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ChevronDownIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLevel(level.id)}
                          className="rounded p-1 text-[#dc2626] hover:text-[#b91c1c]"
                          title="Remover nível"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                          Tipo Aprovador
                        </label>
                        <select
                          value={level.approverType}
                          onChange={(e) =>
                            updateLevel(level.id, 'approverType', e.target.value)
                          }
                          className="h-8 w-full rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1]"
                        >
                          <option value="ROLE">ROLE</option>
                          <option value="USER">USER</option>
                          <option value="ORG_LEVEL">ORG_LEVEL</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                          Entidade
                        </label>
                        <input
                          type="text"
                          value={level.entity}
                          onChange={(e) => updateLevel(level.id, 'entity', e.target.value)}
                          placeholder="ID ou nome..."
                          className="h-8 w-full rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                          Critério
                        </label>
                        <select
                          value={level.criteria}
                          onChange={(e) => updateLevel(level.id, 'criteria', e.target.value)}
                          className="h-8 w-full rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1]"
                        >
                          <option value="ALL">ALL (todos)</option>
                          <option value="ANY">ANY (qualquer)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                          Timeout (horas)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={level.timeout}
                          onChange={(e) => updateLevel(level.id, 'timeout', e.target.value)}
                          className="h-8 w-full rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Link to="/approvals/rules">
            <Button variant="outline" type="button" className="border-[#E8E8E6]">
              Cancelar
            </Button>
          </Link>
          <button
            type="submit"
            disabled={createRuleMut.isPending || createLevelMut.isPending}
            className="rounded-md bg-[#2E86C1] px-6 py-2 text-[13px] font-semibold text-white hover:bg-[#2573a7] disabled:opacity-50 transition-colors"
          >
            {createRuleMut.isPending ? 'Criando...' : 'Criar Regra'}
          </button>
        </div>
      </form>
    </div>
  );
}
