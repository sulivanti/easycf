/**
 * @contract UX-MCP-001, FR-001..FR-006, BR-004, BR-005, BR-006, UX-010-M01
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
import { KeyRound, RotateCw, Ban, PencilIcon } from 'lucide-react';
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
  SearchBar,
} from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { EmptyState } from '@shared/ui/empty-state';
import { StatusBadge } from '@shared/ui/status-badge';
import { Select } from '@shared/ui/select';
import {
  useAgentList,
  useCreateAgent,
  useUpdateAgent,
  useRevokeAgent,
  useRotateKey,
} from '../../hooks/use-agents.js';
import { useActionList, useCreateAction } from '../../hooks/use-actions.js';
import { useGrantAgentAction, useRevokeAgentAction } from '../../hooks/use-agents.js';
import { ApiKeyModal } from '../../components/ApiKeyModal.js';
import { RevokeModal } from '../../components/RevokeModal.js';
import type {
  McpAgent,
  McpAction,
  AgentStatus,
  CreateAgentPayload,
  UpdateAgentPayload,
  CreateActionPayload,
  ExecutionPolicy,
} from '../../types/mcp-automation.types.js';

type Tab = 'agents' | 'actions' | 'matrix';

const TAB_LABELS: Record<Tab, string> = {
  agents: 'Agentes',
  actions: 'Catálogo de Ações',
  matrix: 'Permissões',
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  REVOKED: 'Revogado',
};

const POLICY_LABEL: Record<ExecutionPolicy, string> = {
  DIRECT: 'Direct',
  CONTROLLED: 'Controlled',
  EVENT_ONLY: 'Event Only',
};

export function AgentsPage() {
  const [tab, setTab] = useState<Tab>('agents');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="-m-6">
      {/* D1 — PageHeader com título simplificado e botão no lado direito */}
      <PageHeader
        title="MCP Agentes"
        description="Gerencie agentes de automação, ações e permissões"
        actions={
          tab === 'agents' ? (
            <Button onClick={() => setDrawerOpen(true)}>+ Criar Agente</Button>
          ) : tab === 'actions' ? (
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              + Nova Ação
            </Button>
          ) : undefined
        }
      />

      {/* D1 — Tab bar abaixo do header */}
      <div className="border-b-2 border-a1-border bg-white px-6">
        <nav className="flex gap-1" aria-label="Abas de navegação">
          {(['agents', 'actions', 'matrix'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-t-md px-4 py-2 font-display text-[13px] font-medium transition-colors ${
                tab === t
                  ? 'bg-primary-600 text-white'
                  : 'text-a1-text-auxiliary hover:bg-a1-bg hover:text-a1-text-primary'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {tab === 'agents' && <AgentsTab drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />}
        {tab === 'actions' && <ActionsTab drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />}
        {tab === 'matrix' && <MatrixTab />}
      </div>
    </div>
  );
}

// ── Agents Tab ──────────────────────────────────────────────────────────────

function AgentsTab({
  drawerOpen,
  setDrawerOpen,
}: {
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<AgentStatus | undefined>();
  // D2 — Search query state
  const [searchQuery, setSearchQuery] = useState('');
  // TODO: wire owner filter to useAgentList when hook supports it
  const [ownerFilter, setOwnerFilter] = useState('');
  const { data, isLoading, error } = useAgentList({ status: statusFilter });
  const [apiKeyModal, setApiKeyModal] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<McpAgent | null>(null);
  const [editTarget, setEditTarget] = useState<McpAgent | null>(null);

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

  // D2 — Client-side search filtering
  const filteredAgents = data?.data.filter((agent) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return agent.codigo.toLowerCase().includes(q) || agent.nome.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* D2 — Toolbar: SearchBar + filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nome ou código..."
          className="w-80"
        />
        <Select
          value={statusFilter ?? ''}
          onChange={(e) =>
            setStatusFilter((e.target.value || undefined) as AgentStatus | undefined)
          }
          placeholder="Todos os status"
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'ACTIVE', label: 'Ativo' },
            { value: 'INACTIVE', label: 'Inativo' },
            { value: 'REVOKED', label: 'Revogado' },
          ]}
        />
        {/* TODO: popular com lista de owners da API quando disponível */}
        <Input
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          placeholder="Filtrar por owner..."
          className="w-48"
        />
      </div>

      {error && <p className="text-sm text-danger-600">{(error as Error).message}</p>}

      {/* D3 — AgentsTable */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredAgents && filteredAgents.length > 0 ? (
        <div className="rounded-lg border border-a1-border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                  Código
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                  Nome
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                  Tipo
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
                  API Key
                </TableHead>
                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => {
                const isRevoked = agent.status === 'REVOKED';
                return (
                  <TableRow key={agent.id} className={isRevoked ? 'opacity-50' : ''}>
                    <TableCell className="font-mono text-sm">{agent.codigo}</TableCell>
                    <TableCell>{agent.nome}</TableCell>
                    {/* D3 — TIPO badge: phase2 = "Phase 2", senão "Padrão" */}
                    <TableCell>
                      <Badge variant={agent.phase2_create_enabled ? 'default' : 'outline'}>
                        {agent.phase2_create_enabled ? 'Phase 2' : 'Padrão'}
                      </Badge>
                    </TableCell>
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
                    {/* D3 — API KEY hint monospace */}
                    <TableCell className="font-mono text-xs text-a1-text-auxiliary">
                      {/* TODO: exibir api_key_hint quando campo estiver disponível na API */}
                      ••••••••
                    </TableCell>
                    {/* D3 — Action icons */}
                    <TableCell className="text-right">
                      {!isRevoked && (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Editar agente"
                            onClick={() => setEditTarget(agent)}
                            className="rounded p-1.5 text-a1-text-auxiliary hover:bg-a1-bg hover:text-a1-text-primary"
                          >
                            <PencilIcon className="size-4" />
                          </button>
                          <button
                            type="button"
                            title="Rodar chave"
                            onClick={() => handleRotateKey(agent)}
                            disabled={rotateMutation.isPending}
                            className="rounded p-1.5 text-a1-text-auxiliary hover:bg-a1-bg hover:text-a1-text-primary disabled:opacity-50"
                          >
                            {rotateMutation.isPending ? (
                              <Spinner className="size-4" />
                            ) : (
                              <RotateCw className="size-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            title="Revogar agente"
                            onClick={() => setRevokeTarget(agent)}
                            className="rounded p-1.5 text-a1-text-auxiliary hover:bg-red-50 hover:text-destructive"
                          >
                            <Ban className="size-4" />
                          </button>
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

      {/* D6 — CreateAgentDrawer */}
      <CreateAgentDrawer
        open={drawerOpen && !editTarget}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
      />

      {/* D6 — EditAgentDrawer */}
      {editTarget && (
        <EditAgentDrawer
          agent={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={() => {
            setEditTarget(null);
            toast.success('Agente atualizado com sucesso.');
          }}
        />
      )}

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
      {/* D6 — Drawer 480px width */}
      <DrawerContent className="sm:max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Novo Agente MCP</DrawerTitle>
        </DrawerHeader>
        <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
          {/* D6 — Labels uppercase 10px com letter-spacing */}
          <div className="space-y-1">
            <Label
              htmlFor="ag-codigo"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Código
            </Label>
            <Input
              id="ag-codigo"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              required
              maxLength={50}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ag-nome" className="text-[10px] font-semibold uppercase tracking-wider">
              Nome
            </Label>
            <Input
              id="ag-nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="ag-owner"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Owner (user ID)
            </Label>
            <Input
              id="ag-owner"
              value={form.owner_user_id}
              onChange={(e) => setForm((f) => ({ ...f, owner_user_id: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-wider">
              Escopos Permitidos
            </Label>
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
            {/* D6 — Scope chips blue */}
            <div className="flex flex-wrap gap-1">
              {form.allowed_scopes.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 bg-primary-50 text-primary-700">
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
              Escopos de aprovação (approval:decide, approval:override) são bloqueados pelo backend.
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

// ── Edit Agent Drawer (D6 — edit mode) ──────────────────────────────────────

function EditAgentDrawer({
  agent,
  onClose,
  onUpdated,
}: {
  agent: McpAgent;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const updateMutation = useUpdateAgent();
  const [form, setForm] = useState<UpdateAgentPayload>({
    nome: agent.nome,
    allowed_scopes: [...agent.allowed_scopes],
    status: agent.status === 'REVOKED' ? undefined : (agent.status as 'ACTIVE' | 'INACTIVE'),
  });
  const [scopeInput, setScopeInput] = useState('');

  const addScope = () => {
    const scope = scopeInput.trim();
    if (!scope || (form.allowed_scopes ?? []).includes(scope)) return;
    setForm((f) => ({ ...f, allowed_scopes: [...(f.allowed_scopes ?? []), scope] }));
    setScopeInput('');
  };

  const removeScope = (s: string) => {
    setForm((f) => ({
      ...f,
      allowed_scopes: (f.allowed_scopes ?? []).filter((x) => x !== s),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({ id: agent.id, body: form });
    onUpdated();
  };

  return (
    <Drawer
      open
      onOpenChange={(v: boolean) => {
        if (!v) onClose();
      }}
    >
      <DrawerContent className="sm:max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Editar Agente — {agent.codigo}</DrawerTitle>
        </DrawerHeader>
        <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label
              htmlFor="edit-nome"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Nome
            </Label>
            <Input
              id="edit-nome"
              value={form.nome ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="edit-status"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Status
            </Label>
            <Select
              id="edit-status"
              value={form.status ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: (e.target.value || undefined) as 'ACTIVE' | 'INACTIVE' | undefined,
                }))
              }
              options={[
                { value: 'ACTIVE', label: 'Ativo' },
                { value: 'INACTIVE', label: 'Inativo' },
              ]}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-wider">
              Escopos Permitidos
            </Label>
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
              {(form.allowed_scopes ?? []).map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 bg-primary-50 text-primary-700">
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

          {updateMutation.error && (
            <p className="text-sm text-danger-600">{(updateMutation.error as Error).message}</p>
          )}

          <DrawerFooter className="px-0">
            <Button type="submit" disabled={updateMutation.isPending || !form.nome}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
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

function ActionsTab({
  drawerOpen,
  setDrawerOpen,
}: {
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
}) {
  const [policyFilter, setPolicyFilter] = useState<ExecutionPolicy | undefined>();
  const { data, isLoading, error } = useActionList({ execution_policy: policyFilter });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={policyFilter ?? ''}
          onChange={(e) =>
            setPolicyFilter((e.target.value || undefined) as ExecutionPolicy | undefined)
          }
          placeholder="Todas as políticas"
          options={[
            { value: '', label: 'Todas as políticas' },
            { value: 'DIRECT', label: 'DIRECT' },
            { value: 'CONTROLLED', label: 'CONTROLLED' },
            { value: 'EVENT_ONLY', label: 'EVENT_ONLY' },
          ]}
        />
      </div>

      {error && <p className="text-sm text-danger-600">{(error as Error).message}</p>}

      {/* D4 — Card grid instead of table */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl bg-a1-border" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
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
          toast.success('Ação criada com sucesso.');
        }}
      />
    </div>
  );
}

// ── D4 — ActionCard ─────────────────────────────────────────────────────────

function ActionCard({ action }: { action: McpAction }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-a1-border bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-a1-text-auxiliary">{action.codigo}</span>
        <StatusBadge
          status={
            action.execution_policy === 'DIRECT'
              ? 'success'
              : action.execution_policy === 'CONTROLLED'
                ? 'warning'
                : 'neutral'
          }
          className="text-[10px]"
        >
          {POLICY_LABEL[action.execution_policy]}
        </StatusBadge>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-a1-text-primary">{action.nome}</h4>
        {action.description && (
          <p className="mt-1 line-clamp-2 text-xs text-a1-text-auxiliary">{action.description}</p>
        )}
      </div>
      {action.required_scopes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {action.required_scopes.map((scope) => (
            <span
              key={scope}
              className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700"
            >
              {scope}
            </span>
          ))}
        </div>
      )}
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
      <DrawerContent className="sm:max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Nova Ação MCP</DrawerTitle>
        </DrawerHeader>
        <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label
              htmlFor="act-codigo"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Código
            </Label>
            <Input
              id="act-codigo"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              required
              maxLength={50}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="act-nome"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Nome
            </Label>
            <Input
              id="act-nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="act-type"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Tipo de Ação (ID)
            </Label>
            <Input
              id="act-type"
              value={form.action_type_id}
              onChange={(e) => setForm((f) => ({ ...f, action_type_id: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="act-policy"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Política de Execução
            </Label>
            <Select
              id="act-policy"
              value={form.execution_policy}
              onChange={(e) =>
                setForm((f) => ({ ...f, execution_policy: e.target.value as ExecutionPolicy }))
              }
              options={[
                { value: 'DIRECT', label: 'DIRECT' },
                { value: 'CONTROLLED', label: 'CONTROLLED' },
                { value: 'EVENT_ONLY', label: 'EVENT_ONLY' },
              ]}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="act-target"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Objeto Alvo
            </Label>
            <Input
              id="act-target"
              value={form.target_object_type}
              onChange={(e) => setForm((f) => ({ ...f, target_object_type: e.target.value }))}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-wider">
              Escopos Requeridos
            </Label>
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
                <Badge key={s} variant="secondary" className="gap-1 bg-primary-50 text-primary-700">
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
            <Label
              htmlFor="act-desc"
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              Descrição
            </Label>
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
              {createMutation.isPending ? 'Criando...' : 'Criar Ação'}
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

// ── D5 — Permission Matrix Tab ──────────────────────────────────────────────

function MatrixTab() {
  const { data: agentsData, isLoading: agentsLoading } = useAgentList({});
  const { data: actionsData, isLoading: actionsLoading } = useActionList({});
  const grantMutation = useGrantAgentAction();
  const revokeLinkMutation = useRevokeAgentAction();
  const [links, setLinks] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // D5 — Include all agents, REVOKED with opacity and disabled
  const agents = agentsData?.data ?? [];
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
        toast.success('Permissão removida.');
      } else {
        await grantMutation.mutateAsync({ agentId, actionId });
        setLinks((prev) => ({ ...prev, [key]: true }));
        toast.success('Ação concedida ao agente.');
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
            <TableHead className="text-[10px] font-semibold uppercase tracking-wider">
              Agente \ Ação
            </TableHead>
            {actions.map((a) => (
              <TableHead key={a.id} className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {a.codigo}
                  </span>
                  <StatusBadge
                    status={
                      a.execution_policy === 'DIRECT'
                        ? 'success'
                        : a.execution_policy === 'CONTROLLED'
                          ? 'warning'
                          : 'neutral'
                    }
                    className="text-[10px]"
                  >
                    {a.execution_policy}
                  </StatusBadge>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => {
            const isRevoked = agent.status === 'REVOKED';
            return (
              <TableRow key={agent.id} className={isRevoked ? 'opacity-40' : ''}>
                {/* D5 — "CODE — Name" format */}
                <TableCell className="font-mono text-sm">
                  {agent.codigo} — <span className="font-sans">{agent.nome}</span>
                </TableCell>
                {actions.map((action) => {
                  const key = lk(agent.id, action.id);
                  return (
                    <TableCell key={action.id} className="text-center">
                      {/* D5 — Styled checkboxes: checked blue, unchecked border gray */}
                      <input
                        type="checkbox"
                        checked={!!links[key]}
                        disabled={isRevoked || savingKey === key}
                        onChange={() => toggleLink(agent.id, action.id)}
                        className="size-4 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
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
