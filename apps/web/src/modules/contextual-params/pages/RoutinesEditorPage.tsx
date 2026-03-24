/**
 * @contract UX-ROTINA-001, FR-005, FR-006, FR-007, FR-008, FR-009, DOC-UX-010
 * Page: Cadastro e Editor de Rotinas de Comportamento
 * Route: /parametrizacao/rotinas
 *
 * States: loading, empty_list, loaded, readonly, error.
 * Split-view: list (left) + editor (right). Drag-and-drop items (DRAFT).
 * Auto-save 600ms. Publish/Fork modals. Dry-run preview drawer.
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Badge,
  Skeleton,
  Input,
  Label,
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
} from '@shared/ui';
import {
  useRoutinesList,
  useRoutineDetail,
  useCreateRoutine,
  usePublishRoutine,
  useForkRoutine,
} from '../hooks/use-routines.js';
import {
  useCreateRoutineItem,
  useUpdateRoutineItem,
  useDeleteRoutineItem,
} from '../hooks/use-routine-items.js';
import { useTargetObjects, useTargetFields } from '../hooks/use-target-objects.js';
import { useEvaluateEngine } from '../hooks/use-evaluate.js';
import type {
  CreateRoutineItemRequest,
  UpdateRoutineItemRequest,
  RoutineListFilters,
  ItemType,
  ItemAction,
} from '../types/contextual-params.types.js';
import {
  canWriteRoutines,
  canPublishRoutine,
  canForkRoutine,
  canEvaluateEngine,
} from '../types/permissions.js';
import { COPY, routineStatusClass, itemTypeBadgeClass } from '../types/view-model.js';
import { ItemTypeForm } from '../components/ItemTypeForm.js';
import { DryRunPreview } from '../components/DryRunPreview.js';

type ModalType = 'publish' | 'fork' | null;

export interface RoutinesEditorPageProps {
  userScopes: readonly string[];
}

export function RoutinesEditorPage({ userScopes }: RoutinesEditorPageProps) {
  const [routineFilters, setRoutineFilters] = useState<RoutineListFilters>({});
  const routinesQuery = useRoutinesList(routineFilters);
  const targetObjectsQuery = useTargetObjects();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailQuery = useRoutineDetail(selectedId);

  const createRoutineMut = useCreateRoutine();
  const publishMut = usePublishRoutine();
  const forkMut = useForkRoutine();
  const createItemMut = useCreateRoutineItem();
  const updateItemMut = useUpdateRoutineItem();
  const deleteItemMut = useDeleteRoutineItem();
  const evaluateMut = useEvaluateEngine();

  const firstObjectId = (targetObjectsQuery.data?.data ?? [])[0]?.id ?? null;
  const targetFieldsQuery = useTargetFields(firstObjectId);

  const [statusFilter, setStatusFilter] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [forkReason, setForkReason] = useState('');
  const [autoDeprecate, setAutoDeprecate] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCodigo, setNewCodigo] = useState('');
  const [newNome, setNewNome] = useState('');

  const canWrite = canWriteRoutines(userScopes);
  const detail = detailQuery.data ?? null;
  const isDraft = detail?.status === 'DRAFT';
  const isPublished = detail?.status === 'PUBLISHED';
  const isDeprecated = detail?.status === 'DEPRECATED';

  // Drag refs
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const routines = routinesQuery.data?.data ?? [];
  const targetFields = targetFieldsQuery.data?.data ?? [];

  // -- Create routine --
  const handleCreateRoutine = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const result = await createRoutineMut.mutateAsync({
          codigo: newCodigo.toUpperCase(),
          nome: newNome,
          routine_type: 'BEHAVIOR',
        });
        toast.success(COPY.success_create_routine);
        if (result) setSelectedId(result.id);
        setShowCreateForm(false);
        setNewCodigo('');
        setNewNome('');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [createRoutineMut, newCodigo, newNome],
  );

  // -- Publish --
  const handlePublish = useCallback(async () => {
    if (!detail) return;
    if (detail.items.length === 0) {
      toast.error(COPY.error_publish_no_items);
      setActiveModal(null);
      return;
    }
    try {
      await publishMut.mutateAsync({
        id: detail.id,
        data: { auto_deprecate_previous: autoDeprecate },
      });
      toast.success(COPY.success_publish);
      setActiveModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.error_generic);
    }
  }, [detail, publishMut, autoDeprecate]);

  // -- Fork --
  const handleFork = useCallback(async () => {
    if (!detail || forkReason.length < 10) return;
    try {
      const result = await forkMut.mutateAsync({
        id: detail.id,
        data: { change_reason: forkReason },
      });
      toast.success(COPY.success_fork(result.version));
      setSelectedId(result.id);
      setActiveModal(null);
      setForkReason('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : COPY.error_generic);
    }
  }, [detail, forkMut, forkReason]);

  // -- Add item --
  const handleAddItem = useCallback(
    async (data: CreateRoutineItemRequest) => {
      if (!detail) return;
      try {
        await createItemMut.mutateAsync({ routineId: detail.id, data });
        setAddingItem(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [detail, createItemMut],
  );

  // -- Update item (auto-save) --
  const handleUpdateItem = useCallback(
    async (itemId: string, data: UpdateRoutineItemRequest) => {
      try {
        await updateItemMut.mutateAsync({ itemId, data });
      } catch {
        toast.error(COPY.error_auto_save);
      }
    },
    [updateItemMut],
  );

  // -- Delete item --
  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      try {
        await deleteItemMut.mutateAsync(itemId);
        if (editingItemId === itemId) setEditingItemId(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : COPY.error_generic);
      }
    },
    [deleteItemMut, editingItemId],
  );

  // -- Drag-and-drop reorder --
  const handleDragStart = useCallback((index: number) => {
    dragItemRef.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItemRef.current = index;
  }, []);

  const handleDrop = useCallback(async () => {
    if (
      dragItemRef.current === null ||
      dragOverItemRef.current === null ||
      dragItemRef.current === dragOverItemRef.current ||
      !detail
    )
      return;

    const items = [...detail.items].sort((a, b) => a.ordem - b.ordem);
    const draggedItem = items[dragItemRef.current];
    const targetOrdem = items[dragOverItemRef.current].ordem;

    dragItemRef.current = null;
    dragOverItemRef.current = null;

    await handleUpdateItem(draggedItem.id, { ordem: targetOrdem });
  }, [detail, handleUpdateItem]);

  // -- Preview (dry-run) --
  const handlePreview = useCallback(async () => {
    if (!detail || (targetObjectsQuery.data?.data ?? []).length === 0) return;
    try {
      await evaluateMut.mutateAsync({
        object_type: (targetObjectsQuery.data?.data ?? [])[0].codigo,
        context: [{ framer_id: crypto.randomUUID() }],
        dry_run: true,
      });
      setShowPreview(true);
    } catch {
      toast.error(COPY.error_simulate);
    }
  }, [detail, targetObjectsQuery.data, evaluateMut]);

  // -- Loading --
  if (routinesQuery.isLoading) {
    return (
      <div className="p-6 space-y-3" aria-busy="true" aria-label="Carregando rotinas">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded" />
        ))}
      </div>
    );
  }

  // -- Error --
  if (routinesQuery.error) {
    return (
      <div className="p-6" role="alert">
        <p className="text-destructive font-medium mb-2">Nao foi possivel carregar as rotinas.</p>
        <Button variant="outline" onClick={() => routinesQuery.refetch()}>
          {COPY.btn_retry}
        </Button>
      </div>
    );
  }

  const sortedItems = detail ? [...detail.items].sort((a, b) => a.ordem - b.ordem) : [];

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)] p-6">
      {/* Left panel: Routines List */}
      <div className="w-[360px] border-r border-border pr-4 overflow-y-auto shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-bold">Rotinas</h1>
          {canWrite && (
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              Nova rotina
            </Button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setRoutineFilters(
              e.target.value
                ? { status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' }
                : {},
            );
          }}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mb-3"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="DEPRECATED">DEPRECATED</option>
        </select>

        {/* Create form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateRoutine}
            className="border border-border rounded-lg p-3 mb-3 space-y-2"
          >
            <Input
              required
              placeholder="Codigo"
              value={newCodigo}
              onChange={(e) => setNewCodigo(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Input
              required
              placeholder="Nome"
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={createRoutineMut.isPending}>
                Criar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {routines.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">{COPY.empty_routines}</p>
        )}

        {/* List */}
        {routines.map((r) => (
          <div
            key={r.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedId(r.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSelectedId(r.id);
            }}
            className={`p-2.5 mb-1 rounded-md cursor-pointer transition-colors ${
              selectedId === r.id
                ? 'bg-primary/5 border border-primary'
                : 'border border-transparent hover:bg-muted/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-mono font-semibold text-sm">{r.codigo}</span>
              <Badge className={`text-xs ${routineStatusClass(r.status)}`}>{r.status}</Badge>
            </div>
            <div className="text-sm text-foreground">{r.nome}</div>
            <div className="text-xs text-muted-foreground">
              v{r.version} |{' '}
              {r.published_at ? new Date(r.published_at).toLocaleDateString() : 'Nao publicada'}
            </div>
          </div>
        ))}
      </div>

      {/* Right panel: Editor */}
      <div className="flex-1 overflow-y-auto pl-4">
        {!detail && !detailQuery.isLoading && (
          <div className="text-muted-foreground text-center mt-10">
            Selecione uma rotina para editar.
          </div>
        )}

        {detailQuery.isLoading && (
          <div className="space-y-3 py-4" aria-busy="true">
            <Skeleton className="h-8 w-1/2 rounded" />
            <Skeleton className="h-6 w-1/3 rounded" />
            <Skeleton className="h-20 rounded" />
          </div>
        )}

        {detail && (
          <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  {detail.nome}{' '}
                  <span className="text-sm text-muted-foreground font-normal">
                    v{detail.version}
                  </span>
                </h2>
                <Badge className={`text-xs ${routineStatusClass(detail.status)}`}>
                  {detail.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                {canPublishRoutine(userScopes, detail.status) && (
                  <Button size="sm" onClick={() => setActiveModal('publish')}>
                    Publicar
                  </Button>
                )}
                {canForkRoutine(userScopes, detail.status) && (
                  <Button size="sm" variant="outline" onClick={() => setActiveModal('fork')}>
                    Nova versao
                  </Button>
                )}
                {canEvaluateEngine(userScopes) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={evaluateMut.isPending}
                  >
                    Pre-visualizar
                  </Button>
                )}
              </div>
            </div>

            {/* Readonly/Deprecated banner */}
            {isPublished && (
              <div className="bg-blue-50 text-blue-800 px-4 py-2.5 rounded-md mb-4 text-sm">
                {COPY.readonly_banner}
              </div>
            )}
            {isDeprecated && (
              <div className="bg-muted px-4 py-2.5 rounded-md mb-4 text-sm text-muted-foreground">
                {COPY.deprecated_banner}
              </div>
            )}

            {/* Items list */}
            {sortedItems.length === 0 && (
              <p className="text-muted-foreground text-sm py-4">{COPY.empty_items}</p>
            )}

            {sortedItems.map((item, idx) => (
              <div
                key={item.id}
                draggable={isDraft && canWrite}
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border border-border rounded-lg p-3 mb-2 transition-colors ${
                  isDraft ? 'cursor-grab' : ''
                } ${editingItemId === item.id ? 'bg-amber-50' : 'bg-background'}`}
              >
                <div className="flex items-center gap-2">
                  {isDraft && canWrite && (
                    <span className="cursor-grab text-muted-foreground select-none">&#9776;</span>
                  )}
                  <span className="font-bold text-sm w-6">{item.ordem}</span>
                  <Badge className={`text-xs ${itemTypeBadgeClass(item.item_type as ItemType)}`}>
                    {item.item_type}
                  </Badge>
                  <span className="text-sm">{item.action}</span>
                  {item.is_blocking && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="destructive" className="text-xs">
                            Bloqueante
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{COPY.tooltip_blocking}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <span className="flex-1" />
                  {isDraft && canWrite && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItemId(editingItemId === item.id ? null : item.id)}
                      >
                        {editingItemId === item.id ? 'Fechar' : 'Editar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Remover
                      </Button>
                    </>
                  )}
                </div>

                {editingItemId === item.id && (
                  <div className="mt-3">
                    <ItemTypeForm
                      initialValues={{
                        item_type: item.item_type as ItemType,
                        action: item.action as ItemAction,
                        target_field_id: item.target_field_id,
                        value: item.value,
                        validation_message: item.validation_message,
                        is_blocking: item.is_blocking,
                        ordem: item.ordem,
                      }}
                      targetFields={targetFields}
                      nextOrdem={item.ordem}
                      readonly={!isDraft}
                      onSave={(data) => handleUpdateItem(item.id, data as UpdateRoutineItemRequest)}
                      autoSaveMs={600}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Add item */}
            {isDraft && canWrite && (
              <div className="mt-3">
                {addingItem ? (
                  <div className="border border-dashed border-primary rounded-lg p-4">
                    <ItemTypeForm
                      targetFields={targetFields}
                      nextOrdem={
                        sortedItems.length > 0 ? sortedItems[sortedItems.length - 1].ordem + 1 : 0
                      }
                      readonly={false}
                      onSave={(data) => handleAddItem(data as CreateRoutineItemRequest)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddingItem(false)}
                      className="mt-2"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setAddingItem(true)}>
                    Adicionar item
                  </Button>
                )}
              </div>
            )}

            {/* Version History */}
            {detail.version_history.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Historico de Versoes</h3>
                <div className="space-y-3">
                  {detail.version_history.map((vh) => (
                    <div key={vh.id} className="border-l-2 border-primary pl-3">
                      <div className="text-xs text-muted-foreground">
                        {new Date(vh.changed_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm">{vh.change_reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detail.version_history.length === 0 && (
              <p className="text-muted-foreground text-xs mt-6">{COPY.history_empty}</p>
            )}
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      <Dialog
        open={activeModal === 'publish'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicar Rotina</DialogTitle>
            <DialogDescription>{COPY.confirm_publish}</DialogDescription>
          </DialogHeader>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoDeprecate}
              onChange={(e) => setAutoDeprecate(e.target.checked)}
              className="rounded border-input"
            />
            Deprecar versao anterior automaticamente
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handlePublish} disabled={publishMut.isPending}>
              {publishMut.isPending ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fork Dialog */}
      <Dialog open={activeModal === 'fork'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Versao</DialogTitle>
            <DialogDescription>{COPY.confirm_fork}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="fork-reason">Motivo da mudanca</Label>
            <textarea
              id="fork-reason"
              value={forkReason}
              onChange={(e) => setForkReason(e.target.value)}
              placeholder="Motivo da mudanca (min 10 caracteres)"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
            />
            {forkReason.length > 0 && forkReason.length < 10 && (
              <p className="text-destructive text-xs">{COPY.error_fork_reason}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleFork} disabled={forkReason.length < 10 || forkMut.isPending}>
              {forkMut.isPending ? 'Criando...' : 'Criar nova versao'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Drawer */}
      <DryRunPreview
        open={showPreview}
        onOpenChange={setShowPreview}
        result={evaluateMut.data ?? null}
      />
    </div>
  );
}
