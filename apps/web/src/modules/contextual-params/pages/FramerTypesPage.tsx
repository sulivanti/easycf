/**
 * @contract FR-001, UX-007
 * Page: Catálogo de Tipos de Enquadrador — tabela read-mostly com criação.
 * Route: /parametros/tipos-framer
 */

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { useFramerTypes, useCreateFramerType } from '../hooks/use-framers.js';

export function FramerTypesPage() {
  const { data: framerTypes, isLoading, isError, error } = useFramerTypes();
  const createMutation = useCreateFramerType();
  const [showCreate, setShowCreate] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const items = framerTypes?.data ?? [];

  function resetForm() {
    setCodigo('');
    setNome('');
    setDescricao('');
    setShowCreate(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        codigo: codigo.trim(),
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
      });
      toast.success('Tipo de enquadrador criado com sucesso.');
      resetForm();
    } catch {
      toast.error('Erro ao criar tipo de enquadrador.');
    }
  }

  return (
    <div className="-m-6">
      <PageHeader
        title="Tipos de Enquadrador"
        description="Catálogo de referência para classificação de enquadradores"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            Criar tipo
          </Button>
        }
      />

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
          <EmptyState
            title="Nenhum tipo cadastrado"
            description="Nenhum tipo cadastrado. Crie o primeiro."
          />
        ) : (
          <div className="rounded-lg border border-a1-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium font-mono text-xs">{item.codigo}</TableCell>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Tipo de Enquadrador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ft-codigo">Código</Label>
              <Input
                id="ft-codigo"
                required
                maxLength={50}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="ex: FISCAL, TRABALHISTA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ft-nome">Nome</Label>
              <Input
                id="ft-nome"
                required
                maxLength={255}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ft-desc">Descrição</Label>
              <Input
                id="ft-desc"
                maxLength={1000}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
