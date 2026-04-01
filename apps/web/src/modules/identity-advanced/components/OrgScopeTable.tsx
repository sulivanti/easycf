/**
 * @contract UX-001-M01 D1, UX-IDN-001, FR-001-M01 D4
 * Tabela full-width de usuários com escopos organizacionais.
 * Avatar + nome + email, ScopePills, status badges, ações.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Skeleton,
  EmptyState,
} from '@shared/ui';
import { Pencil, XCircle } from 'lucide-react';
import { ScopePill } from './ScopePill.js';
import type { OrgScopeGroupedItemDTO } from '../types/identity-advanced.types.js';
import { getInitials, getStatusBadge, COPY } from '../types/identity-advanced.types.js';

export interface OrgScopeTableProps {
  data: readonly OrgScopeGroupedItemDTO[];
  isLoading: boolean;
  isEmpty: boolean;
  hasMore: boolean;
  canWrite: boolean;
  onLoadMore: () => void;
  onEdit: (userId: string) => void;
  onRevoke: (userId: string, scopeId: string) => void;
  onAddScope: () => void;
}

export function OrgScopeTable({
  data,
  isLoading,
  isEmpty,
  hasMore,
  canWrite,
  onLoadMore,
  onEdit,
  onRevoke,
  onAddScope,
}: OrgScopeTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E8E8E6] bg-white overflow-hidden">
        <div className="h-11 bg-[#FAFAFA] border-b border-[#F0F0EE]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-[#F0F0EE]">
            <Skeleton className="h-8 w-8 rounded-full bg-[#E8E8E6]" />
            <Skeleton className="h-3.5 w-28 rounded bg-[#E8E8E6]" />
            <Skeleton className="h-5 w-24 rounded bg-[#E8E8E6]" />
            <Skeleton className="h-5 w-40 rounded bg-[#E8E8E6]" />
            <Skeleton className="h-5 w-12 rounded bg-[#E8E8E6]" />
            <Skeleton className="h-3.5 w-12 rounded bg-[#E8E8E6]" />
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title="Nenhum escopo atribuído."
        description="Clique em Atribuir Escopo para vincular áreas organizacionais."
        actions={
          canWrite ? (
            <Button onClick={onAddScope} className="mt-4 bg-[#2E86C1] hover:bg-[#256FA0]">
              + Atribuir Escopo
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-[#E8E8E6] bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="h-11 bg-[#FAFAFA] border-b border-[#F0F0EE]">
            <TableHead className="w-[220px] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Usuário
            </TableHead>
            <TableHead className="w-[200px] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Escopo Principal
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Escopos Adicionais
            </TableHead>
            <TableHead className="w-[100px] text-[10px] font-bold uppercase tracking-wider text-[#888888]">
              Status
            </TableHead>
            {canWrite && (
              <TableHead className="w-[80px] text-center text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                Ações
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const initials = getInitials(item.user.name);
            const visibleSecondary = item.secondary_scopes.slice(0, 2);
            const overflow =
              item.total_scopes - (item.primary_scope ? 1 : 0) - visibleSecondary.length;

            return (
              <TableRow
                key={item.user.id}
                className="h-14 border-b border-[#F0F0EE] hover:bg-[#F8F8F6]"
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E86C1] text-[11px] font-bold text-white">
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-[#111111]">
                        {item.user.name}
                      </span>
                      <span className="text-xs text-[#888888]">{item.user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {item.primary_scope && (
                    <ScopePill name={item.primary_scope.org_unit.nome} type="PRIMARY" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleSecondary.map((s) => (
                      <ScopePill key={s.id} name={s.org_unit.nome} type="SECONDARY" />
                    ))}
                    {overflow > 0 && <ScopePill name="" overflow={overflow} />}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase text-[#1E7A42] bg-[#E8F8EF]">
                    {item.primary_scope?.status ?? 'ATIVO'}
                  </span>
                </TableCell>
                {canWrite && (
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item.user.id)}
                        className="text-[#888888] hover:text-[#2E86C1]"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const scopeId = item.primary_scope?.id ?? item.secondary_scopes[0]?.id;
                          if (scopeId) onRevoke(item.user.id, scopeId);
                        }}
                        className="text-[#888888] hover:text-[#E74C3C]"
                        aria-label="Revogar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {hasMore && (
        <div className="flex justify-center border-t border-[#F0F0EE] py-3">
          <button
            type="button"
            onClick={onLoadMore}
            className="text-[13px] font-semibold text-[#2E86C1] hover:underline"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}
