/**
 * @contract UX-SGR-002, F03
 * Page: Formulário de Alteração de Registro.
 * Route: /{modulo}/{rotina}/{id}/alterar
 *
 * On open: evaluates record with current_record_state.
 * If blocking → shows BlockedRecordMessage.
 * If OK → shows SmartEditForm.
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@shared/ui/skeleton';
import { Button } from '@shared/ui/button';
import type { GridColumn, ValidationItem, RecordMetadata } from '../types/smartgrid.types';
import { COPY } from '../types/smartgrid.types';
import { evaluateSingle, mapResponseToEditColumns } from '../api/smartgrid.api';
import { useSaveChanges } from '../hooks/use-save';
import { BlockedRecordMessage } from '../components/BlockedRecordMessage';
import { SmartEditForm } from '../components/SmartEditForm';
import { MetadataSidebar } from '../components/MetadataSidebar';

type ScreenState = 'loading' | 'blocked' | 'editing' | 'error';

interface RecordEditPageProps {
  readonly framerId: string;
  readonly objectType: string;
  readonly recordId: string;
  readonly recordCode?: string;
  readonly currentRecordState: Record<string, unknown>;
  readonly targetEndpoint: string;
  readonly metadata?: RecordMetadata;
  readonly onNavigateBack: () => void;
}

/** @contract UX-SGR-002 */
export function RecordEditPage({
  framerId,
  objectType,
  recordId,
  recordCode,
  currentRecordState,
  targetEndpoint,
  metadata,
  onNavigateBack,
}: RecordEditPageProps) {
  const saveChangesMutation = useSaveChanges();

  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [columns, setColumns] = useState<GridColumn[]>([]);
  const [blockedFields, setBlockedFields] = useState<Set<string>>(new Set());
  const [blockingReason, setBlockingReason] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationItem[]>([]);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // On mount: evaluate record with current_record_state (F01 amendment)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function evaluateOnOpen() {
      try {
        const res = await evaluateSingle(
          framerId,
          objectType,
          currentRecordState,
          currentRecordState,
        );
        if (cancelled) return;

        // BR-004: if blocking_validations → block form
        if (res.blocking_validations.length > 0) {
          setBlockingReason(res.blocking_validations[0].message);
          setScreenState('blocked');
          return;
        }

        const cols = mapResponseToEditColumns(res);
        setColumns(cols);
        setBlockedFields(new Set(res.hidden_fields));
        setScreenState('editing');
      } catch {
        if (!cancelled) setScreenState('error');
      }
    }

    evaluateOnOpen();
    return () => {
      cancelled = true;
    };
  }, [framerId, objectType, recordId, currentRecordState]);

  /** @contract FR-006 — validate changes */
  const handleValidate = useCallback(
    async (values: Record<string, unknown>) => {
      setValidateLoading(true);
      try {
        const res = await evaluateSingle(framerId, objectType, values, values);
        if (res.blocking_validations.length > 0) {
          setValidationErrors([...res.blocking_validations, ...res.validations]);
          setSaveEnabled(false);
        } else {
          setValidationErrors(res.validations);
          setSaveEnabled(true);
        }
      } catch {
        toast.error(COPY.validateChangesError);
      } finally {
        setValidateLoading(false);
      }
    },
    [framerId, objectType],
  );

  /** @contract FR-006 — save changes */
  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        await saveChangesMutation.mutateAsync({
          targetEndpoint,
          recordId,
          changes: values,
        });
        toast.success(COPY.saveChangesSuccess);
        onNavigateBack();
      } catch {
        toast.error(COPY.saveChangesError);
      }
    },
    [saveChangesMutation, targetEndpoint, recordId, onNavigateBack],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (screenState === 'loading') {
    return (
      <div className="space-y-3 p-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full bg-a1-border" />
        ))}
      </div>
    );
  }

  if (screenState === 'error') {
    return (
      <div role="alert" className="p-8 text-center">
        <p className="text-danger-600">{COPY.evaluateRecordError}</p>
        <Button variant="outline" onClick={onNavigateBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  if (screenState === 'blocked') {
    return <BlockedRecordMessage blockingReason={blockingReason} onNavigateBack={onNavigateBack} />;
  }

  const displayCode = recordCode ?? (currentRecordState['codigo'] as string | undefined) ?? recordId;

  return (
    <div className="bg-[#F5F5F3] p-6">
      {/* TopActions: Voltar à esquerda, Validar à direita */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 border-0 bg-transparent text-[13px] font-semibold text-[#555555] hover:text-[#333333]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <Button
          onClick={() => handleValidate(currentRecordState)}
          disabled={validateLoading}
          className="h-9 rounded-lg bg-[#2E86C1] px-3.5 text-xs font-bold text-white hover:bg-[#2574A9]"
        >
          {validateLoading ? 'Validando...' : 'Validar'}
        </Button>
      </div>

      {/* FormLayout: FormCard (flex:1) + MetadataSidebar (w-72) */}
      <div className="mt-4 flex gap-6">
        <div className="min-w-0 flex-1">
          <SmartEditForm
            columns={columns}
            initialValues={currentRecordState}
            blockedFields={blockedFields}
            validationErrors={validationErrors}
            validateLoading={validateLoading}
            saveLoading={saveChangesMutation.isPending}
            saveEnabled={saveEnabled}
            recordCode={displayCode}
            onValidate={handleValidate}
            onSave={handleSave}
            onCancel={onNavigateBack}
          />
        </div>

        <MetadataSidebar metadata={metadata} />
      </div>
    </div>
  );
}
