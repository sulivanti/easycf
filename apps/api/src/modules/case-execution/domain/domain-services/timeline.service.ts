/**
 * @contract ADR-003
 *
 * Pure domain service for assembling the interleaved timeline
 * from 3 independent histories: stage_history, gate_instances, case_events.
 * Sorts all entries chronologically (newest first).
 */

export interface TimelineEntry {
  id: string;
  source: 'stage_history' | 'gate_instance' | 'case_event' | 'case_assignment';
  timestamp: Date;
  data: Record<string, unknown>;
}

/**
 * Merges entries from multiple history sources into a single
 * chronologically sorted timeline (descending — newest first).
 */
export function assembleTimeline(...sources: TimelineEntry[][]): TimelineEntry[] {
  const merged = sources.flat();
  merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return merged;
}
