/**
 * @contract UX-008 §2, FR-010, SEC-008
 *
 * UX-INTEG-001: Editor de Rotinas de Integração.
 * Split-view: list + 3-tab editor (Config HTTP, Mapeamentos, Parâmetros).
 * Route: /integracoes/rotinas
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Skeleton,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui';
import { PageHeader } from '@shared/ui/page-header';
import { StatusBadge } from '@shared/ui/status-badge';
import { EmptyState } from '@shared/ui/empty-state';
import {
  useIntegrationRoutines,
  usePublishRoutine,
  useForkRoutine,
} from '../hooks/use-routines.js';
import { useServicesList } from '../hooks/use-services.js';
import { canWriteRoutine, canShowFork, isRoutineEditable } from '../types/permissions.js';
import { COPY } from '../types/view-model.js';
import { HttpConfigTab } from '../components/HttpConfigTab.js';
import { FieldMappingsTab } from '../components/FieldMappingsTab.js';
import { IntegrationParamsTab } from '../components/IntegrationParamsTab.js';
import type {
  IntegrationRoutineListItemDTO,
  RoutineStatus,
  Environment,
} from '../types/integration-protheus.types.js';

type EditorTab = 'http' | 'mappings' | 'params';

const TAB_LABELS: Record<EditorTab, string> = {
  http: 'Config. HTTP',
  mappings: 'Mapeamentos',
  params: 'Parâmetros',
};

const ROUTINE_STATUS_MAP: Record<RoutineStatus, 'success' | 'warning' | 'neutral'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  DEPRECATED: 'neutral',
};

const ENV_STATUS_MAP: Record<Environment, 'error' | 'warning' | 'neutral'> = {
  PROD: 'error',
  HML: 'warning',
  DEV: 'neutral',
};

export interface RoutineEditorPageProps {
  userScopes: readonly string[];
}

export function RoutineEditorPage({ userScopes }: RoutineEditorPageProps) {
  const routinesQuery = useIntegrationRoutines();
  const servicesQuery = useServicesList();
  const publishMut = usePublishRoutine();
  const forkMut = useForkRoutine();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<RoutineStatus>('DRAFT');
  const [activeTab, setActiveTab] = useState<EditorTab>('http');
  const [showForkDialog, setShowForkDialog] = useState(false);
  const [forkReason, setForkReason] = useState('');

  const routines = routinesQuery.data?.data ?? [];
  const services = servicesQuery.data?.data ?? [];
  const readonly = !isRoutineEditable(selectedStatus);

  function selectRoutine(r: IntegrationRoutineListItemDTO) {
    setSelectedId(r.routine_id);
    setSelectedStatus(r.status);
    setActiveTab('http');
  }

  function handlePublish() {
    if (!selectedId) return;
    publishMut.mutate(selectedId, {
      onSuccess: () => {
        toast.success(COPY.success_publish);
        setSelectedStatus('PUBLISHED');
      },
    });
  }

  function handleFork() {
    if (!selectedId || forkReason.trim().length < 10) return;
    forkMut.mutate(
      { routineId: selectedId, changeReason: forkReason.trim() },
      {
        onSuccess: (res) => {
          toast.success(COPY.success_fork(res.version));
          setShowForkDialog(false);
          setForkReason('');
          setSelectedStatus('DRAFT');
        },
      },
    );
  }

  return (
    <div className="flex h-full">
      {/* Left: Routines list */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-border p-4">
        <PageHeader title="Rotinas de Integração" />

        {routinesQuery.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded bg-a1-border" />
            ))}
          </div>
        )}

        {!routinesQuery.isLoading && routines.length === 0 && (
          <EmptyState title={COPY.empty_routines} />
        )}

        <div className="space-y-1">
          {routines.map((r) => (
            <button
              key={r.routine_id}
              type="button"
              onClick={() => selectRoutine(r)}
              className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                selectedId === r.routine_id ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.nome}</span>
                <StatusBadge status={ROUTINE_STATUS_MAP[r.status]}>{r.status}</StatusBadge>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-a1-text-auxiliary">
                <span>v{r.version}</span>
                {r.service_name && (
                  <>
                    <span>·</span>
                    <span>{r.service_name}</span>
                    {r.service_environment && (
                      <StatusBadge status={ENV_STATUS_MAP[r.service_environment]} className="text-[10px]">
                        {r.service_environment}
                      </StatusBadge>
                    )}
                  </>
                )}
                <span>·</span>
                <span>{r.mappings_count} mapeamentos</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedId ? (
          <EmptyState
            title="Selecione uma rotina para editar."
            className="mt-20"
          />
        ) : (
          <>
            {/* Readonly banner */}
            {readonly && (
              <div className="mb-4 flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span>{COPY.readonly_banner}</span>
                <div className="flex gap-2">
                  {canShowFork(userScopes, selectedStatus) && (
                    <Button size="sm" variant="outline" onClick={() => setShowForkDialog(true)}>
                      Nova versão
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Publish button for DRAFT */}
            {!readonly && canWriteRoutine(userScopes) && (
              <div className="mb-4 flex justify-end">
                <Button size="sm" onClick={handlePublish} disabled={publishMut.isPending}>
                  {publishMut.isPending ? 'Publicando...' : 'Publicar rotina'}
                </Button>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-5 flex border-b border-border">
              {(Object.keys(TAB_LABELS) as EditorTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-5 py-2.5 text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 font-semibold text-blue-600'
                      : 'border-transparent text-a1-text-auxiliary hover:text-foreground'
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'http' && (
              <HttpConfigTab
                routineId={selectedId}
                services={services}
                readonly={readonly}
                userScopes={userScopes}
              />
            )}
            {activeTab === 'mappings' && (
              <FieldMappingsTab
                routineId={selectedId}
                readonly={readonly}
                userScopes={userScopes}
              />
            )}
            {activeTab === 'params' && (
              <IntegrationParamsTab
                routineId={selectedId}
                readonly={readonly}
                userScopes={userScopes}
              />
            )}
          </>
        )}
      </div>

      {/* Fork dialog */}
      <Dialog open={showForkDialog} onOpenChange={setShowForkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{COPY.confirm_fork_title}</DialogTitle>
            <DialogDescription>{COPY.confirm_fork_body}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Motivo da mudança (mín. 10 caracteres)</Label>
            <Input
              value={forkReason}
              onChange={(e) => setForkReason(e.target.value)}
              placeholder="Descreva o motivo..."
            />
            {forkReason.trim().length > 0 && forkReason.trim().length < 10 && (
              <p className="text-xs text-red-600">{COPY.error_reason_too_short}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForkDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleFork}
              disabled={forkMut.isPending || forkReason.trim().length < 10}
            >
              {forkMut.isPending ? 'Criando...' : 'Criar nova versão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
