/**
 * @contract UX-008 §2.3 Aba 2, FR-003
 *
 * Mappings tab: table with type badges, adaptive form, add/delete/reorder.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui';
import {
  useFieldMappings,
  useCreateFieldMapping,
  useDeleteFieldMapping,
} from '../hooks/use-field-mappings.js';
import { canWriteRoutine } from '../types/permissions.js';
import { COPY, MAPPING_TYPE_BADGE } from '../types/view-model.js';
import type {
  MappingType,
  CreateFieldMappingRequest,
} from '../types/integration-protheus.types.js';

const MAPPING_TYPES: MappingType[] = ['FIELD', 'PARAM', 'HEADER', 'FIXED_VALUE', 'DERIVED'];

interface FieldMappingsTabProps {
  routineId: string;
  readonly: boolean;
  userScopes: readonly string[];
}

export function FieldMappingsTab({
  routineId,
  readonly: isReadonly,
  userScopes,
}: FieldMappingsTabProps) {
  const mappingsQuery = useFieldMappings(routineId);
  const createMut = useCreateFieldMapping();
  const deleteMut = useDeleteFieldMapping();

  const mappings = mappingsQuery.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; targetField: string } | null>(
    null,
  );

  // Form state
  const [formType, setFormType] = useState<MappingType>('FIELD');
  const [sourceField, setSourceField] = useState('');
  const [targetField, setTargetField] = useState('');
  const [required, setRequired] = useState(false);
  const [transformExpr, setTransformExpr] = useState('');
  const [conditionExpr, setConditionExpr] = useState('');
  const [defaultValue, setDefaultValue] = useState('');

  function resetForm() {
    setFormType('FIELD');
    setSourceField('');
    setTargetField('');
    setRequired(false);
    setTransformExpr('');
    setConditionExpr('');
    setDefaultValue('');
    setShowForm(false);
  }

  function handleCreate() {
    const data: CreateFieldMappingRequest = {
      source_field: sourceField,
      target_field: targetField,
      mapping_type: formType,
      required,
      transform_expr: transformExpr || null,
      condition_expr: conditionExpr || null,
      default_value: defaultValue || null,
      ordem: mappings.length + 1,
    };
    createMut.mutate({ routineId, data }, { onSuccess: () => resetForm() });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(COPY.success_delete_mapping);
        setDeleteTarget(null);
      },
    });
  }

  if (mappings.length === 0 && !showForm) {
    return (
      <div className="space-y-4">
        <p className="py-8 text-center text-sm text-muted-foreground">{COPY.empty_mappings}</p>
        {!isReadonly && canWriteRoutine(userScopes) && (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            + Adicionar mapeamento
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Campo origem</TableHead>
            <TableHead className="w-8 text-center">&rarr;</TableHead>
            <TableHead>Campo destino</TableHead>
            <TableHead className="w-16 text-center">Obrig.</TableHead>
            {!isReadonly && <TableHead className="w-20 text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-mono text-xs">{m.ordem}</TableCell>
              <TableCell>
                <Badge className={MAPPING_TYPE_BADGE[m.mapping_type]}>{m.mapping_type}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                {m.mapping_type === 'FIXED_VALUE' ? '—' : m.source_field}
              </TableCell>
              <TableCell className="text-center text-muted-foreground">&rarr;</TableCell>
              <TableCell className="text-sm">{m.target_field}</TableCell>
              <TableCell className="text-center">
                {m.required && <span className="text-xs font-semibold text-red-600">req.</span>}
              </TableCell>
              {!isReadonly && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setDeleteTarget({ id: m.id, targetField: m.target_field })}
                  >
                    Remover
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add form */}
      {showForm && (
        <div className="space-y-3 rounded-md border border-input p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as MappingType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MAPPING_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            {formType !== 'FIXED_VALUE' && (
              <div className="space-y-1.5">
                <Label>Campo origem</Label>
                <Input value={sourceField} onChange={(e) => setSourceField(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Campo destino</Label>
              <Input value={targetField} onChange={(e) => setTargetField(e.target.value)} />
            </div>
            {formType === 'FIXED_VALUE' && (
              <div className="space-y-1.5">
                <Label>Valor literal</Label>
                <Input value={defaultValue} onChange={(e) => setDefaultValue(e.target.value)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Expressão de transformação</Label>
              <Input
                value={transformExpr}
                onChange={(e) => setTransformExpr(e.target.value)}
                placeholder="UPPER(value)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Condição</Label>
              <Input
                value={conditionExpr}
                onChange={(e) => setConditionExpr(e.target.value)}
                placeholder="case.tipo == 'SERVICO'"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded border-input"
            />
            Obrigatório
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createMut.isPending || !targetField}>
              Adicionar
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {!isReadonly && canWriteRoutine(userScopes) && !showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          + Adicionar mapeamento
        </Button>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover mapeamento</DialogTitle>
            <DialogDescription>
              {deleteTarget ? COPY.confirm_delete_mapping(deleteTarget.targetField) : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMut.isPending}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
