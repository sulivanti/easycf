/**
 * @contract UX-MCP-001, FR-001..FR-006, BR-004, BR-005, BR-006
 *
 * Agent & Action management page with 3 tabs:
 * - Agents: table with CRUD drawer, revocation modal, key rotation
 * - Actions: catalog with policy badges (DIRECT/CONTROLLED/EVENT_ONLY)
 * - Permissions: agent x action matrix with checkbox toggle
 *
 * Uses shared UI components (Button, Badge, Table, Drawer, Dialog, Skeleton).
 * Tailwind CSS v4 exclusively — zero inline style={{}}.
 * React Query for all data fetching.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  Spinner,
} from '@shared/ui';
import { EmptyState } from '@shared/ui/empty-state';
import { StatusBadge } from '@shared/ui/status-badge';
import {
  useAgentList,
  useCreateAgent,
  useRevokeAgent,
  useRotateKey,
} from '../../hooks/use-agents.js';
import { useActionList, useCreateAction } from '../../hooks/use-actions.js';
import { useGrantAgentAction, useRevokeAgentAction } from '../../hooks/use-agents.js';
import { ApiKeyModal } from '../../components/ApiKeyModal.js';
import { RevokeModal } from '../../components/RevokeModal.js';
import type {
  McpAgent,
  AgentStatus,
  CreateAgentPayload,
  CreateActionPayload,
  ExecutionPolicy,
} from '../../types/mcp-automation.types.js';

type Tab = 'agents' | 'actions' | 'matrix';

const POLICY_VARIANT: Record<ExecutionPolicy, 'default' | 'secondary' | 'outline'> = {
  DIRECT: 'default',
  CONTROLLED: 'secondary',
  EVENT_ONLY: 'outline',
};

const STATUS_VARIANT: Record<AgentStatus, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  REVOKED: 'destructive',
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  REVOKED: 'Revogado',
};

export function AgentsPage() {
  const [tab, setTab] = useState<Tab>('agents');

  return (
    <div className="-m-6">
      {/* Page Header — A1 */}
      <div className="flex items-center justify-between border-b border-a1-border bg-white px-6 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-extrabold tracking-[-0.4px] text-a1-text-primary">
            MCP — Agentes e Ações
          </h1>
          <p className="font-display text-[11px] text-a1-text-hint">
            Gerencie agentes de automação, ações e permissões
          </p>
        </div>
        <nav className="flex gap-1 rounded-[7px] border border-a1-border bg-a1-bg p-1">
          {(['agents', 'actions', 'matrix'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 font-display text-[13px] font-medium transition-colors ${
                tab === t ? 'bg-a1-dark text-white' : 'text-a1-text-auxiliary hover:bg-white'
              }`}
            >
              {t === 'agents' ? 'Agentes' : t === 'actions' ? 'Catálogo de Ações' : 'Permissões'}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {tab === 'agents' && <AgentsTab />}
        {tab === 'actions' && <ActionsTab />}
        {tab === 'matrix' && <MatrixTab />}
      </div>
    </div>
  );
}

// ── Agents Tab ──────────────────────────────────────────────────────────────

function AgentsTab() {
  const [statusFilter, setStatusFilter] = useState<AgentStatus | undefined>();
  const { data, isLoading, error } = useAgentList({ status: statusFilter });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiKeyModal, setApiKeyModal] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<McpAgent | null>(null);

  const revokeMutation = useRevokeAgent();
  const rotateMutation = useRotateKey();

  const handleCreated = (apiKey: string) => {
    setDrawerOpen(false);
    setApiKeyModal(apiKey);
    toast.success('Agente criado com sucesso.');
  };

  const handleRevoke = async (reason: string) => {
    if (!revokeTarget) return;
    await revokeMutation.mutateAsync({ id: revokeTarget.id, reason });
    setRevokeTarget(null);
    toast.success(`Agente '${revokeTarget.nome}' revogado.`);
  };

  const handleRotateKey = async (agent: McpAgent) => {
    const result = await rotateMutation.mutateAsync(agent.id);
    setApiKeyModal(result.api_key);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={statusFilter ?? ''}
          onChange={(e) =>
            setStatusFilter((e.target.value || undefined) as AgentStatus | undefined)
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="REVOKED">Revogado</option>
        </select>
        <Button onClick={() => setDrawerOpen(true)}>Novo Agente</Button>
      </div>

      {error && <p className="text-sm text-danger-600">{(error as Error).message}</p>}

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : data && data.data.length > 0 ? (
        <div className="rounded-lg border border-a1-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phase 2</TableHead>
                <TableHead>Ultimo uso</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((agent) => {
                const isRevoked = agent.status === 'REVOKED';
                return (
                  <TableRow key={agent.id} className={isRevoked ? 'opacity-60' : ''}>
                    <TableCell className="font-mono text-sm">{agent.codigo}</TableCell>
                    <TableCell>{agent.nome}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          agent.status === 'ACTIVE'
                            ? 'success'
                            : agent.status === 'REVOKED'
                              ? 'error'
                              : 'neutral'
                        }
                      >
                        {STATUS_LABEL[agent.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{agent.phase2_create_enabled ? 'Sim' : 'Nao'}</TableCell>
                    <TableCell>
                      {agent.last_used_at
                        ? new Date(agent.last_used_at).toLocaleDateString('pt-BR')
                        : '\u2014'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isRevoked && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRotateKey(agent)}
                            disabled={rotateMutation.isPending}
                          >
                            {rotateMutation.isPending ? (
                              <Spinner className="h-3 w-3" />
                            ) : (
                              'Rodar Chave'
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRevokeTarget(agent)}
                          >
                            Revogar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Nenhum agente cadastrado"
          description="Crie o primeiro agente MCP."
          action={
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              Criar Agente
            </Button>
          }
        />
      )}

      <CreateAgentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
      />

      {apiKeyModal && <ApiKeyModal apiKey={apiKeyModal} onClose={() => setApiKeyModal(null)} />}

      {revokeTarget && (
        <RevokeModal
          agentName={revokeTarget.nome}
          loading={revokeMutation.isPending}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </div>
  );
}

// ── Create Agent Drawer ─────────────────────────────────────────────────────

function CreateAgentDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (apiKey: string) => void;
}) {
  const createMutation = useCreateAgent();
  const [form, setForm] = useState<CreateAgentPayload>({
    codigo: '',
    nome: '',
    owner_user_id: '',
    allowed_scopes: [],
  });
  const [scopeInput, setScopeInput] = useState('');

  const addScope = () => {
    const scope = scopeInput.trim();
    if (!scope || form.allowed_scopes.includes(scope)) return;
    setForm((f) => ({ ...f, allowed_scopes: [...f.allowed_scopes, scope] }));
    setScopeInput('');
  };

  const removeScope = (s: string) => {
    setForm((f) => ({ ...f, allowed_scopes: f.allowed_scopes.filter((x) => x !== s) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createMutation.mutateAsync(form);
    onCreated(result.api_key);
    setForm({ codigo: '', nome: '', owner_user_id: '', allowed_scopes: [] });
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) onClose();
      }}
    >
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Novo Agente MCP</DrawerTitle>
        </DrawerHeader>
        <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="ag-codigo">Codigo</Label>
            <Input
              id="ag-codigo"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              required
              maxLength={50}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ag-nome">Nome</Label>
            <Input
              id="ag-nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ag-owner">Owner (user ID)</Label>
            <Input
              id="ag-owner"
              value={form.owner_user_id}
              onChange={(e) => setForm((f) => ({ ...f, owner_user_id: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Escopos Permitidos</Label>
            <div className="flex gap-2">
              <Input
                value={scopeInput}
                onChange={(e) => setScopeInput(e.target.value)}
                placeholder="dominio:entidade:acao"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addScope();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addScope}>
                +
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.allowed_scopes.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeScope(s)}
                    className="ml-1 text-xs hover:text-destructive"
                  >
                    x
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-a1-text-auxiliary">
              Escopos de aprovacao (approval:decide, approval:override) sao bloqueados pelo backend.
            </p>
          </div>

          {createMutation.error && (
            <p className="text-sm text-danger-600">{(createMutation.error as Error).message}</p>
          )}

          <DrawerFooter className="px-0">
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                !form.codigo ||
                !form.nome ||
                !form.owner_user_id ||
                form.allowed_scopes.length === 0
              }
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Agente'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

// ── Actions Tab ─────────────────────────────────────────────────────────────

function ActionsTab() {
  const [policyFilter, setPolicyFilter] = useState<ExecutionPolicy | undefined>();
  const { data, isLoading, error } = useActionList({ execution_policy: policyFilter });
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={policyFilter ?? ''}
          onChange={(e) =>
            setPolicyFilter((e.target.value || undefined) as ExecutionPolicy | undefined)
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas as politicas</option>
          <option value="DIRECT">DIRECT</option>
          <option value="CONTROLLED">CONTROLLED</option>
          <option value="EVENT_ONLY">EVENT_ONLY</option>
        </select>
        <Button onClick={() => setDrawerOpen(true)}>Nova Acao</Button>
      </div>

      {error && <p className="text-sm text-danger-600">{(error as Error).message}</p>}

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : data && data.data.length > 0 ? (
        <div className="rounded-lg border border-a1-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codigo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Politica</TableHead>
                <TableHead>Objeto Alvo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-mono text-sm">{action.codigo}</TableCell>
                  <TableCell>{action.nome}</TableCell>
                  <TableCell>
                    <Badge variant={POLICY_VARIANT[action.execution_policy]}>
                      {action.execution_policy}
                    </Badge>
                  </TableCell>
                  <TableCell>{action.target_object_type}</TableCell>
                  <TableCell>{action.status}</TableCell>
                  <TableCell>{new Date(action.created_at).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Nenhuma ação cadastrada"
          description="Crie a primeira ação MCP."
          action={
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              Criar Ação
            </Button>
          }
        />
      )}

      <CreateActionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => {
          setDrawerOpen(false);
          toast.success('Acao criada com sucesso.');
        }}
      />
    </div>
  );
}

function CreateActionDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const createMutation = useCreateAction();
  const [form, setForm] = useState<CreateActionPayload>({
    codigo: '',
    nome: '',
    action_type_id: '',
    execution_policy: 'CONTROLLED',
    target_object_type: '',
    required_scopes: [],
  });
  const [scopeInput, setScopeInput] = useState('');

  const addScope = () => {
    const scope = scopeInput.trim();
    if (!scope || form.required_scopes.includes(scope)) return;
    setForm((f) => ({ ...f, required_scopes: [...f.required_scopes, scope] }));
    setScopeInput('');
  };

  const removeScope = (s: string) => {
    setForm((f) => ({ ...f, required_scopes: f.required_scopes.filter((x) => x !== s) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    onCreated();
    setForm({
      codigo: '',
      nome: '',
      action_type_id: '',
      execution_policy: 'CONTROLLED',
      target_object_type: '',
      required_scopes: [],
    });
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) onClose();
      }}
    >
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Nova Acao MCP</DrawerTitle>
        </DrawerHeader>
        <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="act-codigo">Codigo</Label>
            <Input
              id="act-codigo"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              required
              maxLength={50}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="act-nome">Nome</Label>
            <Input
              id="act-nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="act-type">Tipo de Acao (ID)</Label>
            <Input
              id="act-type"
              value={form.action_type_id}
              onChange={(e) => setForm((f) => ({ ...f, action_type_id: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="act-policy">Politica de Execucao</Label>
            <select
              id="act-policy"
              value={form.execution_policy}
              onChange={(e) =>
                setForm((f) => ({ ...f, execution_policy: e.target.value as ExecutionPolicy }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="DIRECT">DIRECT</option>
              <option value="CONTROLLED">CONTROLLED</option>
              <option value="EVENT_ONLY">EVENT_ONLY</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="act-target">Objeto Alvo</Label>
            <Input
              id="act-target"
              value={form.target_object_type}
              onChange={(e) => setForm((f) => ({ ...f, target_object_type: e.target.value }))}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label>Escopos Requeridos</Label>
            <div className="flex gap-2">
              <Input
                value={scopeInput}
                onChange={(e) => setScopeInput(e.target.value)}
                placeholder="dominio:entidade:acao"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addScope();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addScope}>
                +
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.required_scopes.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  {s}
                  <button
                    type="button"
                    onClick={() => removeScope(s)}
                    className="ml-1 text-xs hover:text-destructive"
                  >
                    x
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="act-desc">Descricao</Label>
            <textarea
              id="act-desc"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || undefined }))}
              maxLength={2000}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {createMutation.error && (
            <p className="text-sm text-danger-600">{(createMutation.error as Error).message}</p>
          )}

          <DrawerFooter className="px-0">
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                !form.codigo ||
                !form.nome ||
                !form.action_type_id ||
                !form.target_object_type ||
                form.required_scopes.length === 0
              }
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Acao'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

// ── Permission Matrix Tab ───────────────────────────────────────────────────

function MatrixTab() {
  const { data: agentsData, isLoading: agentsLoading } = useAgentList({});
  const { data: actionsData, isLoading: actionsLoading } = useActionList({});
  const grantMutation = useGrantAgentAction();
  const revokeLinkMutation = useRevokeAgentAction();
  const [links, setLinks] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const agents = agentsData?.data.filter((a) => a.status !== 'REVOKED') ?? [];
  const actions = actionsData?.data ?? [];

  const lk = (agentId: string, actionId: string) => `${agentId}:${actionId}`;

  const toggleLink = async (agentId: string, actionId: string) => {
    const key = lk(agentId, actionId);
    setSavingKey(key);
    try {
      if (links[key]) {
        await revokeLinkMutation.mutateAsync({ agentId, actionId });
        setLinks((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        toast.success('Permissao removida.');
      } else {
        await grantMutation.mutateAsync({ agentId, actionId });
        setLinks((prev) => ({ ...prev, [key]: true }));
        toast.success('Acao concedida ao agente.');
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingKey(null);
    }
  };

  if (agentsLoading || actionsLoading) return <TableSkeleton rows={5} cols={5} />;

  if (agents.length === 0 || actions.length === 0) {
    return (
      <EmptyState
        title="Nenhuma permissão disponível"
        description="Cadastre agentes e ações para gerenciar permissões."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-a1-border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agente \ Acao</TableHead>
            {actions.map((a) => (
              <TableHead key={a.id} className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs">{a.codigo}</span>
                  <Badge variant={POLICY_VARIANT[a.execution_policy]} className="text-[10px]">
                    {a.execution_policy}
                  </Badge>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className="font-mono text-sm">{agent.codigo}</TableCell>
              {actions.map((action) => {
                const key = lk(agent.id, action.id);
                return (
                  <TableCell key={action.id} className="text-center">
                    <input
                      type="checkbox"
                      checked={!!links[key]}
                      disabled={savingKey === key}
                      onChange={() => toggleLink(agent.id, action.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1 bg-a1-border" />
          ))}
        </div>
      ))}
    </div>
  );
}
