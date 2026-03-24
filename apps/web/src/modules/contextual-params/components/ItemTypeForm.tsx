/**
 * @contract UX-007 §4, FR-006
 * Adaptive form for routine items — 7 variants based on item_type.
 * Each variant shows different fields per the spec.
 */

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { Button, Input, Label, Badge } from '@shared/ui';
import type {
  ItemType,
  ItemAction,
  CreateRoutineItemRequest,
  UpdateRoutineItemRequest,
  TargetFieldResponseDTO,
} from '../types/contextual-params.types.js';

export interface ItemTypeFormProps {
  initialValues?: {
    item_type: ItemType;
    action: ItemAction;
    target_field_id: string | null;
    value: unknown;
    condition_expr?: string | null;
    validation_message: string | null;
    is_blocking: boolean;
    ordem: number;
  };
  targetFields: TargetFieldResponseDTO[];
  nextOrdem: number;
  readonly: boolean;
  onSave: (data: CreateRoutineItemRequest | UpdateRoutineItemRequest) => void;
  autoSaveMs?: number;
}

const TYPE_ACTIONS: Record<ItemType, ItemAction[]> = {
  FIELD_VISIBILITY: ['SHOW', 'HIDE'],
  REQUIRED: ['SET_REQUIRED', 'SET_OPTIONAL'],
  DEFAULT: ['SET_DEFAULT'],
  DOMAIN: ['RESTRICT_DOMAIN'],
  DERIVATION: ['SET_DEFAULT'],
  VALIDATION: ['VALIDATE'],
  EVIDENCE: ['REQUIRE_EVIDENCE'],
};

const ITEM_TYPE_OPTIONS: ItemType[] = [
  'FIELD_VISIBILITY',
  'REQUIRED',
  'DEFAULT',
  'DOMAIN',
  'DERIVATION',
  'VALIDATION',
  'EVIDENCE',
];

const TYPE_LABELS: Record<ItemType, string> = {
  FIELD_VISIBILITY: 'Visibilidade de campo',
  REQUIRED: 'Obrigatoriedade',
  DEFAULT: 'Valor padrao',
  DOMAIN: 'Restricao de dominio',
  DERIVATION: 'Derivacao',
  VALIDATION: 'Validacao',
  EVIDENCE: 'Evidencia',
};

