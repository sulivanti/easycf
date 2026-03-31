/**
 * @contract UX-002, 12-departments-spec, FR-007
 * Página principal de departamentos: tabela + search + toggle inativos + drawer create/edit.
 * Rota: /organizacao/departamentos
 */

import { useState, useCallback } from 'react';
import { useDepartmentsList } from '../hooks/use-departments-list.js';
import { useCreateDepartment } from '../hooks/use-create-department.js';
import { useUpdateDepartment, useDeleteDepartment, useRestoreDepartment } from '../hooks/use-department-actions.js';
import { useDepartmentDetail } from '../hooks/use-department-detail.js';
import { DepartmentDrawer } from '../components/DepartmentDrawer.js';
import { DepartmentTag } from '../components/DepartmentTag.js';
import { DeactivateModal } from '../components/DeactivateModal.js';
import { getStatusBadge, DEPT_COPY } from '../types/departments.types.js';
import type { DepartmentFilters, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/departments.types.js';

// ── Toast stub (uses Foundation toast system) ───────────────
function useToast() {
  return {
    success: (msg: string) => console.log('[toast:success]', msg),
    error: (msg: string) => console.error('[toast:error]', msg),
  };
}

export interface DepartmentsPageProps {
  userScopes: readonly string[];
}

type DrawerState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; departmentId: string };

