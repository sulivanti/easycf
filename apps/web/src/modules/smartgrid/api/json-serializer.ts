/**
 * @contract FR-004, SEC-011 §7
 * Client-side export/import of grid state as JSON.
 * No server-side persistence — purely browser-based.
 */

import type {
  GridRow,
  SmartGridExportEnvelope,
  GridRowExport,
  ImportValidation,
} from '../types/smartgrid.types';

const CURRENT_VERSION = '1.0' as const;
const MAX_JSON_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB safety limit

/**
 * Serialize grid rows into a downloadable JSON envelope.
 * @contract FR-004
 */
export function exportToJson(
  framerId: string,
  objectType: string,
  rows: readonly GridRow[],
): SmartGridExportEnvelope {
  return {
    version: CURRENT_VERSION,
    framer_id: framerId,
    object_type: objectType,
    exported_at: new Date().toISOString(),
    rows: rows.map((r): GridRowExport => ({ data: { ...r.data } })),
  };
}

/**
 * Trigger browser download of the JSON export file.
 * @contract FR-004
 */
export function downloadJson(envelope: SmartGridExportEnvelope, filename?: string): void {
  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `smartgrid-${envelope.object_type}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an imported JSON file against the SmartGrid schema.
 * @contract FR-004, SEC-011 §7
 */
export async function parseImportFile(
  file: File,
  currentFramerId: string,
  maxRows: number,
): Promise<ImportValidation> {
  if (file.size > MAX_JSON_SIZE_BYTES) {
    return { valid: false, error: 'Arquivo excede o limite de 10 MB.', sameOperation: false };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { valid: false, error: 'Não foi possível ler o arquivo.', sameOperation: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      valid: false,
      error: 'O arquivo selecionado não é um JSON válido do SmartGrid.',
      sameOperation: false,
    };
  }

  if (!isValidEnvelope(parsed)) {
    return {
      valid: false,
      error: 'O arquivo selecionado não é um JSON válido do SmartGrid.',
      sameOperation: false,
    };
  }

  const envelope = parsed as SmartGridExportEnvelope;

  if (envelope.rows.length > maxRows) {
    return {
      valid: false,
      error: `O arquivo contém ${envelope.rows.length} linhas, excedendo o limite de ${maxRows}.`,
      sameOperation: envelope.framer_id === currentFramerId,
    };
  }

  return { valid: true, envelope, sameOperation: envelope.framer_id === currentFramerId };
}

/**
 * Convert imported envelope rows into GridRow objects (status: neutral).
 * @contract FR-004
 */
export function importRowsFromEnvelope(envelope: SmartGridExportEnvelope): GridRow[] {
  return envelope.rows.map((r) => ({
    _rowId: crypto.randomUUID(),
    _status: 'neutral' as const,
    _validationMessages: [],
    _blockingMessages: [],
    data: { ...r.data },
  }));
}

function isValidEnvelope(obj: unknown): obj is SmartGridExportEnvelope {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    o.version === CURRENT_VERSION &&
    typeof o.framer_id === 'string' &&
    typeof o.object_type === 'string' &&
    typeof o.exported_at === 'string' &&
    Array.isArray(o.rows) &&
    o.rows.every(
      (r: unknown) =>
        typeof r === 'object' &&
        r !== null &&
        typeof (r as Record<string, unknown>).data === 'object',
    )
  );
}
