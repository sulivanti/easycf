/**
 * @contract UX-001.2, FR-001.2, BR-001.7, BR-001.8, BR-001.9, BR-001.10
 * Drawer for creating a controlled access share.
 * Validates auto-authorization (BR-001.7), reason (BR-001.9), and valid_until (BR-001.10).
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
  Badge,
} from '@shared/ui';
import { ApiError } from '../../foundation/api/http-client.js';
import { useCreateAccessShare } from '../hooks/use-access-shares.js';
import {
  isAutoAuthBlocked,
  canSelfAuthorize,
  isValidFutureDate,
  isReasonValid,
  extractFieldErrors,
  COPY,
  type CreateAccessShareRequest,
} from '../types/identity-advanced.types.js';

export interface ShareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userScopes: readonly string[];
  currentUserId: string;
  onSuccess: () => void;
}

export function ShareDrawer({
  open,
  onOpenChange,
  userScopes,
  currentUserId,
  onSuccess,
}: ShareDrawerProps) {
  const [granteeId, setGranteeId] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [allowedActions, setAllowedActions] = useState('');
  const [reason, setReason] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());

  const firstInputRef = useRef<HTMLInputElement>(null);
  const createShare = useCreateAccessShare();

  const canAutoAuth = canSelfAuthorize(userScopes);
  const isAutoAuth = authorizedBy === currentUserId;
  const autoAuthBlocked = isAutoAuthBlocked(currentUserId, authorizedBy, userScopes);

  const resetForm = useCallback(() => {
    setGranteeId('');
    setResourceType('');
    setResourceId('');
    setAllowedActions('');
    setReason('');
    setAuthorizedBy('');
    setValidUntil('');
    setFieldErrors(new Map());
    createShare.reset();
    createShare.regenerateKey();
  }, [createShare]);

  useEffect(() => {
    if (open) {
      startTransition(() => resetForm());
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open, resetForm]);

  const canSubmit =
    granteeId.trim() &&
    resourceType.trim() &&
    resourceId.trim() &&
    allowedActions.trim() &&
    isReasonValid(reason) &&
    authorizedBy.trim() &&
    isValidFutureDate(validUntil) &&
    !autoAuthBlocked &&
    !createShare.isPending;

  function handleSubmit() {
    if (!canSubmit) return;

    const data: CreateAccessShareRequest = {
      grantee_id: granteeId.trim(),
      resource_type: resourceType.trim(),
      resource_id: resourceId.trim(),
      allowed_actions: allowedActions
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      reason: reason.trim(),
      authorized_by: authorizedBy.trim(),
      valid_until: validUntil,
    };

    createShare.mutate(data, {
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
          <DrawerTitle>{COPY.label.newShare}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4">
          {/* Grantee */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-grantee">Beneficiário (user ID)</Label>
            <Input
              id="share-grantee"
              ref={firstInputRef}
              value={granteeId}
              onChange={(e) => setGranteeId(e.target.value)}
              placeholder="UUID do beneficiário"
            />
            {fieldError('grantee_id') && (
              <p className="text-xs text-destructive">{fieldError('grantee_id')}</p>
            )}
          </div>

          {/* Resource Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-resource-type">Tipo de Recurso</Label>
            <Input
              id="share-resource-type"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              placeholder="Ex: process, document"
            />
          </div>

          {/* Resource ID */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-resource-id">ID do Recurso</Label>
            <Input
              id="share-resource-id"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="UUID do recurso"
            />
          </div>

          {/* Allowed Actions */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-actions">Ações Permitidas</Label>
            <Input
              id="share-actions"
              value={allowedActions}
              onChange={(e) => setAllowedActions(e.target.value)}
              placeholder="read, write (separar por vírgula)"
            />
          </div>

          {/* Reason (BR-001.9) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-reason">Motivo</Label>
            <Input
              id="share-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo do compartilhamento"
            />
            {fieldError('reason') && (
              <p className="text-xs text-destructive">{fieldError('reason')}</p>
            )}
          </div>

          {/* Authorized By (BR-001.7) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-authorized-by">Autorizador (user ID)</Label>
            <Input
              id="share-authorized-by"
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              placeholder="UUID do autorizador"
            />
            {isAutoAuth && canAutoAuth && (
              <Badge variant="default" className="w-fit">
                {COPY.info.selfAuthAllowed}
              </Badge>
            )}
            {autoAuthBlocked && (
              <p className="text-xs text-destructive">{COPY.validation.autoAuthBlocked}</p>
            )}
            {fieldError('authorized_by') && (
              <p className="text-xs text-destructive">{fieldError('authorized_by')}</p>
            )}
          </div>

          {/* Valid Until (BR-001.10) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="share-valid-until">Válido Até</Label>
            <Input
              id="share-valid-until"
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
          {createShare.isError && fieldErrors.size === 0 && (
            <p className="text-sm text-destructive">{COPY.error.unexpected}</p>
          )}
        </div>

        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createShare.isPending ? 'Criando...' : 'Criar'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">{COPY.modal.cancel}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