export function ItemTypeForm({
  initialValues,
  targetFields,
  nextOrdem,
  readonly,
  onSave,
  autoSaveMs = 0,
}: ItemTypeFormProps) {
  const [itemType, setItemType] = useState<ItemType>(
    initialValues?.item_type ?? 'FIELD_VISIBILITY',
  );
  const [action, setAction] = useState<ItemAction>(initialValues?.action ?? 'SHOW');
  const [targetFieldId, setTargetFieldId] = useState<string>(initialValues?.target_field_id ?? '');
  const [value, setValue] = useState<string>(
    initialValues?.value != null ? JSON.stringify(initialValues.value) : '',
  );
  const [conditionExpr, setConditionExpr] = useState(initialValues?.condition_expr ?? '');
  const [validationMessage, setValidationMessage] = useState(
    initialValues?.validation_message ?? '',
  );
  const [isBlocking, setIsBlocking] = useState(initialValues?.is_blocking ?? false);
  const [showCondition, setShowCondition] = useState(!!initialValues?.condition_expr);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditMode = !!initialValues;

  useEffect(() => {
    const allowed = TYPE_ACTIONS[itemType];
    if (!allowed.includes(action)) {
      startTransition(() => setAction(allowed[0]));
    }
  }, [itemType, action]);

  const buildData = useCallback((): CreateRoutineItemRequest | UpdateRoutineItemRequest => {
    const base = {
      item_type: itemType,
      action,
      target_field_id: targetFieldId || undefined,
      condition_expr: conditionExpr || undefined,
      is_blocking: isBlocking,
    };

    if (isEditMode) {
      return {
        ...base,
        value: value ? JSON.parse(value) : undefined,
        validation_message: validationMessage || undefined,
        ordem: initialValues!.ordem,
      } satisfies UpdateRoutineItemRequest;
    }

    return {
      ...base,
      value: value ? JSON.parse(value) : undefined,
      validation_message: validationMessage || undefined,
      ordem: nextOrdem,
    } satisfies CreateRoutineItemRequest;
  }, [
    itemType,
    action,
    targetFieldId,
    value,
    conditionExpr,
    validationMessage,
    isBlocking,
    isEditMode,
    initialValues,
    nextOrdem,
  ]);

  useEffect(() => {
    if (!autoSaveMs || !isEditMode || readonly) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(buildData());
    }, autoSaveMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    itemType,
    action,
    targetFieldId,
    value,
    conditionExpr,
    validationMessage,
    isBlocking,
    autoSaveMs,
    isEditMode,
    readonly,
    buildData,
    onSave,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;
    onSave(buildData());
  };

  const needsTargetField = itemType !== 'EVIDENCE';
  const needsValue = itemType === 'DEFAULT' || itemType === 'DERIVATION';
  const needsDomain = itemType === 'DOMAIN';
  const needsValidation = itemType === 'VALIDATION';
  const needsBlocking = itemType === 'VALIDATION' || itemType === 'EVIDENCE';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Item Type */}
      <div className="space-y-1.5">
        <Label htmlFor="item-type" className="font-semibold">
          Tipo de item
        </Label>
        <select
          id="item-type"
          value={itemType}
          onChange={(e) => setItemType(e.target.value as ItemType)}
          disabled={readonly}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {ITEM_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Action */}
      <div className="space-y-1.5">
        <Label htmlFor="item-action">Acao</Label>
        <select
          id="item-action"
          value={action}
          onChange={(e) => setAction(e.target.value as ItemAction)}
          disabled={readonly}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {TYPE_ACTIONS[itemType].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Target Field */}
      {needsTargetField && (
        <div className="space-y-1.5">
          <Label htmlFor="target-field">Campo-alvo</Label>
          <select
            id="target-field"
            value={targetFieldId}
            onChange={(e) => setTargetFieldId(e.target.value)}
            disabled={readonly}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Selecione campo...</option>
            {targetFields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.field_label ?? f.field_key} ({f.field_type}){f.is_system ? ' [Sistema]' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Value (DEFAULT / DERIVATION) */}
      {needsValue && (
        <div className="space-y-1.5">
          <Label htmlFor="item-value">
            {itemType === 'DERIVATION' ? 'Expressao de derivacao' : 'Valor padrao'}
          </Label>
          {itemType === 'DERIVATION' ? (
            <textarea
              id="item-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={readonly}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
            />
          ) : (
            <Input
              id="item-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={readonly}
            />
          )}
        </div>
      )}

      {/* Domain (chips) */}
      {needsDomain && (
        <div className="space-y-1.5">
          <Label htmlFor="domain-values">Valores permitidos (separados por virgula)</Label>
          <Input
            id="domain-values"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={readonly}
            placeholder="valor1, valor2, valor3"
          />
        </div>
      )}

      {/* Validation fields */}
      {needsValidation && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="validation-rule">Regra de validacao</Label>
            <textarea
              id="validation-rule"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={readonly}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="validation-message">Mensagem de erro</Label>
            <Input
              id="validation-message"
              value={validationMessage}
              onChange={(e) => setValidationMessage(e.target.value)}
              disabled={readonly}
            />
          </div>
        </>
      )}

      {/* Evidence type */}
      {itemType === 'EVIDENCE' && (
        <div className="space-y-1.5">
          <Label htmlFor="evidence-type">Tipo de evidencia</Label>
          <select
            id="evidence-type"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            disabled={readonly}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            <option value="DOCUMENT">Documento</option>
            <option value="PHOTO">Foto</option>
            <option value="SIGNATURE">Assinatura</option>
            <option value="ATTACHMENT">Anexo</option>
          </select>
        </div>
      )}

      {/* is_blocking toggle */}
      {needsBlocking && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isBlocking}
            onChange={(e) => setIsBlocking(e.target.checked)}
            disabled={readonly}
            className="rounded border-input"
          />
          <span className="text-sm">Bloqueante</span>
          {isBlocking && (
            <Badge variant="destructive" className="text-xs">
              Bloqueante
            </Badge>
          )}
        </label>
      )}

      {/* Condition expression (collapsible, all types) */}
      <div>
        <button
          type="button"
          onClick={() => setShowCondition(!showCondition)}
          className="text-sm text-primary hover:underline"
        >
          {showCondition ? '- Ocultar condicao' : '+ Condicao (v2)'}
        </button>
        {showCondition && (
          <textarea
            value={conditionExpr}
            onChange={(e) => setConditionExpr(e.target.value)}
            disabled={readonly}
            placeholder="Expressao condicional (preparado para v2)"
            rows={2}
            className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
          />
        )}
      </div>

      {/* Submit (only for non-auto-save / create mode) */}
      {(!autoSaveMs || !isEditMode) && !readonly && (
        <Button type="submit" className="self-start">
          {isEditMode ? 'Salvar' : 'Adicionar item'}
        </Button>
      )}
    </form>
  );
}
