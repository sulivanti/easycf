/**
 * @contract UX-APROV-002, FR-002
 * Visual approval chain editor — cards connected by arrows.
 * Supports adding/removing approval levels within a control rule.
 */

import { useState } from 'react';
import { Button, Input, Label } from '@shared/ui';
import type { ApprovalRule, CreateApprovalRuleRequest } from '../types/movement-approval.types.js';

interface ApprovalChainEditorProps {
  levels: ApprovalRule[];
  byValue: boolean;
  onAddLevel: (data: CreateApprovalRuleRequest) => void;
  onRemoveLevel: (id: string) => void;
  loading?: boolean;
  maxLevels?: number;
}

export function ApprovalChainEditor({
  levels,
  byValue,
  onAddLevel,
  onRemoveLevel,
  loading,
  maxLevels = 5,
}: ApprovalChainEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
  const nextLevel = sortedLevels.length > 0 ? sortedLevels[sortedLevels.length - 1].level + 1 : 1;
  const atMaxLevels = sortedLevels.length >= maxLevels;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Cadeia de Aprovação</h3>

      {/* Chain visualization */}
      <div className="flex flex-wrap items-center gap-2">
        {sortedLevels.map((level, index) => (
          <div key={level.id} className="flex items-center gap-2">
            <LevelCard
              level={level}
              byValue={byValue}
              onRemove={() => onRemoveLevel(level.id)}
              loading={loading}
            />
            {index < sortedLevels.length - 1 && (
              <span className="text-lg text-muted-foreground">&rarr;</span>
            )}
          </div>
        ))}

        {sortedLevels.length > 0 && (
          <>
            <span className="text-lg text-muted-foreground">&rarr;</span>
            <span className="rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              EXECUTAR
            </span>
          </>
        )}

        {sortedLevels.length === 0 && (
          <div className="rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Nenhum nível de aprovação configurado.
          </div>
        )}
      </div>

      {/* Add form or button */}
      {showAddForm ? (
        <AddLevelForm
          nextLevel={nextLevel}
          byValue={byValue}
          onAdd={(data) => {
            onAddLevel(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
          loading={loading}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          disabled={loading || atMaxLevels}
          title={atMaxLevels ? `Máximo de ${maxLevels} níveis atingido` : undefined}
        >
          + Adicionar Nível
        </Button>
      )}
    </div>
  );
}

// ── Level Card ──────────────────────────────────────────────────────────────

function LevelCard({
  level,
  byValue,
  onRemove,
  loading,
}: {
  level: ApprovalRule;
  byValue: boolean;
  onRemove: () => void;
  loading?: boolean;
}) {
  return (
    <div className="relative rounded-lg border border-border bg-background p-3 shadow-xs">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">Nível {level.level}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          disabled={loading}
          title="Remover nível"
        >
          ✕
        </Button>
      </div>
      <div className="space-y-0.5 text-xs text-muted-foreground">
        {level.role_id && <div>Papel: {level.role_id}</div>}
        {level.user_id && <div>Usuário: {level.user_id}</div>}
        {level.org_unit_id && <div>Unidade: {level.org_unit_id}</div>}
        <div>SLA: {level.sla_hours}h</div>
        {byValue && level.min_value !== null && level.max_value !== null && (
          <div>
            Faixa: {level.min_value?.toLocaleString('pt-BR')} —{' '}
            {level.max_value?.toLocaleString('pt-BR')}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Level Form ──────────────────────────────────────────────────────────

function AddLevelForm({
  nextLevel,
  byValue,
  onAdd,
  onCancel,
  loading,
}: {
  nextLevel: number;
  byValue: boolean;
  onAdd: (data: CreateApprovalRuleRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [roleId, setRoleId] = useState('');
  const [userId, setUserId] = useState('');
  const [orgUnitId, setOrgUnitId] = useState('');
  const [slaHours, setSlaHours] = useState(24);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      level: nextLevel,
      role_id: roleId || undefined,
      user_id: userId || undefined,
      org_unit_id: orgUnitId || undefined,
      sla_hours: slaHours,
      min_value: byValue && minValue ? Number(minValue) : undefined,
      max_value: byValue && maxValue ? Number(maxValue) : undefined,
    });
  };

  return (
    <form
      className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
      onSubmit={handleSubmit}
    >
      <h4 className="text-sm font-semibold text-foreground">Novo Nível {nextLevel}</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="al-role">Papel</Label>
          <Input
            id="al-role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={loading}
            placeholder="role_id"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="al-user">Usuário</Label>
          <Input
            id="al-user"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={loading}
            placeholder="user_id"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="al-org-unit">Unidade Org.</Label>
          <Input
            id="al-org-unit"
            value={orgUnitId}
            onChange={(e) => setOrgUnitId(e.target.value)}
            disabled={loading}
            placeholder="org_unit_id"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="al-sla">SLA (horas)</Label>
          <Input
            id="al-sla"
            type="number"
            min={1}
            value={slaHours}
            onChange={(e) => setSlaHours(Number(e.target.value))}
            required
            disabled={loading}
          />
        </div>
      </div>

      {byValue && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="al-min-value">Valor mínimo</Label>
            <Input
              id="al-min-value"
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="al-max-value">Valor máximo</Label>
            <Input
              id="al-max-value"
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={loading} isLoading={loading}>
          Adicionar
        </Button>
      </div>
    </form>
  );
}
