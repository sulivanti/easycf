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
import { Badge } from '@shared/ui/badge';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import {
  useIncidenceRules,
  useCreateIncidenceRule,
  useUpdateIncidenceRule,
} from '../hooks/use-incidence-rules.js';
import { useFramersList } from '../hooks/use-framers.js';
import { useTargetObjects } from '../hooks/use-target-objects.js';
import type { FramerStatus, IncidenceRuleListFilters } from '../types/contextual-params.types.js';

const STATUS_VARIANT: Record<FramerStatus, 'default' | 'secondary'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
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
      <div className="flex items-center justify-between border-b border-a1-border bg-white px-6 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-extrabold tracking-[-0.4px] text-a1-text-primary">
            Regras de Incidência
          </h1>
          <p className="font-display text-[11px] text-a1-text-hint">
            Vínculo entre enquadradores e target objects
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          Nova regra
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-border bg-white px-6 py-3">
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value as FramerStatus) || undefined,
            }))
          }
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
        {(filters.status || filters.framer_id || filters.target_object_id) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {isError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <p>{(error as Error)?.message ?? 'Erro ao carregar dados.'}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma regra de incidência encontrada.</p>
          </div>
        ) : (
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
                    <Badge variant={STATUS_VARIANT[rule.status]}>{rule.status}</Badge>
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
    valid_from: string;
    valid_until?: string;
  }) => Promise<void>;
}) {
  const [framerId, setFramerId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');

  function reset() {
    setFramerId('');
    setTargetId('');
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
            <select
              id="ir-framer"
              required
              value={framerId}
              onChange={(e) => setFramerId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Selecione...</option>
              {framers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ir-target">Target Object</Label>
            <select
              id="ir-target"
              required
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Selecione...</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
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
