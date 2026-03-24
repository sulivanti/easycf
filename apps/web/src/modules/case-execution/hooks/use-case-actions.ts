/**
 * @contract FR-002..FR-007, UX-006
 *
 * React hooks for case mutations: transition, control, gates, assignments, events.
 */

import { useState } from "react";
import * as api from "../api/case-execution.api.js";

function useMutation<TInput, TOutput>(fn: (input: TInput) => Promise<TOutput>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (input: TInput): Promise<TOutput> => {
    setLoading(true);
    setError(null);
    try {
      return await fn(input);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

export function useTransitionStage(caseId: string) {
  return useMutation((body: { target_stage_id: string; evidence?: { type: string; content?: string; url?: string }; motivo?: string }) =>
    api.transitionStage(caseId, body),
  );
}

export function useControlCase(caseId: string) {
  return useMutation((body: { action: string; reason?: string; target_stage_id?: string }) =>
    api.controlCase(caseId, body),
  );
}

export function useResolveGate(caseId: string) {
  return useMutation((params: { gateInstanceId: string; body: Parameters<typeof api.resolveGate>[2] }) =>
    api.resolveGate(caseId, params.gateInstanceId, params.body),
  );
}

export function useWaiveGate(caseId: string) {
  return useMutation((params: { gateInstanceId: string; motivo: string }) =>
    api.waiveGate(caseId, params.gateInstanceId, { motivo: params.motivo }),
  );
}

export function useAssignResponsible(caseId: string) {
  return useMutation((body: Parameters<typeof api.assignResponsible>[1]) =>
    api.assignResponsible(caseId, body),
  );
}

export function useRecordEvent(caseId: string) {
  return useMutation((body: Parameters<typeof api.recordEvent>[1]) =>
    api.recordEvent(caseId, body),
  );
}
