/**
 * @contract UX-CASE-001, FR-008
 *
 * Timeline feed — interleaved history from 4 sources.
 * Renders entries with source badge, timestamp, actor, and description.
 */

import { Badge } from '../../../shared/ui/index.js';
import type { TimelineEntry } from '../types/case-execution.types.js';
import { TIMELINE_SOURCE_LABELS, COPY } from '../types/case-execution.types.js';

interface TimelineFeedProps {
  entries: TimelineEntry[];
}

export function TimelineFeed({ entries }: TimelineFeedProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400 py-4">{COPY.empty_timeline}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-1 border-l-2 border-gray-200 pl-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {TIMELINE_SOURCE_LABELS[entry.source]}
            </Badge>
            <time className="text-xs text-gray-500">
              {new Date(entry.timestamp).toLocaleString('pt-BR')}
            </time>
            {entry.actor && <span className="text-xs text-gray-600">{entry.actor.name}</span>}
          </div>
          <div className="text-sm">{renderEntryContent(entry)}</div>
        </li>
      ))}
    </ul>
  );
}

function renderEntryContent(entry: TimelineEntry): string {
  const d = entry.data;
  switch (entry.source) {
    case 'stage_history':
      return `De ${String(d.from_stage_name ?? '—')} para ${String(d.to_stage_name)}${d.motivo ? ` — ${d.motivo}` : ''}`;
    case 'gate_instance':
      return `Gate ${String(d.gate_name ?? d.gate_id)}: ${String(d.status)}${d.decision ? ` (${d.decision})` : ''}`;
    case 'case_event':
      return `[${String(d.event_type)}] ${String(d.descricao)}`;
    case 'case_assignment':
      return `${String(d.process_role_name ?? d.process_role_id)} → ${String(d.user_name ?? d.user_id)}`;
    default:
      return JSON.stringify(d);
  }
}
