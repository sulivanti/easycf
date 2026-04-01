/**
 * @contract FR-004, FR-010, INT-007, UX-007
 * Page: Regras de Incidência — tabela com filtros (framer, target-object, status).
 * Route: /parametros/incidencia
 */

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { StatusBadge } from '@shared/ui/status-badge';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { Select } from '@shared/ui/select';
import { FilterBar } from '@shared/ui/filter-bar';
import {
  useIncidenceRules,
  useCreateIncidenceRule,
  useUpdateIncidenceRule,
} from '../hooks/use-incidence-rules.js';
import { useFramersList } from '../hooks/use-framers.js';
import { useTargetObjects } from '../hooks/use-target-objects.js';
import type {
  FramerStatus,
  IncidenceType,
  IncidenceRuleListFilters,
} from '../types/contextual-params.types.js';

const STATUS_MAP: Record<FramerStatus, 'success' | 'neutral'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
};

export function IncidenceRulesPage() {
  const [filters, setFilters] = useState<IncidenceRuleListFilters>({});
  const { data: rules, isLoading, isError, error } = useIncidenceRules(filters);
  const { data: framers } = useFramersList({});
  const { data: targetObjects } = useTargetObjects();
  const createMutation = useCreateIncidenceRule();
  const updateMutation = useUpdateIncidenceRule();
  const [showCreate, setShowCreate] = useState(false);

  const items = rules?.data ?? [];
  const framerList = framers?.data ?? [];
  const targetList = targetObjects?.data ?? [];

  // ── Helpers ────────────────────────────────────────────────────────────
  const framerName = (id: string) => framerList.find((f) => f.id === id)?.nome ?? id;
  const targetName = (id: string) => targetList.find((t) => t.id === id)?.nome ?? id;

  async function handleToggleStatus(ruleId: string, currentStatus: FramerStatus) {
    const newStatus: FramerStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({ id: ruleId, data: { status: newStatus } });
      toast.success(`Regra ${newStatus === 'ACTIVE' ? 'ativada' : 'desativada'}.`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  return (
    <div className="-m-6">
      <PageHeader
        title="Regras de Incidência"
        description="Vínculo entre enquadradores e target objects"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            Nova regra
          </Button>
        }
      />

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <FilterBar>
        <Select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value as FramerStatus) || undefined,
            }))
          }
          placeholder="Todos os status"
          options={[
            { value: 'ACTIVE', label: 'Ativo' },
            { value: 'INACTIVE', label: 'Inativo' },
          ]}
        />
        {(filters.status || filters.framer_id || filters.target_object_id) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            Limpar filtros
          </Button>
        )}
      </FilterBar>

      <div className="p-6 space-y-6">
        {isError && (
          <div
            role="alert"
            className="rounded-md border border-a1-border bg-status-error-bg p-3 text-sm text-danger-600"
          >
            <p>{(error as Error)?.message ?? 'Erro ao carregar dados.'}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-a1-border" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Sem regras" description="Nenhuma regra de incidência encontrada." />
        ) : (
          <div className="rounded-lg border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enquadrador</TableHead>
                  <TableHead>Target Object</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{framerName(rule.framer_id)}</TableCell>
                    <TableCell>{targetName(rule.target_object_id)}</TableCell>
                    <TableCell>
                      <StatusBadge status={STATUS_MAP[rule.status]}>{rule.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(rule.valid_from).toLocaleDateString('pt-BR')}
                      {rule.valid_until
                        ? ` — ${new Date(rule.valid_until).toLocaleDateString('pt-BR')}`
                        : ' — sem fim'}
                    </TableCell>
                    <TableCell>{new Date(rule.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleStatus(rule.id, rule.status)}
                      >
                        {rule.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateRuleDialog
        open={showCreate}
        framers={framerList}
        targets={targetList}
        isPending={createMutation.isPending}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
          toast.success('Regra de incidência criada.');
          setShowCreate(false);
        }}
      />
    </div>
  );
}

// ── Create Dialog ─────────────────────────────────────────────────────────────

function CreateRuleDialog({
  open,
  framers,
  targets,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  framers: Array<{ id: string; nome: string }>;
  targets: Array<{ id: string; nome: string }>;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    framer_id: string;
    target_object_id: string;
    incidence_type: IncidenceType;
    valid_from: string;
    valid_until?: string;
  }) => Promise<void>;
}) {
  const [framerId, setFramerId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [incidenceType, setIncidenceType] = useState<IncidenceType>('OBR');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');

  function reset() {
    setFramerId('');
    setTargetId('');
    setIncidenceType('OBR');
    setValidFrom(new Date().toISOString().slice(0, 10));
    setValidUntil('');
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await onSubmit({
        framer_id: framerId,
        target_object_id: targetId,
        incidence_type: incidenceType,
        valid_from: validFrom,
        valid_until: validUntil || undefined,
      });
      reset();
    } catch {
      toast.error('Erro ao criar regra.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && reset()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Regra de Incidência</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ir-framer">Enquadrador</Label>
            <Select
              id="ir-framer"
              required
              value={framerId}
              onChange={(e) => setFramerId(e.target.value)}
              placeholder="Selecione..."
              options={framers.map((f) => ({ value: f.id, label: f.nome }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ir-target">Target Object</Label>
            <Select
              id="ir-target"
              required
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Selecione..."
              options={targets.map((t) => ({ value: t.id, label: t.nome }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ir-type">Tipo de incidência</Label>
            <Select
              id="ir-type"
              required
              value={incidenceType}
              onChange={(e) => setIncidenceType(e.target.value as IncidenceType)}
              placeholder="Selecione..."
              options={[
                { value: 'OBR', label: 'Obrigatório (OBR)' },
                { value: 'OPC', label: 'Opcional (OPC)' },
                { value: 'AUTO', label: 'Auto-apply (AUTO)' },
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ir-from">Vigência início</Label>
            <Input
              id="ir-from"
              type="date"
              required
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ir-until">Vigência fim (opcional)</Label>
            <Input
              id="ir-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={reset}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
