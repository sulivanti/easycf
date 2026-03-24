/**
 * @contract UX-APROV-002, FR-001
 * Drawer for creating/editing a control rule.
 * Includes "by value" toggle and allow_self_approve toggle with tooltip.
 * Uses shared Drawer from @shared/ui (vaul).
 */

import { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Label,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui';
import type {
  ControlRule,
  CreateControlRuleRequest,
  UpdateControlRuleRequest,
} from '../types/movement-approval.types.js';

interface ControlRuleDrawerProps {
  open: boolean;
  rule?: ControlRule | null;
  onSave: (data: CreateControlRuleRequest | UpdateControlRuleRequest) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export function ControlRuleDrawer({
  open,
  rule,
  onSave,
  onClose,
  loading,
  error,
}: ControlRuleDrawerProps) {
  const isEditing = !!rule;

  // Derive a stable key so local state resets when the rule prop changes
  const ruleKey = useMemo(() => rule?.id ?? '__new__', [rule]);

  const [operation, setOperation] = useState('');
  const [entityType, setEntityType] = useState('');
  const [description, setDescription] = useState('');
  const [byValue, setByValue] = useState(false);
  const [valueField, setValueField] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [allowSelfApprove, setAllowSelfApprove] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [prevKey, setPrevKey] = useState(ruleKey);

  // Reset form when rule changes (replaces useEffect with setState-during-render pattern)
  if (ruleKey !== prevKey) {
    setPrevKey(ruleKey);
    if (rule) {
      setOperation(rule.operation);
      setEntityType(rule.entity_type);
      setDescription(rule.description ?? '');
      setByValue(rule.by_value);
      setValueField(rule.value_field ?? '');
      setValidFrom(rule.valid_from.slice(0, 10));
      setValidUntil(rule.valid_until?.slice(0, 10) ?? '');
      setAllowSelfApprove(rule.allow_self_approve);
      setIsActive(rule.is_active);
    } else {
      setOperation('');
      setEntityType('');
      setDescription('');
      setByValue(false);
      setValueField('');
      setValidFrom('');
      setValidUntil('');
      setAllowSelfApprove(false);
      setIsActive(true);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateControlRuleRequest & Partial<UpdateControlRuleRequest> = {
      operation,
      entity_type: entityType,
      description: description || undefined,
      by_value: byValue,
      value_field: byValue ? valueField || undefined : undefined,
      valid_from: validFrom,
      valid_until: validUntil || undefined,
      allow_self_approve: allowSelfApprove,
    };
    if (isEditing) {
      (data as UpdateControlRuleRequest).is_active = isActive;
    }
    onSave(data);
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="inset-y-0 right-0 w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? 'Editar Regra' : 'Nova Regra de Controle'}</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>

        <form
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
          onSubmit={handleSubmit}
        >
          {/* Código — read-only in edit */}
          {isEditing && rule && (
            <div className="space-y-1.5">
              <Label>Código</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                      {rule.codigo}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Código é imutável após criação.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cr-operation">Operação</Label>
            <Input
              id="cr-operation"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cr-entity-type">Tipo de Entidade</Label>
            <Input
              id="cr-entity-type"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cr-description">Descrição</Label>
            <textarea
              id="cr-description"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>

          {/* By value toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={byValue}
              onChange={(e) => setByValue(e.target.checked)}
              disabled={loading}
              className="rounded border-input"
            />
            Por valor (threshold)
          </label>

          {byValue && (
            <div className="space-y-1.5">
              <Label htmlFor="cr-value-field">Campo de valor</Label>
              <Input
                id="cr-value-field"
                value={valueField}
                onChange={(e) => setValueField(e.target.value)}
                placeholder="ex: amount"
                disabled={loading}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cr-valid-from">Válido de</Label>
              <Input
                id="cr-valid-from"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-valid-until">Válido até</Label>
              <Input
                id="cr-valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Allow self-approve */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allowSelfApprove}
                    onChange={(e) => setAllowSelfApprove(e.target.checked)}
                    disabled={loading}
                    className="rounded border-input"
                  />
                  Permitir auto-aprovação
                </label>
              </TooltipTrigger>
              <TooltipContent>Desativa a segregação de funções para esta regra.</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isEditing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={loading}
                className="rounded border-input"
              />
              Regra ativa
            </label>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DrawerFooter className="mt-auto px-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} isLoading={loading}>
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
