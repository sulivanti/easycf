/**
 * @contract UX-007 §5, BR-003, FR-004, FR-010
 * IncidenceMatrix — Grid enquadradores (rows) x objetos-alvo (cols).
 * Cells: empty (create), occupied ACTIVE (edit), occupied INACTIVE (readonly).
 * UNIQUE constraint: one rule per (framer_id, target_object_id).
 */

import { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Input,
  Label,
  Spinner,
} from '@shared/ui';
import type {
  FramerListItemDTO,
  TargetObjectListItemDTO,
  IncidenceRuleListItemDTO,
  CreateIncidenceRuleRequest,
  EvaluateResponseDTO,
} from '../types/contextual-params.types.js';
import { framerStatusClass } from '../types/view-model.js';
import { DryRunPreview } from './DryRunPreview.js';

interface RuleDrawerState {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  framerId: string;
  targetObjectId: string;
  rule?: IncidenceRuleListItemDTO;
}

export interface IncidenceMatrixProps {
  framers: FramerListItemDTO[];
  targetObjects: TargetObjectListItemDTO[];
  rules: IncidenceRuleListItemDTO[];
  canWrite: boolean;
  canEvaluate: boolean;
  onCreateRule: (data: CreateIncidenceRuleRequest) => void;
  onLinkRoutine: (ruleId: string, routineId: string) => void;
  onUnlinkRoutine: (ruleId: string, routineId: string) => void;
  onPreview: (objectType: string, framerId: string) => void;
  previewResult: EvaluateResponseDTO | null;
  previewLoading: boolean;
}

export function IncidenceMatrix({
  framers,
  targetObjects,
  rules,
  canWrite,
  canEvaluate,
  onCreateRule,
  onPreview,
  previewResult,
  previewLoading,
}: IncidenceMatrixProps) {
  const [drawer, setDrawer] = useState<RuleDrawerState | null>(null);
  const [newValidFrom, setNewValidFrom] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const findRule = useCallback(
    (framerId: string, targetObjectId: string) =>
      rules.find((r) => r.framer_id === framerId && r.target_object_id === targetObjectId),
    [rules],
  );

  const handleCellClick = useCallback(
    (framerId: string, targetObjectId: string) => {
      const existing = findRule(framerId, targetObjectId);
      if (existing) {
        setDrawer({
          open: true,
          mode: existing.status === 'ACTIVE' ? 'edit' : 'view',
          framerId,
          targetObjectId,
          rule: existing,
        });
      } else if (canWrite) {
        setDrawer({ open: true, mode: 'create', framerId, targetObjectId });
        setNewValidFrom('');
      }
    },
    [findRule, canWrite],
  );

  const handleCreateSubmit = useCallback(() => {
    if (!drawer || !newValidFrom) return;
    onCreateRule({
      framer_id: drawer.framerId,
      target_object_id: drawer.targetObjectId,
      valid_from: new Date(newValidFrom).toISOString(),
    });
    setDrawer(null);
  }, [drawer, newValidFrom, onCreateRule]);

  if (framers.length === 0 || targetObjects.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        Cadastre enquadradores e objetos-alvo para visualizar a matriz.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Enquadrador</TableHead>
              {targetObjects.map((obj) => (
                <TableHead key={obj.id} className="text-xs text-center">
                  {obj.nome}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {framers.map((framer) => (
              <TableRow key={framer.id}>
                <TableCell className="font-mono font-semibold">{framer.codigo}</TableCell>
                {targetObjects.map((obj) => {
                  const rule = findRule(framer.id, obj.id);
                  return (
                    <TableCell
                      key={obj.id}
                      className={`text-center cursor-pointer transition-colors ${
                        rule
                          ? rule.status === 'ACTIVE'
                            ? 'bg-green-50 hover:bg-green-100'
                            : 'bg-muted/30 hover:bg-muted/50'
                          : canWrite
                            ? 'bg-amber-50/50 hover:bg-amber-100/50'
                            : ''
                      }`}
                      onClick={() => handleCellClick(framer.id, obj.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={
                        rule
                          ? `Regra ${rule.status} para ${framer.codigo} x ${obj.nome}`
                          : `Criar regra para ${framer.codigo} x ${obj.nome}`
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCellClick(framer.id, obj.id);
                        }
                      }}
                    >
                      {rule ? (
                        <Badge className={`text-xs ${framerStatusClass(rule.status)}`}>
                          {rule.status}
                        </Badge>
                      ) : canWrite ? (
                        <span className="text-muted-foreground text-sm">+</span>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rule Drawer */}
      <Drawer
        open={!!drawer?.open}
        onOpenChange={(open) => {
          if (!open) setDrawer(null);
        }}
        direction="right"
      >
        <DrawerContent className="fixed inset-y-0 right-0 w-[420px] rounded-none">
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>
              {drawer?.mode === 'create'
                ? 'Nova Regra de Incidencia'
                : drawer?.mode === 'edit'
                  ? 'Editar Regra'
                  : 'Visualizar Regra'}
            </DrawerTitle>
            <DrawerClose />
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4">
            {drawer?.mode === 'create' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rule-valid-from">Valido de *</Label>
                  <Input
                    id="rule-valid-from"
                    type="date"
                    required
                    value={newValidFrom}
                    onChange={(e) => setNewValidFrom(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateSubmit} disabled={!newValidFrom}>
                  Criar regra
                </Button>
              </div>
            )}

            {drawer?.rule && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Status:</span>
                  <Badge className={framerStatusClass(drawer.rule.status)}>
                    {drawer.rule.status}
                  </Badge>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Vigencia: </span>
                  {new Date(drawer.rule.valid_from).toLocaleDateString()}
                  {drawer.rule.valid_until
                    ? ` — ${new Date(drawer.rule.valid_until).toLocaleDateString()}`
                    : ' — sem fim'}
                </div>

                {canEvaluate && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      disabled={previewLoading}
                      onClick={() => {
                        const obj = targetObjects.find((o) => o.id === drawer.targetObjectId);
                        if (obj) {
                          onPreview(obj.codigo, drawer.framerId);
                          setShowPreview(true);
                        }
                      }}
                    >
                      {previewLoading ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" /> Simulando...
                        </>
                      ) : (
                        'Simular motor'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <DryRunPreview
        open={showPreview && !!previewResult}
        onOpenChange={setShowPreview}
        result={previewResult}
      />
    </>
  );
}
