/**
 * @contract FR-001, UX-008 §2.3
 * Page: Catálogo de Serviços de Integração — tabela CRUD com config.
 * Route: /integration/services
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
import { useServicesList, useCreateService, useUpdateService } from '../hooks/use-services.js';
import type {
  AuthType,
  Environment,
  ServiceStatus,
  ServiceListFilters,
} from '../types/integration-protheus.types.js';

const STATUS_VARIANT: Record<ServiceStatus, 'default' | 'secondary'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
};

const ENV_VARIANT: Record<Environment, 'default' | 'secondary' | 'outline'> = {
  PROD: 'default',
  HML: 'secondary',
  DEV: 'outline',
};

const AUTH_TYPES: AuthType[] = ['NONE', 'BASIC', 'BEARER', 'OAUTH2'];
const ENVIRONMENTS: Environment[] = ['PROD', 'HML', 'DEV'];

export function IntegrationServicesPage() {
  const [filters, setFilters] = useState<ServiceListFilters>({});
  const { data: services, isLoading, isError, error } = useServicesList(filters);
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const [showCreate, setShowCreate] = useState(false);

  const items = services?.data ?? [];

  async function handleToggleStatus(id: string, current: ServiceStatus) {
    const newStatus: ServiceStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({ id, data: { status: newStatus } });
      toast.success(`Serviço ${newStatus === 'ACTIVE' ? 'ativado' : 'desativado'}.`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  return (
    <div className="-m-6">
      <div className="flex items-center justify-between border-b border-a1-border bg-white px-6 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-extrabold tracking-[-0.4px] text-a1-text-primary">
            Serviços de Integração
          </h1>
          <p className="font-display text-[11px] text-a1-text-hint">
            Catálogo de serviços externos configurados para integração Protheus
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          Novo serviço
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-border bg-white px-6 py-3">
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value as ServiceStatus) || undefined,
            }))
          }
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
        <select
          value={filters.environment ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              environment: (e.target.value as Environment) || undefined,
            }))
          }
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">Todos os ambientes</option>
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
        {(filters.status || filters.environment) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            Limpar
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
            <p className="text-sm text-muted-foreground">Nenhum serviço encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>URL Base</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Ambiente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timeout</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((svc) => (
                <TableRow key={svc.id}>
                  <TableCell className="font-medium font-mono text-xs">{svc.codigo}</TableCell>
                  <TableCell>{svc.nome}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs" title={svc.base_url}>
                    {svc.base_url}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{svc.auth_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ENV_VARIANT[svc.environment]}>{svc.environment}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[svc.status]}>{svc.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{svc.timeout_ms}ms</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleToggleStatus(svc.id, svc.status)}
                    >
                      {svc.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Dialog */}
      <CreateServiceDialog
        open={showCreate}
        isPending={createMutation.isPending}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
          toast.success('Serviço criado com sucesso.');
          setShowCreate(false);
        }}
      />
    </div>
  );
}

// ── Create Dialog ─────────────────────────────────────────────────────────────

function CreateServiceDialog({
  open,
  isPending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    codigo: string;
    nome: string;
    base_url: string;
    auth_type: AuthType;
    environment: Environment;
    timeout_ms?: number;
  }) => Promise<void>;
}) {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState<AuthType>('NONE');
  const [environment, setEnvironment] = useState<Environment>('DEV');
  const [timeoutMs, setTimeoutMs] = useState('30000');

  function reset() {
    setCodigo('');
    setNome('');
    setBaseUrl('');
    setAuthType('NONE');
    setEnvironment('DEV');
    setTimeoutMs('30000');
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await onSubmit({
        codigo: codigo.trim(),
        nome: nome.trim(),
        base_url: baseUrl.trim(),
        auth_type: authType,
        environment,
        timeout_ms: Number(timeoutMs) || undefined,
      });
      reset();
    } catch {
      toast.error('Erro ao criar serviço.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && reset()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Serviço de Integração</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svc-codigo">Código</Label>
            <Input
              id="svc-codigo"
              required
              maxLength={50}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="ex: PROTHEUS_VENDAS"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-nome">Nome</Label>
            <Input
              id="svc-nome"
              required
              maxLength={255}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-url">URL Base</Label>
            <Input
              id="svc-url"
              required
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-auth">Autenticação</Label>
            <select
              id="svc-auth"
              value={authType}
              onChange={(e) => setAuthType(e.target.value as AuthType)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {AUTH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-env">Ambiente</Label>
            <select
              id="svc-env"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as Environment)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-timeout">Timeout (ms)</Label>
            <Input
              id="svc-timeout"
              type="number"
              min={1000}
              max={300000}
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(e.target.value)}
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
