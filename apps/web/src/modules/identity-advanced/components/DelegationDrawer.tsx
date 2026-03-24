/**
 * @contract UX-001.2, FR-001.3, BR-001.4, BR-001.5, BR-001.8, BR-001.10
 * Drawer for creating a temporary delegation.
 * Prohibited scopes (:approve/:execute/:sign) shown disabled (BR-001.4).
 * Banner about non-re-delegation (BR-001.5).
 */

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  Button,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui';
import { ApiError } from '../../foundation/api/http-client.js';
import { useCreateDelegation } from '../hooks/use-delegations.js';
import {
  partitionDelegatableScopes,
  isValidFutureDate,
  isReasonValid,
  extractFieldErrors,
  COPY,
  type CreateAccessDelegationRequest,
} from '../types/identity-advanced.types.js';

export interface DelegationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableScopes: readonly string[];
  onSuccess: () => void;
}

export function DelegationDrawer({
  open,
  onOpenChange,
  availableScopes,
  onSuccess,
}: DelegationDrawerProps) {
  const [delegateeId, setDelegateeId] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());

  const firstInputRef = useRef<HTMLInputElement>(null);
  const createDelegation = useCreateDelegation();

  const { delegatable, prohibited } = partitionDelegatableScopes(availableScopes);

  const resetForm = useCallback(() => {
    setDelegateeId('');
    setSelectedScopes(new Set());
    setReason('');
    setValidUntil('');
    setFieldErrors(new Map());
    createDelegation.reset();
    createDelegation.regenerateKey();
  }, [createDelegation]);

  useEffect(() => {
    if (open) {
      startTransition(() => resetForm());
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open, resetForm]);

  function toggleScope(scope: string) {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) {
        next.delete(scope);
      } else {
        next.add(scope);
      }
      return next;
    });
  }

  const canSubmit =
    delegateeId.trim() &&
    selectedScopes.size > 0 &&
    isReasonValid(reason) &&
    isValidFutureDate(validUntil) &&
    !createDelegation.isPending;

  function handleSubmit() {
    if (!canSubmit) return;

    const data: CreateAccessDelegationRequest = {
      delegatee_id: delegateeId.trim(),
      delegated_scopes: Array.from(selectedScopes),
      reason: reason.trim(),
      valid_until: validUntil,
    };

    createDelegation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess();
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 422) {
          const problem = error.problem as unknown as Record<string, unknown>;
          const extensions = problem.extensions as Record<string, unknown> | undefined;
          setFieldErrors(extractFieldErrors(extensions));
        }
      },
    });
  }

  function fieldError(field: string): string | undefined {
    return fieldErrors.get(field);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{COPY.label.newDelegation}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4">
          {/* Non-redelegation banner */}
          <div
            className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
            role="alert"
          >
            {COPY.info.noRedelegation}
          </div>

          {/* Delegatee */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delegation-delegatee">Beneficiário (user ID)</Label>
            <Input
              id="delegation-delegatee"
              ref={firstInputRef}
              value={delegateeId}
              onChange={(e) => setDelegateeId(e.target.value)}
              placeholder="UUID do beneficiário"
            />
            {fieldError('delegatee_id') && (
              <p className="text-xs text-destructive">{fieldError('delegatee_id')}</p>
            )}
          </div>

          {/* Scope selection (BR-001.4: prohibited scopes disabled) */}
          <div className="flex flex-col gap-1.5">
            <Label>Escopos a delegar</Label>
            <div className="flex flex-col gap-1 rounded-md border border-border p-3">
              {delegatable.map((scope) => (
                <label key={scope} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedScopes.has(scope)}
                    onChange={() => toggleScope(scope)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span>{scope}</span>
                </label>
              ))}
              {prohibited.map((scope) => (
                <TooltipProvider key={scope}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="flex items-center gap-2 text-sm opacity-50">
                        <input
                          type="checkbox"
                          disabled
                          aria-disabled="true"
                          className="h-4 w-4 rounded border-input"
                        />
                        <span className="line-through">{scope}</span>
                      </label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{COPY.info.prohibitedScopeTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {fieldError('delegated_scopes') && (
              <p className="text-xs text-destructive">{fieldError('delegated_scopes')}</p>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delegation-reason">Motivo</Label>
            <Input
              id="delegation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo da delegação"
            />
            {fieldError('reason') && (
              <p className="text-xs text-destructive">{fieldError('reason')}</p>
            )}
          </div>

          {/* Valid Until (BR-001.10) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delegation-valid-until">Válido Até</Label>
            <Input
              id="delegation-valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            {validUntil && !isValidFutureDate(validUntil) && (
              <p className="text-xs text-destructive">{COPY.validation.futureDate}</p>
            )}
            {fieldError('valid_until') && (
              <p className="text-xs text-destructive">{fieldError('valid_until')}</p>
            )}
          </div>

          {/* API error */}
          {createDelegation.isError && fieldErrors.size === 0 && (
            <p className="text-sm text-destructive">{COPY.error.unexpected}</p>
          )}
        </div>

        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createDelegation.isPending ? 'Criando...' : 'Criar'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">{COPY.modal.cancel}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
