/**
 * @contract FR-003, UX-007
 * Page: Configuração de Target Objects — tabela CRUD com drill-down de campos.
 * Route: /parametros/target-objects
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
import { useTargetObjects, useTargetFields, useCreateTargetField } from '../hooks/use-target-objects.js';
import type { FieldType } from '../types/contextual-params.types.js';

const FIELD_TYPES: FieldType[] = ['TEXT', 'NUMBER', 'DATE', 'SELECT', 'BOOLEAN', 'FILE'];

export function TargetObjectsPage() {
  const { data: targetObjects, isLoading, isError, error } = useTargetObjects();
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const items = targetObjects?.data ?? [];

  return (
    <div className="-m-6">
      <div className="flex items-center justify-between border-b border-a1-border bg-white px-6 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-extrabold tracking-[-0.4px] text-a1-text-primary">
            Target Objects
          </h1>
          <p className="font-display text-[11px] text-a1-text-hint">
            Objetos-alvo e seus campos para incidência de enquadradores
          </p>
        </div>
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
            <p className="text-sm text-muted-foreground">Nenhum target object encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Módulo ECF</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium font-mono text-xs">{item.codigo}</TableCell>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>
                    {item.modulo_ecf ? (
                      <Badge variant="secondary">{item.modulo_ecf}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setSelectedObjectId(item.id)}
                    >
                      Campos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Fields panel */}
      {selectedObjectId && (
        <FieldsPanel
          objectId={selectedObjectId}
          objectName={items.find((i) => i.id === selectedObjectId)?.nome ?? ''}
          onClose={() => setSelectedObjectId(null)}
        />
      )}
    </div>
  );
}

// ── Fields Panel ──────────────────────────────────────────────────────────────

function FieldsPanel({
  objectId,
  objectName,
  onClose,
}: {
  objectId: string;
  objectName: string;
  onClose: () => void;
}) {
  const { data: fields, isLoading } = useTargetFields(objectId);
  const createFieldMutation = useCreateTargetField();
  const [showAdd, setShowAdd] = useState(false);
  const [fieldKey, setFieldKey] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('TEXT');

  const fieldItems = fields?.data ?? [];

  async function handleAddField(e: FormEvent) {
    e.preventDefault();
    try {
      await createFieldMutation.mutateAsync({
        objectId,
        data: {
          field_key: fieldKey.trim(),
          field_label: fieldLabel.trim() || undefined,
          field_type: fieldType,
        },
      });
      toast.success('Campo adicionado.');
      setFieldKey('');
      setFieldLabel('');
      setFieldType('TEXT');
      setShowAdd(false);
    } catch {
      toast.error('Erro ao adicionar campo.');
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Campos — {objectName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : fieldItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum campo cadastrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chave</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Sistema</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fieldItems.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.field_key}</TableCell>
                    <TableCell>{f.field_label ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{f.field_type}</Badge>
                    </TableCell>
                    <TableCell>{f.is_system ? 'Sim' : 'Não'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {showAdd ? (
            <form onSubmit={handleAddField} className="space-y-3 border-t pt-3">
              <div className="space-y-2">
                <Label htmlFor="tf-key">Chave do campo</Label>
                <Input
                  id="tf-key"
                  required
                  maxLength={100}
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  placeholder="ex: valor_total"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tf-label">Label</Label>
                <Input
                  id="tf-label"
                  maxLength={255}
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tf-type">Tipo</Label>
                <select
                  id="tf-type"
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FieldType)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" isLoading={createFieldMutation.isPending}>
                  Adicionar
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
              Adicionar campo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
