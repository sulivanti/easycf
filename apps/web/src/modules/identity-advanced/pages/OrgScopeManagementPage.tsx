/**
 * @contract UX-001-M01 D1, FR-001-M01 D4, UX-IDN-001
 * Admin screen for managing org scope bindings.
 * Route: /organizacao/identidade/escopos
 * Layout: tabela full-width com search, filtros, avatar+nome, ScopePills.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Spinner,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  Input,
  Label,
  PageHeader,
} from '@shared/ui';
import { Search } from 'lucide-react';
import { ApiError } from '../../foundation/api/http-client.js';
import { useOrgScopesGrouped } from '../hooks/use-org-scopes-grouped.js';
import { useCreateOrgScope } from '../hooks/use-org-scopes.js';
import { OrgScopeTable } from '../components/OrgScopeTable.js';
import { RevokeModal } from '../components/RevokeModal.js';
import {
  canReadOrgScopes,
  canWriteOrgScopes,
  isValidFutureDate,
  extractFieldErrors,
  COPY,
  type ScopeType,
  type OrgScopesGroupedFilters,
} from '../types/identity-advanced.types.js';

export interface OrgScopeManagementPageProps {
  userScopes: readonly string[];
}

export function OrgScopeManagementPage({ userScopes }: OrgScopeManagementPageProps) {
  const canRead = canReadOrgScopes(userScopes);
  const canWrite = canWriteOrgScopes(userScopes);

  // ── Filters ───────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'PRIMARY' | 'SECONDARY' | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'INACTIVE' | 'EXPIRED' | undefined>(undefined);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const filters: OrgScopesGroupedFilters = {
    q: search || undefined,
    scope_type: filterType,
    status: filterStatus,
    cursor,
    limit: 20,
  };

  const { data, isLoading, isError, refetch } = useOrgScopesGrouped(filters);
  const createScope = useCreateOrgScope('');

  // ── Add drawer state ────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [orgUnitId, setOrgUnitId] = useState('');
  const [scopeType, setScopeType] = useState<ScopeType>('SECONDARY');
  const [validUntil, setValidUntil] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());
  const [targetUserId, setTargetUserId] = useState('');

  // ── Revoke state ──────────────────────────────────────────
  const [revokeTarget, setRevokeTarget] = useState<{
    userId: string;
    scopeId: string;
    type: 'primary' | 'secondary';
    name: string;
  } | null>(null);

  const resetAddForm = useCallback(() => {
    setOrgUnitId('');
    setScopeType('SECONDARY');
    setValidUntil('');
    setFieldErrors(new Map());
    setTargetUserId('');
    createScope.reset();
    createScope.regenerateKey();
  }, [createScope]);

  // ── Permission guard ──────────────────────────────────────
  if (!canRead) {
    toast.warning(COPY.toast.noPermission);
    return null;
  }

  function handleOpenAdd() {
    resetAddForm();
    setAddOpen(true);
  }

  function handleAdd() {
    const requestData = {
      org_unit_id: orgUnitId.trim(),
      scope_type: scopeType,
      valid_until: validUntil || null,
    };

    createScope.mutate(requestData, {
      onSuccess: () => {
        setAddOpen(false);
        toast.success(COPY.toast.orgScopeCreated);
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.status === 409) {
            toast.warning(COPY.validation.duplicatePrimaryApi);
          } else if (error.status === 422) {
            const problem = error.problem as unknown as Record<string, unknown>;
            const extensions = problem.extensions as Record<string, unknown> | undefined;
            setFieldErrors(extractFieldErrors(extensions));
          } else if (error.status === 403) {
            toast.warning(COPY.toast.noPermission);
          } else {
            toast.error(COPY.error.unexpected);
          }
        }
      },
    });
  }

  function handleLoadMore() {
    if (data?.next_cursor) {
      setCursor(data.next_cursor);
    }
  }

  const canSubmitAdd =
    orgUnitId.trim() && targetUserId.trim() &&
    (!validUntil || isValidFutureDate(validUntil)) &&
    !createScope.isPending;

  // ── Error ─────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <p className="text-sm text-[#888888]">Não foi possível carregar os dados.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <PageHeader
        title="Escopo Organizacional"
        description="Gerencie os vínculos de escopo organizacional dos usuários"
        actions={
          canWrite ? (
            <Button
              onClick={handleOpenAdd}
              className="h-10 rounded-lg bg-[#2E86C1] px-5 text-[13px] font-bold text-white hover:bg-[#256FA0]"
            >
              + Atribuir Escopo
            </Button>
          ) : undefined
        }
      />

      {/* ToolBar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CCCCCC]" />
          <Input
            className="h-10 w-80 rounded-lg border-[#E8E8E6] pl-10 text-sm"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(undefined);
            }}
          />
        </div>
        <div className="flex gap-3">
          <select
            className="h-9 rounded-md border border-[#E8E8E6] bg-white px-3 text-sm text-[#555555]"
            value={filterType ?? ''}
            onChange={(e) => {
              setFilterType((e.target.value || undefined) as typeof filterType);
              setCursor(undefined);
            }}
          >
            <option value="">Todos os Tipos</option>
            <option value="PRIMARY">PRIMARY</option>
            <option value="SECONDARY">SECONDARY</option>
          </select>
          <select
            className="h-9 rounded-md border border-[#E8E8E6] bg-white px-3 text-sm text-[#555555]"
            value={filterStatus ?? ''}
            onChange={(e) => {
              setFilterStatus((e.target.value || undefined) as typeof filterStatus);
              setCursor(undefined);
            }}
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Ativos</option>
            <option value="EXPIRED">Expirados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <OrgScopeTable
        data={data?.data ?? []}
        isLoading={isLoading}
        isEmpty={!isLoading && (data?.data.length ?? 0) === 0}
        hasMore={data?.has_more ?? false}
        canWrite={canWrite}
        onLoadMore={handleLoadMore}
        onEdit={(userId) => {
          setTargetUserId(userId);
          handleOpenAdd();
        }}
        onRevoke={(userId, scopeId) => {
          const item = data?.data.find((d) => d.user.id === userId);
          if (item) {
            const isPrimary = item.primary_scope?.id === scopeId;
            setRevokeTarget({
              userId,
              scopeId,
              type: isPrimary ? 'primary' : 'secondary',
              name: item.user.name,
            });
          }
        }}
        onAddScope={handleOpenAdd}
      />

      {/* Add Drawer */}
      <Drawer open={addOpen} onOpenChange={setAddOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Atribuir Escopo Organizacional</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Usuário
              </Label>
              <Input
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="h-[42px] rounded-lg border-[#E8E8E6]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Tipo de Escopo
              </Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={scopeType === 'PRIMARY'}
                    onChange={() => setScopeType('PRIMARY')}
                    className="h-4 w-4 accent-[#2E86C1]"
                  />
                  <span className="text-sm">Principal (PRIMARY)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={scopeType === 'SECONDARY'}
                    onChange={() => setScopeType('SECONDARY')}
                    className="h-4 w-4 accent-[#2E86C1]"
                  />
                  <span className="text-sm">Secundário (SECONDARY)</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Área Organizacional
              </Label>
              <Input
                value={orgUnitId}
                onChange={(e) => setOrgUnitId(e.target.value)}
                placeholder="UUID do nó organizacional"
                className="h-[42px] rounded-lg border-[#E8E8E6]"
              />
              {fieldErrors.get('org_unit_id') && (
                <p className="text-[11px] font-medium text-[#E74C3C]">
                  {fieldErrors.get('org_unit_id')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Válido até (opcional)
              </Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-[42px] rounded-lg border-[#E8E8E6]"
              />
              {validUntil && !isValidFutureDate(validUntil) && (
                <p className="text-[11px] font-medium text-[#E74C3C]">
                  {COPY.validation.futureDate}
                </p>
              )}
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={handleAdd}
              disabled={!canSubmitAdd}
              className="bg-[#2E86C1] hover:bg-[#256FA0]"
            >
              {createScope.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Vincular
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Revoke Modal */}
      <RevokeModal
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        variant={revokeTarget?.type ?? 'secondary'}
        targetName={revokeTarget?.name}
        onConfirm={() => {
          if (revokeTarget) {
            toast.success(COPY.toast.orgScopeDeleted);
            setRevokeTarget(null);
          }
        }}
      />
    </div>
  );
}
