/**
 * @contract UX-001-C04, UX-ORG-001 (link-tenant-modal), FR-003, BR-006
 * Modal for linking an ACTIVE tenant (N5) to an N4 org unit.
 * SearchBar with client-side filtering, list of available tenants, link action.
 */

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button.js';
import { SearchBar } from '@shared/ui/search-bar';
import { Skeleton } from '@shared/ui/skeleton.js';
import { useAvailableTenants } from '../hooks/use-available-tenants.js';
import { useLinkTenant } from '../hooks/use-org-unit-actions.js';
import { COPY } from '../types/org-units.types.js';
import { ApiError } from '../../foundation/api/http-client.js';

export interface LinkTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgUnitId: string;
  orgUnitNome: string;
  linkedTenantIds: string[];
  onSuccess: () => void;
}

export function LinkTenantModal({
  open,
  onOpenChange,
  orgUnitId,
  orgUnitNome,
  linkedTenantIds,
  onSuccess,
}: LinkTenantModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { tenants, isLoading } = useAvailableTenants({
    enabled: open,
    linkedTenantIds,
  });
  const linkMutation = useLinkTenant();

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return tenants;
    const lower = searchTerm.toLowerCase();
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(lower) || t.codigo.toLowerCase().includes(lower),
    );
  }, [tenants, searchTerm]);

  const handleLink = useCallback(
    (tenantId: string, tenantCodigo: string) => {
      linkMutation.regenerateKey();
      linkMutation.mutate(
        { orgUnitId, data: { tenant_id: tenantId } },
        {
          onSuccess: () => {
            toast.success(COPY.toast.linkTenantSuccess(tenantCodigo, orgUnitNome));
            onOpenChange(false);
            setSearchTerm('');
            onSuccess();
          },
          onError: (error) => {
            if (error instanceof ApiError && error.status === 409) {
              toast.error(COPY.validation.linkDuplicate);
            } else {
              toast.error(error instanceof Error ? error.message : COPY.error.unexpected);
            }
          },
        },
      );
    },
    [orgUnitId, orgUnitNome, linkMutation, onOpenChange, onSuccess],
  );

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) setSearchTerm('');
      onOpenChange(value);
    },
    [onOpenChange],
  );

  const allLinked = !isLoading && tenants.length === 0;
  const noResults = !isLoading && tenants.length > 0 && filtered.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular Estabelecimento</DialogTitle>
          <DialogDescription>
            Selecione um estabelecimento para vincular a &lsquo;{orgUnitNome}&rsquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nome ou código..."
            className="w-full"
          />
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {isLoading && (
            <div className="space-y-3 py-2">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
          )}

          {allLinked && (
            <p className="py-6 text-center text-sm text-a1-text-hint">
              Todos os estabelecimentos já estão vinculados a esta unidade.
            </p>
          )}

          {noResults && (
            <p className="py-6 text-center text-sm text-a1-text-hint">
              Nenhum estabelecimento encontrado para o termo buscado.
            </p>
          )}

          {!isLoading && filtered.length > 0 && (
            <ul className="list-none space-y-1 p-0">
              {filtered.map((tenant) => (
                <li
                  key={tenant.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-[var(--color-neutral-50)]"
                >
                  <span className="truncate text-sm font-medium text-a1-text-secondary">
                    {tenant.codigo} — {tenant.name}
                  </span>
                  <Button
                    size="sm"
                    className="ml-3 shrink-0"
                    onClick={() => handleLink(tenant.id, tenant.codigo)}
                    disabled={linkMutation.isPending}
                  >
                    Vincular
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
