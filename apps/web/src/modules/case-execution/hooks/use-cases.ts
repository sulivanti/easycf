/**
 * @contract FR-009, FR-010, UX-006
 *
 * React hooks for case data fetching and mutations.
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "../api/case-execution.api.js";
import type {
  CaseListItem,
  CaseDetail,
  CaseStatus,
  PaginatedResponse,
} from "../types/case-execution.types.js";

export function useCaseList(params: {
  cycle_id?: string;
  status?: CaseStatus;
  my_responsibility?: boolean;
  search?: string;
}) {
  const [data, setData] = useState<PaginatedResponse<CaseListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (cursor?: string) => {
    setLoading(true);
    try {
      const result = await api.listCases({ ...params, cursor });
      setData((prev) =>
        cursor && prev
          ? { data: [...prev.data, ...result.data], meta: result.meta }
          : result,
      );
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [params.cycle_id, params.status, params.my_responsibility, params.search]);

  useEffect(() => { fetch(); }, [fetch]);

  const loadMore = () => {
    if (data?.meta.has_more && data.meta.next_cursor) {
      fetch(data.meta.next_cursor);
    }
  };

  return { data, loading, error, refetch: () => fetch(), loadMore };
}

export function useCaseDetail(caseId: string | null) {
  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!caseId) { setData(null); return; }
    setLoading(true);
    api.getCaseDetails(caseId)
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [caseId]);

  return { data, loading, error, refetch: () => caseId && api.getCaseDetails(caseId).then(setData) };
}

export function useOpenCase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (body: Parameters<typeof api.openCase>[0]) => {
    setLoading(true);
    setError(null);
    try {
      return await api.openCase(body);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
