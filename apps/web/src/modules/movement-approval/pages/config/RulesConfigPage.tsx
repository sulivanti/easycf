/**
 * @contract UX-APROV-002, FR-001, FR-002, FR-003
 *
 * Rules configuration page with control rules table,
 * create/edit drawer, approval chain editor, dry-run simulation, and delete confirmation dialog.
 * Toast via sonner for UX-008 feedback.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { ConfirmationModal } from '@shared/ui/confirmation-modal';
import { StatusBadge } from '@shared/ui/status-badge';
import {
  useControlRules,
  useControlRule,
  useCreateControlRule,
  useUpdateControlRule,
  useDeleteControlRule,
  useCreateApprovalRule,
  useDeleteApprovalRule,
} from '../../hooks/use-control-rules.js';
import { useEvaluate } from '../../hooks/use-engine.js';
import { ControlRuleDrawer } from '../../components/ControlRuleDrawer.js';
import { ApprovalChainEditor } from '../../components/ApprovalChainEditor.js';
import type {
  ControlRule,
  ControlRuleListItem,
  CreateControlRuleRequest,
  UpdateControlRuleRequest,
  EvaluateRequest,
} from '../../types/movement-approval.types.js';

export function RulesConfigPage() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; codigo: string } | null>(null);

  const rulesQuery = useControlRules();
  const expandedQuery = useControlRule(expandedRuleId);
  const createMut = useCreateControlRule();
  const updateMut = useUpdateControlRule();
  const deleteMut = useDeleteControlRule();

  const rules = rulesQuery.data?.data ?? [];
  const expandedRule = expandedQuery.data ?? null;

  const handleOpenCreate = () => {
    setEditingRuleId(null);
    setShowDrawer(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditingRuleId(id);
    setShowDrawer(true);
  };

  const handleSave = (data: CreateControlRuleRequest | UpdateControlRuleRequest) => {
    if (editingRuleId) {
      updateMut.mutate(
        { id: editingRuleId, data: data as UpdateControlRuleRequest },
        {
          onSuccess: () => {
            toast.success('Regra atualizada com sucesso');
            setShowDrawer(false);
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : 'Erro ao atualizar regra.'),
        },
      );
    } else {
      createMut.mutate(data as CreateControlRuleRequest, {
        onSuccess: () => {
          toast.success('Regra criada com sucesso');
          setShowDrawer(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao criar regra.'),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Regra excluída com sucesso');
        if (expandedRuleId === deleteTarget.id) setExpandedRuleId(null);
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro ao excluir regra.'),
    });
  };

  const handleToggleExpand = (id: string) => {
    setExpandedRuleId((prev) => (prev === id ? null : id));
  };

  const isExpiredValidity = (rule: ControlRuleListItem) => {
    if (!rule.valid_until) return false;
    return new Date(rule.valid_until) < new Date();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-a1-border px-6 py-4">
        <PageHeader
          title="Configurador de Regras"
          description="Gerencie regras de controle de aprovação"
          actions={<Button onClick={handleOpenCreate}>Nova Regra</Button>}
        />
      </header>

      {/* Error */}
      {rulesQuery.isError && (
        <div className="mx-6 mt-3 rounded-md bg-status-error-bg px-4 py-2 text-sm text-danger-600">
          {rulesQuery.error instanceof Error
            ? rulesQuery.error.message
            : 'Erro ao carregar regras.'}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Rules table */}
        {rulesQuery.isLoading && !rulesQuery.data ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-a1-border" />
            ))}
          </div>
        ) : rules.length > 0 ? (
          <div className="rounded-lg border border-a1-border bg-white">
            <Table aria-label="Regras de controle de aprovação">
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Por Valor</TableHead>
                  <TableHead>Níveis</TableHead>
                  <TableHead>Auto-Aprov.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => {
                  const expired = isExpiredValidity(rule);
                  return (
                    <TableRow
                      key={rule.id}
                      className={expandedRuleId === rule.id ? 'bg-accent/50' : ''}
                    >
                      <TableCell>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleToggleExpand(rule.id)}
                        >
                          {rule.codigo}
                        </Button>
                      </TableCell>
                      <TableCell>{rule.operation}</TableCell>
                      <TableCell>{rule.entity_type}</TableCell>
                      <TableCell>{rule.by_value ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>{rule.approval_rules_count}</TableCell>
                      <TableCell>{rule.allow_self_approve ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>
                        <StatusBadge status={rule.is_active ? 'success' : 'neutral'}>
                          {rule.is_active ? 'Ativa' : 'Inativa'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        {rule.valid_until ? (
                          <span className={expired ? 'text-amber-600 font-medium' : ''}>
                            {new Date(rule.valid_until).toLocaleDateString('pt-BR')}
                            {expired && ' (expirada)'}
                          </span>
                        ) : (
                          <span className="text-a1-text-auxiliary">Indefinida</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleOpenEdit(rule.id)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => setDeleteTarget({ id: rule.id, codigo: rule.codigo })}
                            disabled={deleteMut.isPending}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-a1-text-auxiliary">Nenhuma regra de controle cadastrada.</p>
            <Button variant="link" size="sm" className="mt-2" onClick={handleOpenCreate}>
              Criar primeira regra
            </Button>
          </div>
        )}

        {/* Expanded rule — chain editor */}
        {expandedRule && <ExpandedRuleSection rule={expandedRule} />}

        {/* Dry-run simulation */}
        <DryRunSection />
      </div>

      {/* Drawer */}
      <ControlRuleDrawer
        open={showDrawer}
        rule={editingRuleId ? expandedRule : null}
        onSave={handleSave}
        onClose={() => setShowDrawer(false)}
        loading={createMut.isPending || updateMut.isPending}
        error={createMut.error?.message || updateMut.error?.message || null}
      />

      {/* Delete confirmation dialog */}
      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir a regra ${deleteTarget?.codigo ?? ''}? Esta ação não pode ser desfeita.`}
        variant="destructive"
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}

// ── Expanded Rule Section ───────────────────────────────────────────────────

function ExpandedRuleSection({ rule }: { rule: ControlRule }) {
  const addLevelMut = useCreateApprovalRule();
  const removeLevelMut = useDeleteApprovalRule();

  const handleAddLevel = (data: Parameters<typeof addLevelMut.mutate>[0]['data']) => {
    addLevelMut.mutate(
      { controlRuleId: rule.id, data },
      {
        onSuccess: () => toast.success('Nível adicionado'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro'),
      },
    );
  };

  const handleRemoveLevel = (id: string) => {
    removeLevelMut.mutate(
      { controlRuleId: rule.id, id },
      {
        onSuccess: () => toast.success('Nível removido'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erro'),
      },
    );
  };

  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Regra: {rule.codigo} — {rule.operation} / {rule.entity_type}
      </h2>
      <ApprovalChainEditor
        levels={rule.approval_rules}
        byValue={rule.by_value}
        onAddLevel={handleAddLevel}
        onRemoveLevel={handleRemoveLevel}
        loading={addLevelMut.isPending || removeLevelMut.isPending}
      />
    </section>
  );
}

// ── Dry-Run Simulation ──────────────────────────────────────────────────────

function DryRunSection() {
  const evaluateMut = useEvaluate();

  const [operation, setOperation] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [value, setValue] = useState('');

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const data: EvaluateRequest = {
      operation,
      entity_type: entityType,
      entity_id: entityId,
      value: value ? Number(value) : undefined,
    };
    evaluateMut.mutate(data);
  };

  return (
    <section className="rounded-lg border border-border bg-background p-4 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Simulação (Dry-Run)</h2>
      <form className="grid grid-cols-2 gap-3 lg:grid-cols-4" onSubmit={handleSimulate}>
        <div className="space-y-1">
          <Label htmlFor="dr-operation">Operação</Label>
          <Input
            id="dr-operation"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dr-entity-type">Tipo de Entidade</Label>
          <Input
            id="dr-entity-type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dr-entity-id">ID da Entidade</Label>
          <Input
            id="dr-entity-id"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="dr-value">Valor (opcional)</Label>
          <Input
            id="dr-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="col-span-full flex gap-2">
          <Button type="submit" disabled={evaluateMut.isPending} isLoading={evaluateMut.isPending}>
            Simular
          </Button>
          {evaluateMut.data && (
            <Button type="button" variant="outline" onClick={() => evaluateMut.reset()}>
              Limpar
            </Button>
          )}
        </div>
      </form>

      {evaluateMut.isError && (
        <div className="rounded-md bg-status-error-bg px-3 py-2 text-sm text-danger-600">
          {evaluateMut.error instanceof Error ? evaluateMut.error.message : 'Erro na simulação.'}
        </div>
      )}

      {evaluateMut.data && (
        <div className="rounded-md border border-a1-border bg-a1-bg p-4" aria-live="assertive">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Resultado</h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Requer aprovação:</span>{' '}
              <Badge variant={evaluateMut.data.requires_approval ? 'destructive' : 'default'}>
                {evaluateMut.data.requires_approval ? 'CONTROLADO' : 'LIVRE'}
              </Badge>
            </div>
            {evaluateMut.data.control_rule_id && (
              <div>
                <span className="font-medium">Regra:</span> {evaluateMut.data.control_rule_id}
              </div>
            )}
            {evaluateMut.data.matched_levels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="font-medium">Níveis:</span>
                {evaluateMut.data.matched_levels.map((l) => (
                  <Badge key={l.id} variant="outline">
                    Nível {l.level} (SLA: {l.sla_hours}h)
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
