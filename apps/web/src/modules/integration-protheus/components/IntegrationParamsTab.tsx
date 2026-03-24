/**
 * @contract UX-008 §2.3 Aba 3, FR-004, BR-005
 *
 * Params tab: list with sensitive masking, adaptive form by type.
 */

import { useState } from 'react';
import {
  Button,
  Badge,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/ui';
import { useIntegrationParams, useCreateParam, useUpdateParam } from '../hooks/use-params.js';
import { canWriteRoutine } from '../types/permissions.js';
import { COPY, PARAM_TYPE_BADGE } from '../types/view-model.js';
import type { ParamType, CreateParamRequest } from '../types/integration-protheus.types.js';

const PARAM_TYPES: ParamType[] = ['FIXED', 'DERIVED_FROM_TENANT', 'DERIVED_FROM_CONTEXT', 'HEADER'];

interface IntegrationParamsTabProps {
  routineId: string;
  readonly: boolean;
  userScopes: readonly string[];
}

export function IntegrationParamsTab({
  routineId,
  readonly: isReadonly,
  userScopes,
}: IntegrationParamsTabProps) {
  const paramsQuery = useIntegrationParams(routineId);
  const createMut = useCreateParam();
  const _updateMut = useUpdateParam();

  const params = paramsQuery.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [paramKey, setParamKey] = useState('');
  const [paramType, setParamType] = useState<ParamType>('FIXED');
  const [paramValue, setParamValue] = useState('');
  const [derivationExpr, setDerivationExpr] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);

  function resetForm() {
    setParamKey('');
    setParamType('FIXED');
    setParamValue('');
    setDerivationExpr('');
    setIsSensitive(false);
    setShowForm(false);
  }

  function handleCreate() {
    const data: CreateParamRequest = {
      param_key: paramKey,
      param_type: paramType,
      value: paramType === 'FIXED' ? paramValue || null : null,
      derivation_expr: paramType !== 'FIXED' ? derivationExpr || null : null,
      is_sensitive: isSensitive,
    };
    createMut.mutate({ routineId, data }, { onSuccess: () => resetForm() });
  }

  if (params.length === 0 && !showForm) {
    return (
      <div className="space-y-4">
        <p className="py-8 text-center text-sm text-muted-foreground">{COPY.empty_params}</p>
        {!isReadonly && canWriteRoutine(userScopes) && (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            + Adicionar parâmetro
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {params.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-md border border-input px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">{p.param_key}</span>
              <Badge className={PARAM_TYPE_BADGE[p.param_type]}>{p.param_type}</Badge>
            </div>
            <div className="flex items-center gap-3">
              {p.is_sensitive ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-muted-foreground">••••••</span>
                    </TooltipTrigger>
                    <TooltipContent>{COPY.sensitive_tooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-sm">{p.value ?? p.derivation_expr ?? '—'}</span>
              )}
              {!isReadonly && canWriteRoutine(userScopes) && (
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Editar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="space-y-3 rounded-md border border-input p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Chave</Label>
              <Input value={paramKey} onChange={(e) => setParamKey(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <select
                value={paramType}
                onChange={(e) => setParamType(e.target.value as ParamType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {PARAM_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            {paramType === 'FIXED' ? (
              <div className="space-y-1.5">
                <Label>Valor</Label>
                <Input value={paramValue} onChange={(e) => setParamValue(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Expressão de derivação</Label>
                <Input
                  value={derivationExpr}
                  onChange={(e) => setDerivationExpr(e.target.value)}
                  placeholder="tenant.codigo"
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="rounded border-input"
            />
            Sensível (valor nunca será logado)
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createMut.isPending || !paramKey}>
              Adicionar
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {!isReadonly && canWriteRoutine(userScopes) && !showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          + Adicionar parâmetro
        </Button>
      )}
    </div>
  );
}
