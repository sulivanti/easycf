/**
 * @contract UX-001.1, FR-001.1, UX-IDN-001
 * Admin screen for managing user org scope bindings.
 * Route: /usuarios/:id/escopo-organizacional
 * States: Loading (skeleton), Empty, Error, Data.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Skeleton,
  Spinner,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  Input,
  Label,
} from '@shared/ui';
import { ApiError } from '../../foundation/api/http-client.js';
import { useOrgScopes, useCreateOrgScope, useDeleteOrgScope } from '../hooks/use-org-scopes.js';
import { OrgScopeCard } from '../components/OrgScopeCard.js';
import {
  canReadOrgScopes,
  canWriteOrgScopes,
  isValidFutureDate,
  extractFieldErrors,
  COPY,
  type ScopeType,
  type OrgScopeDTO,
} from '../types/identity-advanced.types.js';

export interface OrgScopeManagementPageProps {
  userId: string;
  userName: string;
  userScopes: readonly string[];
}

export function OrgScopeManagementPage({
  userId,
  userName,
  userScopes,
}: OrgScopeManagementPageProps) {
  const canRead = canReadOrgScopes(userScopes);
  const canWrite = canWriteOrgScopes(userScopes);

  const { data: scopes, isLoading, isError, refetch } = useOrgScopes(userId);
  const createScope = useCreateOrgScope(userId);
  const deleteScope = useDeleteOrgScope(userId);

  // ── Add drawer state ────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [orgUnitId, setOrgUnitId] = useState('');
  const [scopeType, setScopeType] = useState<ScopeType>('SECONDARY');
  const [validUntil, setValidUntil] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());

  // ── Remove dialog state ─────────────────────────────────────
  const [removeTarget, setRemoveTarget] = useState<OrgScopeDTO | null>(null);

  const hasPrimary = scopes?.some((s) => s.scope_type === 'PRIMARY' && s.status === 'ACTIVE');

  const resetAddForm = useCallback(() => {
    setOrgUnitId('');
    setScopeType('SECONDARY');
    setValidUntil('');
    setFieldErrors(new Map());
    createScope.reset();
    createScope.regenerateKey();
  }, [createScope]);

  // ── Permission guard ────────────────────────────────────────
  if (!canRead) {
    toast.warning(COPY.toast.noPermission);
    return null;
  }

  function handleOpenAdd() {
    resetAddForm();
    setAddOpen(true);
  }

  function handleAdd() {
    const data = {
      org_unit_id: orgUnitId.trim(),
      scope_type: scopeType,
      valid_until: validUntil || null,
    };

    createScope.mutate(data, {
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

  function handleRemoveClick(scopeId: string) {
    const scope = scopes?.find((s) => s.id === scopeId);
    if (scope) setRemoveTarget(scope);
  }

  function handleConfirmRemove() {
    if (!removeTarget) return;

    deleteScope.mutate(removeTarget.id, {
      onSuccess: () => {
        toast.success(COPY.toast.orgScopeDeleted);
        setRemoveTarget(null);
      },
      onError: () => {
        toast.error(COPY.error.unexpected);
        setRemoveTarget(null);
      },
    });
  }

  const isPrimary = removeTarget?.scope_type === 'PRIMARY';
  const canSubmitAdd =
    orgUnitId.trim() && (!validUntil || isValidFutureDate(validUntil)) && !createScope.isPending;

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <p className="text-sm text-destructive">{COPY.error.loadScopesFailed}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {COPY.label.retry}
        </Button>
      </div>
    );
  }

  // ── Data ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Escopo Organizacional</h1>
          <p className="text-sm text-muted-foreground">{userName}</p>
        </div>
        {canWrite && <Button onClick={handleOpenAdd}>{COPY.label.addScope}</Button>}
      </div>

      {/* Empty */}
      {scopes && scopes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12">
          <p className="text-sm text-muted-foreground">{COPY.label.emptyScopes}</p>
        </div>
      )}

      {/* Cards */}
      {scopes && scopes.length > 0 && (
        <div className="flex flex-col gap-3">
          {scopes.map((scope) => (
            <OrgScopeCard
              key={scope.id}
              scope={scope}
              canWrite={canWrite}
              onRemove={handleRemoveClick}
            />
          ))}
        </div>
      )}

      {/* Add Drawer */}
      <Drawer open={addOpen} onOpenChange={setAddOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Vincular Área Organizacional</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-org-unit">Nó Organizacional (N1–N4)</Label>
              <Input
                id="add-org-unit"
                value={orgUnitId}
                onChange={(e) => setOrgUnitId(e.target.value)}
                placeholder="UUID do nó organizacional"
              />
              {fieldErrors.get('org_unit_id') && (
                <p className="text-xs text-destructive">{fieldErrors.get('org_unit_id')}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-scope-type">Tipo</Label>
              <div className="flex gap-2">
                <Button
                  variant={scopeType === 'PRIMARY' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScopeType('PRIMARY')}
                  disabled={!!hasPrimary}
                >
                  Principal
                </Button>
                <Button
                  variant={scopeType === 'SECONDARY' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScopeType('SECONDARY')}
                >
                  Adicional
                </Button>
              </div>
              {hasPrimary && scopeType === 'PRIMARY' && (
                <p className="text-xs text-muted-foreground">{COPY.validation.duplicatePrimary}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-valid-until">Válido Até (opcional)</Label>
              <Input
                id="add-valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {validUntil && !isValidFutureDate(validUntil) && (
                <p className="text-xs text-destructive">{COPY.validation.futureDate}</p>
              )}
            </div>

            {createScope.isError && fieldErrors.size === 0 && (
              <p className="text-sm text-destructive">{COPY.error.unexpected}</p>
            )}
          </div>

          <DrawerFooter>
            <Button onClick={handleAdd} disabled={!canSubmitAdd}>
              {createScope.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Vincular
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{COPY.modal.cancel}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isPrimary ? COPY.modal.removePrimaryTitle : COPY.modal.removeSecondaryTitle}
            </DialogTitle>
            <DialogDescription>
              {isPrimary ? COPY.modal.removePrimaryBody : COPY.modal.removeSecondaryBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{COPY.modal.cancel}</Button>
            </DialogClose>
            <Button
              variant={isPrimary ? 'destructive' : 'default'}
              onClick={handleConfirmRemove}
              disabled={deleteScope.isPending}
            >
              {deleteScope.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {isPrimary ? COPY.modal.removePrimaryConfirm : COPY.modal.removeConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
