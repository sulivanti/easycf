/**
 * @contract UX-008 §2.3 Aba 1, FR-002, FR-006, BR-012
 *
 * Config HTTP tab: service select, method, endpoint template, retry, trigger events.
 * PROD warning banner. Test HML button with confirmation dialog.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Spinner,
} from '@shared/ui';
import { useConfigureRoutine } from '../hooks/use-routines.js';
import { useExecuteIntegration } from '../hooks/use-call-logs.js';
import { canWriteRoutine, canShowTestHml } from '../types/permissions.js';
import { COPY, ENVIRONMENT_BADGE } from '../types/view-model.js';
import type {
  ServiceListItemDTO,
  ConfigureRoutineRequest,
  HttpMethod,
  Environment,
} from '../types/integration-protheus.types.js';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const TRIGGER_EVENT_OPTIONS = [
  'case.stage_transitioned',
  'case.opened',
  'case.completed',
  'case.cancelled',
] as const;

interface HttpConfigTabProps {
  routineId: string;
  services: ServiceListItemDTO[];
  readonly: boolean;
  userScopes: readonly string[];
  initialConfig?: Partial<ConfigureRoutineRequest> & { service_environment?: Environment };
}

export function HttpConfigTab({
  routineId,
  services,
  readonly: isReadonly,
  userScopes,
  initialConfig,
}: HttpConfigTabProps) {
  const [serviceId, setServiceId] = useState(initialConfig?.service_id ?? '');
  const [httpMethod, setHttpMethod] = useState<HttpMethod>(initialConfig?.http_method ?? 'POST');
  const [endpointTpl, setEndpointTpl] = useState(initialConfig?.endpoint_tpl ?? '');
  const [retryMax, setRetryMax] = useState(initialConfig?.retry_max ?? 3);
  const [retryBackoff, setRetryBackoff] = useState(initialConfig?.retry_backoff_ms ?? 1000);
  const [triggerEvents, setTriggerEvents] = useState<string[]>(initialConfig?.trigger_events ?? []);
  const [showTestDialog, setShowTestDialog] = useState(false);

  const configureMut = useConfigureRoutine();
  const executeMut = useExecuteIntegration();

  const selectedService = services.find((s) => s.id === serviceId);
  const isProd = selectedService?.environment === 'PROD';
  const hasHmlService = services.some((s) => s.environment === 'HML' && s.status === 'ACTIVE');

  function handleSave() {
    const data: ConfigureRoutineRequest = {
      service_id: serviceId,
      http_method: httpMethod,
      endpoint_tpl: endpointTpl,
      retry_max: retryMax,
      retry_backoff_ms: retryBackoff,
      trigger_events: triggerEvents,
    };
    configureMut.mutate(
      { routineId, data },
      { onSuccess: () => toast.success(COPY.success_save_config) },
    );
  }

  function handleTestHml() {
    setShowTestDialog(false);
    executeMut.mutate(
      { routine_id: routineId },
      { onSuccess: () => toast.success(COPY.success_test_queued) },
    );
  }

  function toggleTrigger(event: string) {
    setTriggerEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  return (
    <div className="space-y-6">
      {/* PROD warning banner */}
      {isProd && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {COPY.prod_warning}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Service select */}
        <div className="space-y-1.5">
          <Label>Serviço de destino</Label>
          <select
            disabled={isReadonly}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Selecione...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo} — {s.nome} ({s.environment})
              </option>
            ))}
          </select>
          {selectedService && (
            <Badge className={ENVIRONMENT_BADGE[selectedService.environment]}>
              {selectedService.environment}
            </Badge>
          )}
        </div>

        {/* HTTP method */}
        <div className="space-y-1.5">
          <Label>Método HTTP</Label>
          <select
            disabled={isReadonly}
            value={httpMethod}
            onChange={(e) => setHttpMethod(e.target.value as HttpMethod)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          >
            {HTTP_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Endpoint template */}
        <div className="col-span-2 space-y-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label>Endpoint template</Label>
              </TooltipTrigger>
              <TooltipContent>{COPY.endpoint_preview_tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            disabled={isReadonly}
            value={endpointTpl}
            onChange={(e) => setEndpointTpl(e.target.value)}
            placeholder="/WSRESTPV001/PedidoVenda"
          />
          {endpointTpl && (
            <p className="text-xs text-muted-foreground">
              Preview: {endpointTpl.replace(/\{[^}]+\}/g, '[resolvido em runtime]')}
            </p>
          )}
        </div>

        {/* Retry max */}
        <div className="space-y-1.5">
          <Label>Retry máx.</Label>
          <Input
            disabled={isReadonly}
            type="number"
            min={0}
            max={10}
            value={retryMax}
            onChange={(e) => setRetryMax(Number(e.target.value))}
          />
        </div>

        {/* Retry backoff */}
        <div className="space-y-1.5">
          <Label>Retry backoff (ms)</Label>
          <Input
            disabled={isReadonly}
            type="number"
            min={100}
            max={60000}
            value={retryBackoff}
            onChange={(e) => setRetryBackoff(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Dobra a cada tentativa</p>
        </div>

        {/* Trigger events */}
        <div className="col-span-2 space-y-1.5">
          <Label>Disparar quando</Label>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_EVENT_OPTIONS.map((evt) => (
              <button
                key={evt}
                type="button"
                disabled={isReadonly}
                onClick={() => toggleTrigger(evt)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  triggerEvents.includes(evt)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-input bg-background text-muted-foreground hover:bg-accent'
                } disabled:opacity-50`}
              >
                {evt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        {!isReadonly && canWriteRoutine(userScopes) && (
          <Button onClick={handleSave} disabled={configureMut.isPending || !serviceId}>
            {configureMut.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {configureMut.isPending ? 'Salvando...' : 'Salvar config.'}
          </Button>
        )}

        {canShowTestHml(userScopes, hasHmlService) ? (
          <Button
            variant="outline"
            onClick={() => setShowTestDialog(true)}
            disabled={executeMut.isPending}
          >
            {executeMut.isPending ? 'Testando...' : 'Testar agora (HML)'}
          </Button>
        ) : (
          !hasHmlService && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" disabled>
                    Testar agora (HML)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{COPY.error_no_hml_service}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        )}
      </div>

      {/* Test HML confirmation dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar integração (HML)</DialogTitle>
            <DialogDescription>{COPY.confirm_test_hml}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleTestHml}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