export function DepartmentsPage({ userScopes }: DepartmentsPageProps) {
  const toast = useToast();

  // ── State ─────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; nome: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Filters ───────────────────────────────────────────────
  const filters: DepartmentFilters = {
    status: showInactive ? 'ALL' : 'ACTIVE',
    search: search || undefined,
  };

  // ── Queries ───────────────────────────────────────────────
  const { data: listData, isLoading, isError, refetch } = useDepartmentsList(filters);
  const editId = drawer.open && drawer.mode === 'edit' ? drawer.departmentId : null;
  const { data: editDepartment } = useDepartmentDetail(editId);

  // ── Mutations ─────────────────────────────────────────────
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();
  const restoreMutation = useRestoreDepartment();

  // ── Handlers ──────────────────────────────────────────────
  const handleCreate = useCallback((data: CreateDepartmentRequest) => {
    setFieldErrors({});
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success(DEPT_COPY.create_success);
        setDrawer({ open: false });
        createMutation.regenerateKey();
      },
      onError: (err: any) => {
        if (err?.status === 409) {
          setFieldErrors({ codigo: DEPT_COPY.conflict_codigo.replace('{codigo}', data.codigo) });
        } else {
          toast.error(DEPT_COPY.error_generic);
        }
      },
    });
  }, [createMutation, toast]);

  const handleUpdate = useCallback((data: UpdateDepartmentRequest) => {
    if (!editId) return;
    setFieldErrors({});
    updateMutation.mutate(
      { id: editId, data },
      {
        onSuccess: () => {
          toast.success(DEPT_COPY.update_success);
          setDrawer({ open: false });
        },
        onError: () => toast.error(DEPT_COPY.error_generic),
      },
    );
  }, [editId, updateMutation, toast]);

  const handleDeactivate = useCallback(() => {
    if (!deactivateTarget) return;
    deleteMutation.mutate(deactivateTarget.id, {
      onSuccess: () => {
        toast.success(DEPT_COPY.delete_success);
        setDeactivateTarget(null);
      },
      onError: () => toast.error(DEPT_COPY.error_generic),
    });
  }, [deactivateTarget, deleteMutation, toast]);

  const handleRestore = useCallback((id: string) => {
    restoreMutation.mutate(id, {
      onSuccess: () => toast.success(DEPT_COPY.restore_success),
      onError: (err: any) => {
        if (err?.status === 422) {
          toast.error('Departamento já está ativo.');
        } else {
          toast.error(DEPT_COPY.error_generic);
        }
      },
    });
  }, [restoreMutation, toast]);

  // ── Permissions ───────────────────────────────────────────
  const canWrite = userScopes.includes('org:dept:write');
  const canDelete = userScopes.includes('org:dept:delete');

  const items = listData?.data ?? [];

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111]">Departamentos</h1>
          <p className="mt-1 text-[13px] text-[#888]">Gerencie os departamentos do seu tenant</p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => { setFieldErrors({}); setDrawer({ open: true, mode: 'create' }); }}
            className="h-10 rounded-lg bg-[#2E86C1] px-5 text-[13px] font-bold text-white hover:bg-[#2574A9]"
          >
            + Novo Departamento
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex items-center justify-between">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CCC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="h-10 w-80 rounded-lg border border-[#E8E8E6] bg-white pl-10 pr-3.5 text-[13px] text-[#111] placeholder:text-[#CCC] focus:outline-none focus:ring-1 focus:ring-[#2E86C1]"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <div
            className={`relative h-5 w-9 rounded-full transition-colors ${showInactive ? 'bg-[#2E86C1]' : 'bg-[#E8E8E6]'}`}
            onClick={() => setShowInactive(!showInactive)}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${showInactive ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </div>
          <span className="text-xs font-medium text-[#555]">Mostrar inativos</span>
        </label>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-[#E8E8E6] bg-white">
        {isLoading ? (
          /* Skeleton */
          <div className="p-5 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-3.5 w-20 animate-pulse rounded bg-[#E8E8E6]" />
                <div className="h-3.5 w-40 animate-pulse rounded bg-[#E8E8E6]" />
                <div className="h-4 w-4 animate-pulse rounded-full bg-[#E8E8E6]" />
                <div className="h-5 w-12 animate-pulse rounded bg-[#E8E8E6]" />
                <div className="h-3.5 w-20 animate-pulse rounded bg-[#E8E8E6]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="flex flex-col items-center p-10">
            <p className="text-sm font-medium text-[#888]">Não foi possível carregar os departamentos.</p>
            <button type="button" onClick={() => refetch()} className="mt-3 text-[13px] font-semibold text-[#555] border border-[#E8E8E6] rounded-lg px-4 h-10 hover:bg-[#F8F8F6]">
              Tentar novamente
            </button>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center p-16">
            <p className="text-base font-semibold text-[#888]">
              {search ? DEPT_COPY.empty_search.replace('{search}', search) : DEPT_COPY.empty_state}
            </p>
            {search ? (
              <button type="button" onClick={() => setSearch('')} className="mt-1 text-[13px] font-semibold text-[#2E86C1]">
                Limpar filtros
              </button>
            ) : canWrite ? (
              <button
                type="button"
                onClick={() => setDrawer({ open: true, mode: 'create' })}
                className="mt-3 h-10 rounded-lg bg-[#2E86C1] px-5 text-[13px] font-bold text-white"
              >
                Criar primeiro departamento
              </button>
            ) : null}
          </div>
        ) : (
          /* Table with data */
          <table className="w-full">
            <thead>
              <tr className="h-11 border-b border-[#F0F0EE] bg-[#FAFAFA]">
                <th className="px-5 text-left text-[10px] font-bold uppercase tracking-wider text-[#888]">Código</th>
                <th className="px-5 text-left text-[10px] font-bold uppercase tracking-wider text-[#888]">Nome</th>
                <th className="px-5 text-left text-[10px] font-bold uppercase tracking-wider text-[#888]">Cor</th>
                <th className="px-5 text-left text-[10px] font-bold uppercase tracking-wider text-[#888]">Status</th>
                <th className="px-5 text-left text-[10px] font-bold uppercase tracking-wider text-[#888]">Criado em</th>
                <th className="px-5 text-center text-[10px] font-bold uppercase tracking-wider text-[#888]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((dept) => {
                const badge = getStatusBadge(dept.status as 'ACTIVE' | 'INACTIVE');
                return (
                  <tr key={dept.id} className="h-[52px] border-b border-[#F0F0EE] hover:bg-[#F8F8F6]">
                    <td className="px-5 text-[13px] font-semibold text-[#333]">{dept.codigo}</td>
                    <td className="px-5 text-[13px] font-medium text-[#111]">{dept.nome}</td>
                    <td className="px-5">
                      {dept.cor ? (
                        <div className="flex items-center gap-1.5">
                          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: dept.cor }} />
                          <span className="text-[11px] text-[#888]">{dept.cor}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#CCC]">—</span>
                      )}
                    </td>
                    <td className="px-5">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${badge.color} ${badge.bg} border ${badge.border}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 text-xs text-[#888]">
                      {new Date(dept.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5">
                      <div className="flex items-center justify-center gap-2">
                        {canWrite && dept.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => { setFieldErrors({}); setDrawer({ open: true, mode: 'edit', departmentId: dept.id }); }}
                            className="text-[#888] hover:text-[#2E86C1]"
                            aria-label="Editar"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        {canDelete && dept.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => setDeactivateTarget({ id: dept.id, nome: dept.nome })}
                            className="text-[#888] hover:text-[#E74C3C]"
                            aria-label="Desativar"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        {canWrite && dept.status === 'INACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleRestore(dept.id)}
                            className="text-[#888] hover:text-[#27AE60]"
                            aria-label="Restaurar"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {listData?.has_more && (
          <div className="flex justify-center border-t border-[#F0F0EE] py-3">
            <button type="button" className="text-[13px] font-semibold text-[#2E86C1] hover:underline">
              Carregar mais
            </button>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawer.open && (
        <DepartmentDrawer
          mode={drawer.mode}
          department={drawer.mode === 'edit' ? editDepartment ?? null : null}
          onClose={() => setDrawer({ open: false })}
          onSubmitCreate={handleCreate}
          onSubmitUpdate={handleUpdate}
          isLoading={createMutation.isPending || updateMutation.isPending}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Deactivate Modal */}
      {deactivateTarget && (
        <DeactivateModal
          nome={deactivateTarget.nome}
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivateTarget(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
