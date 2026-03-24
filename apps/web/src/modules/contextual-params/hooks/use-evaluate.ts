/**
 * @contract FR-009, UX-007
 *
 * React Query hook for the evaluation engine (dry-run preview).
 * Uses useMutation since evaluate is a POST with side-effects.
 */

import { useMutation } from '@tanstack/react-query';
import { evaluateEngine } from '../api/contextual-params.api.js';
import type { EvaluateRequest } from '../types/contextual-params.types.js';

/** @contract FR-009 — POST /routine-engine/evaluate */
export function useEvaluateEngine() {
  return useMutation({
    mutationFn: (data: EvaluateRequest) => evaluateEngine(data),
  });
}
