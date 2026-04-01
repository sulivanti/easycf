/**
 * @contract UX-007-M01 §5, BR-003, FR-004, FR-010
 * IncidenceMatrix — Grid enquadradores (rows) x rotinas PUBLISHED (cols).
 * Cells: TriStateCell (EMPTY/OBR/OPC/AUTO) replacing binary ACTIVE/INACTIVE.
 * ActiveDot: green 6x6 for framers with at least one rule.
 * FilterBadge: "Somente PUBLISHED" indicator.
 */

import { useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@shared/ui';
import { cn } from '@shared/lib/utils';
import type {
  FramerListItemDTO,
  RoutineListItemDTO,
  IncidenceRuleListItemDTO,
  IncidenceType,
} from '../types/contextual-params.types.js';
import { TriStateCell, nextTriState } from './TriStateCell.js';
import type { TriState } from './TriStateCell.js';
import { MatrixLegend } from './MatrixLegend.js';

export interface IncidenceMatrixProps {
  framers: FramerListItemDTO[];
  routines: RoutineListItemDTO[];
  rules: IncidenceRuleListItemDTO[];
  canWrite: boolean;
  onUpdateRuleType: (ruleId: string, incidenceType: IncidenceType) => void;
  onCreateRule: (framerId: string, routineId: string, incidenceType: IncidenceType) => void;
  onRemoveRule: (ruleId: string) => void;
}

export function IncidenceMatrix({
  framers,
  routines,
  rules,
  canWrite,
  onUpdateRuleType,
  onCreateRule,
  onRemoveRule,
}: IncidenceMatrixProps) {
  // Only show PUBLISHED routines
  const publishedRoutines = useMemo(
    () => routines.filter((r) => r.status === 'PUBLISHED'),
    [routines],
  );

  // Build lookup: `${framer_id}:${routine_id}` -> rule
  // Rules link framer -> target_object, but routines are linked via incidence_rule.
  // For the matrix, we key by framer_id since each rule has a framer_id and we show routines as columns.
  const rulesByFramer = useMemo(() => {
    const map = new Map<string, IncidenceRuleListItemDTO[]>();
    for (const rule of rules) {
      const existing = map.get(rule.framer_id) ?? [];
      existing.push(rule);
      map.set(rule.framer_id, existing);
    }
    return map;
  }, [rules]);

  const findRuleForCell = useCallback(
    (framerId: string, _routineId: string) => {
      const framerRules = rulesByFramer.get(framerId) ?? [];
      // Match by target_object_id used as the routine proxy in matrix view
      return framerRules.find((r) => r.target_object_id === _routineId);
    },
    [rulesByFramer],
  );

  const framerHasRules = useCallback(
    (framerId: string) => (rulesByFramer.get(framerId) ?? []).length > 0,
    [rulesByFramer],
  );

  const handleCellClick = useCallback(
    (framerId: string, routineId: string) => {
      if (!canWrite) return;
      const existing = findRuleForCell(framerId, routineId);
      if (existing) {
        const next = nextTriState(existing.incidence_type as TriState);
        if (next === 'EMPTY') {
          onRemoveRule(existing.id);
        } else {
          onUpdateRuleType(existing.id, next as IncidenceType);
        }
      } else {
        // First click on empty cell creates with OBR
        onCreateRule(framerId, routineId, 'OBR');
      }
    },
    [canWrite, findRuleForCell, onUpdateRuleType, onCreateRule, onRemoveRule],
  );

  if (framers.length === 0 || publishedRoutines.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        Cadastre enquadradores e publique rotinas para visualizar a matriz.
      </p>
    );
  }

  return (
    <div>
      {/* Filter badge */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className="text-xs">
          Somente PUBLISHED
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Enquadrador</TableHead>
              {publishedRoutines.map((routine) => (
                <TableHead key={routine.id} className="text-xs text-center whitespace-nowrap">
                  {routine.codigo}
                  <span className="text-muted-foreground ml-1">v{routine.version}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {framers.map((framer) => (
              <TableRow key={framer.id}>
                <TableCell className="font-mono font-semibold">
                  <div className="flex items-center gap-2">
                    {framerHasRules(framer.id) && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"
                        title="Possui regras de incidencia"
                      />
                    )}
                    {framer.codigo}
                  </div>
                </TableCell>
                {publishedRoutines.map((routine) => {
                  const rule = findRuleForCell(framer.id, routine.id);
                  const state: TriState = rule ? (rule.incidence_type as TriState) : 'EMPTY';

                  return (
                    <TableCell
                      key={routine.id}
                      className={cn('text-center', !canWrite && 'pointer-events-none')}
                    >
                      <TriStateCell
                        state={state}
                        onClick={() => handleCellClick(framer.id, routine.id)}
                        disabled={!canWrite}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MatrixLegend />
    </div>
  );
}
