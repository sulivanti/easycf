/**
 * @contract FR-008, UX-006
 *
 * React hook for fetching the interleaved timeline.
 */

import { useState, useEffect } from "react";
import * as api from "../api/case-execution.api.js";
import type { TimelineEntry } from "../types/case-execution.types.js";

export function useTimeline(caseId: string | null) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!caseId) { setEntries([]); return; }
    setLoading(true);
    api.getTimeline(caseId)
      .then((r) => { setEntries(r.entries); setError(null); })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [caseId]);

  return { entries, loading, error, refetch: () => caseId && api.getTimeline(caseId).then((r) => setEntries(r.entries)) };
}
