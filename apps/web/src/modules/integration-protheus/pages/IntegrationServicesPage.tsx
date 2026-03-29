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
import { Skeleton } from '@shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { EmptyState } from '@shared/ui/empty-state';
import { StatusBadge } from '@shared/ui/status-badge';
import { PageHeader } from '@shared/ui/page-header';
import { FilterBar } from '@shared/ui/filter-bar';
import { Select } from '@shared/ui/select';
import { useServicesList, useCreateService, useUpdateService } from '../hooks/use-services.js';
import type {
  AuthType,
  Environment,
  ServiceStatus,
  ServiceListFilters,
} from '../types/integration-protheus.types.js';

const AUTH_TYPES: AuthType[] = ['NONE', 'BASIC', 'BEARER', 'OAUTH2'];
const ENVIRONMENTS: Environment[] = ['PROD', 'HML', 'DEV'];

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
];

const ENV_FILTER_OPTIONS = [
  { value: '', label: 'Todos os ambientes' },
  ...ENVIRONMENTS.map((env) => ({ value: env, label: env })),
];

const AUTH_TYPE_OPTIONS = AUTH_TYPES.map((t) => ({ value: t, label: t }));
const ENV_OPTIONS = ENVIRONMENTS.map((env) => ({ value: env, label: env }));

const ENV_STATUS_MAP: Record<Environment, 'error' | 'warning' | 'neutral'> = {
  PROD: 'error',
  HML: 'warning',
  DEV: 'neutral',
};

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
      <PageHeader
        title="Serviços de Integração"
        description="Catálogo de serviços externos configurados para integração Protheus"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            Novo serviço
          </Button>
        }
        className="border-b border-a1-border bg-white px-6 py-4.5"
      />

      {/* Filters */}
      <FilterBar className="border-b border-border bg-white px-6 py-3">
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value as ServiceStatus) || undefined,
            }))
          }
        />
        <Select
          options={ENV_FILTER_OPTIONS}
          value={filters.environment ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              environment: (e.target.value as Environment) || undefined,
            }))
          }
        />
        {(filters.status || filters.environment) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            Limpar
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
          <EmptyState
            title="Nenhum serviço encontrado"
            description="Crie um novo serviço de integração para começar."
          />
        ) : (
          <div className="rounded-lg border border-a1-border bg-white">
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
                      <StatusBadge status="neutral">{svc.auth_type}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ENV_STATUS_MAP[svc.environment]}>
                        {svc.environment}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={svc.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {svc.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
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
          </div>
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
            <Select
              id="svc-auth"
              options={AUTH_TYPE_OPTIONS}
              value={authType}
              onChange={(e) => setAuthType(e.target.value as AuthType)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-env">Ambiente</Label>
            <Select
              id="svc-env"
              options={ENV_OPTIONS}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as Environment)}
            />
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
