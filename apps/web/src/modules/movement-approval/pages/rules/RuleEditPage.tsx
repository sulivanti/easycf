/**
 * @contract UX-009 §30, UX-009-M01 D9
 *
 * View ⑦ — Editar Regra (/approvals/rules/:id)
 * Like create + StatCards + StatusBadge no header + pre-filled chain + "Desativar Regra"
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from 'lucide-react';
import { Button, Skeleton } from '@shared/ui';
import { StatusBadge } from '@shared/ui/status-badge';
import {
  useControlRule,
  useUpdateControlRule,
  useCreateApprovalRule,
  useDeleteApprovalRule,
} from '../../hooks/use-control-rules.js';
import type { CreateApprovalRuleRequest } from '../../types/movement-approval.types.js';

// ── Chain Level ──────────────────────────────────────────────────────────────

interface ChainLevel {
  id: string;
  serverId?: string; // ID no backend (se existir)
  approverType: 'ROLE' | 'USER' | 'ORG_LEVEL';
  entity: string;
  criteria: 'ALL' | 'ANY';
  timeout: string;
  isNew: boolean;
}

function levelFromServer(inst: {
  id: string;
  level: number;
  role_id: string | null;
  user_id: string | null;
  org_unit_id: string | null;
  sla_hours: number;
}): ChainLevel {
  const type = inst.role_id ? 'ROLE' : inst.user_id ? 'USER' : 'ORG_LEVEL';
  const entity = inst.role_id ?? inst.user_id ?? inst.org_unit_id ?? '';
  return {
    id: inst.id,
    serverId: inst.id,
    approverType: type,
    entity,
    criteria: 'ALL',
    timeout: String(inst.sla_hours),
    isNew: false,
  };
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface RuleEditPageProps {
  ruleId: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function RuleEditPage({ ruleId }: RuleEditPageProps) {
  const navigate = useNavigate();
  const ruleQuery = useControlRule(ruleId);
  const updateMut = useUpdateControlRule();
  const addLevelMut = useCreateApprovalRule();
  const removeLevelMut = useDeleteApprovalRule();

  const rule = ruleQuery.data ?? null;

  const [config, setConfig] = useState({
    objectType: '',
    operationType: '',
    threshold: '',
    requireApproval: true,
    allowSelfApprove: false,
  });

  const [levels, setLevels] = useState<ChainLevel[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (rule && !initialized) {
      setConfig({
        objectType: rule.entity_type,
        operationType: rule.operation,
        threshold: '',
        requireApproval: true,
        allowSelfApprove: rule.allow_self_approve,
      });
      setLevels(rule.approval_rules.map(levelFromServer));
      setInitialized(true);
    }
  }, [rule, initialized]);

  function addLevel() {
    const newLevel: ChainLevel = {
      id: crypto.randomUUID(),
      approverType: 'ROLE',
      entity: '',
      criteria: 'ALL',
      timeout: '24',
      isNew: true,
    };
    setLevels((prev) => [...prev, newLevel]);
  }

  function removeLevel(id: string, serverId?: string) {
    if (serverId) {
      removeLevelMut.mutate(
        { controlRuleId: ruleId, id: serverId },
        {
          onSuccess: () => {
            setLevels((prev) => prev.filter((l) => l.id !== id));
            toast.success('Nível removido.');
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : 'Erro ao remover nível.'),
        },
      );
    } else {
      setLevels((prev) => prev.filter((l) => l.id !== id));
    }
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
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function handleToggleActive() {
    if (!rule) return;
    updateMut.mutate(
      { id: ruleId, data: { is_active: !rule.is_active } },
      {
        onSuccess: () => toast.success(rule.is_active ? 'Regra desativada.' : 'Regra ativada.'),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Erro ao atualizar regra.'),
      },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config.objectType || !config.operationType) {
      toast.error('Preencha Tipo de Objeto e Operação.');
      return;
    }

    updateMut.mutate(
      {
        id: ruleId,
        data: {
          operation: config.operationType,
          entity_type: config.objectType,
          allow_self_approve: config.allowSelfApprove,
        },
      },
      {
        onSuccess: async () => {
          // Add new levels
          const newLevels = levels.filter((l) => l.isNew);
          for (let i = 0; i < newLevels.length; i++) {
            const lv = newLevels[i];
            const idx = levels.findIndex((l) => l.id === lv.id);
            const data: CreateApprovalRuleRequest = {
              level: idx + 1,
              sla_hours: parseInt(lv.timeout, 10) || 24,
              role_id: lv.approverType === 'ROLE' ? lv.entity || undefined : undefined,
              user_id: lv.approverType === 'USER' ? lv.entity || undefined : undefined,
              org_unit_id: lv.approverType === 'ORG_LEVEL' ? lv.entity || undefined : undefined,
            };
            await addLevelMut.mutateAsync({ controlRuleId: ruleId, data });
          }
          toast.success('Regra atualizada com sucesso.');
          navigate({ to: '/approvals/rules' });
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Erro ao atualizar regra.'),
      },
    );
  }

  if (ruleQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-md" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="py-16 text-center text-[13px] text-[#888888]">Regra não encontrada.</div>
    );
  }

  // Mock stats (in real app would come from API)
  const stats = [
    { label: 'Acionamentos', value: '—', color: 'text-[#111111]' },
    { label: 'Aprovados', value: '—', color: 'text-[#16a34a]' },
    { label: 'Rejeitados', value: '—', color: 'text-[#dc2626]' },
  ];

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* Header with StatusBadge + Desativar */}
      <div className="flex items-start justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-[11px] text-[#888888]">
            <span>Aprovação</span>
            <span className="text-[#E8E8E6]">/</span>
            <Link to="/approvals/rules" className="hover:text-[#111111]">
              Regras
            </Link>
            <span className="text-[#E8E8E6]">/</span>
            <span className="font-semibold text-[#111111]">Editar {rule.codigo}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-extrabold leading-[1.2] tracking-[-1px] text-[#111111]">
              {rule.codigo}
            </h1>
            <StatusBadge status={rule.is_active ? 'success' : 'neutral'}>
              {rule.is_active ? 'Ativa' : 'Inativa'}
            </StatusBadge>
          </div>
          <p className="mt-1 text-[13px] text-[#888888]">
            {rule.operation} / {rule.entity_type}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={updateMut.isPending}
          className="rounded-md border border-[#dc2626] px-4 py-2 text-[13px] font-medium text-[#dc2626] hover:bg-[#fee2e2] disabled:opacity-50 transition-colors"
        >
          {rule.is_active ? 'Desativar Regra' : 'Ativar Regra'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[#E8E8E6] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
              {stat.label}
            </p>
            <p className={`mt-1 text-[22px] font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── Config Column ── */}
          <div className="space-y-4 rounded-[10px] border border-[#E8E8E6] bg-white p-6">
            <h2 className="text-[14px] font-bold text-[#111111]">Configuração da Regra</h2>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Tipo de Objeto <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                value={config.objectType}
                onChange={(e) => setConfig((p) => ({ ...p, objectType: e.target.value }))}
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Tipo de Operação <span className="text-[#dc2626]">*</span>
              </label>
              <select
                value={config.operationType}
                onChange={(e) => setConfig((p) => ({ ...p, operationType: e.target.value }))}
                required
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
              >
                <option value="">Selecione...</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Allow self approve */}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={config.allowSelfApprove}
                onChange={(e) => setConfig((p) => ({ ...p, allowSelfApprove: e.target.checked }))}
                className="size-4 rounded border-[#E8E8E6] accent-[#2E86C1]"
              />
              <span className="text-[13px] text-[#111111]">Permitir auto-aprovação</span>
            </label>

            {/* Toggle */}
            <div className="flex items-center justify-between rounded-md border border-[#E8E8E6] px-4 py-3">
              <div>
                <p className="text-[13px] font-medium text-[#111111]">Requer Aprovação</p>
                <p className="text-[11px] text-[#888888]">
                  Ativo: movimentos precisam de aprovação
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

            {/* Valid from */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                Válido a partir de
              </label>
              <input
                type="date"
                defaultValue={rule.valid_from?.slice(0, 10)}
                className="h-9 w-full rounded-md border border-[#E8E8E6] bg-white px-3 text-[13px] text-[#111111] outline-none focus:border-[#2E86C1]"
                readOnly
              />
            </div>

            {/* Criação */}
            <div className="rounded-md bg-[#F5F5F3] px-3 py-2 text-[12px] text-[#888888]">
              Criado em: {new Date(rule.created_at).toLocaleDateString('pt-BR')}
            </div>
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
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#E3F2FD] px-3 py-0.5 text-[11px] font-bold text-[#2E86C1]">
                          Nível {i + 1}
                        </span>
                        {!level.isNew && (
                          <span className="text-[10px] text-[#888888]">existente</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveLevel(level.id, 'up')}
                          disabled={i === 0}
                          className="rounded p-1 text-[#888888] hover:text-[#111111] disabled:opacity-30"
                        >
                          <ChevronUpIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLevel(level.id, 'down')}
                          disabled={i === levels.length - 1}
                          className="rounded p-1 text-[#888888] hover:text-[#111111] disabled:opacity-30"
                        >
                          <ChevronDownIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLevel(level.id, level.serverId)}
                          className="rounded p-1 text-[#dc2626] hover:text-[#b91c1c]"
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
                          onChange={(e) => updateLevel(level.id, 'approverType', e.target.value)}
                          disabled={!level.isNew}
                          className="h-8 w-full rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1] disabled:bg-[#F5F5F3]"
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
                          disabled={!level.isNew}
                          className="h-8 w-full rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none placeholder:text-[#CCCCCC] focus:border-[#2E86C1] disabled:bg-[#F5F5F3]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[#888888]">
                          Critério
                        </label>
                        <select
                          value={level.criteria}
                          onChange={(e) => updateLevel(level.id, 'criteria', e.target.value)}
                          disabled={!level.isNew}
                          className="h-8 w-full rounded-md border border-[#E8E8E6] bg-white px-2 text-[12px] text-[#111111] outline-none focus:border-[#2E86C1] disabled:bg-[#F5F5F3]"
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
            disabled={updateMut.isPending || addLevelMut.isPending}
            className="rounded-md bg-[#2E86C1] px-6 py-2 text-[13px] font-semibold text-white hover:bg-[#2573a7] disabled:opacity-50 transition-colors"
          >
            {updateMut.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
