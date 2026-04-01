/**
 * @contract UX-SGR-002, UX-011-M01 D2
 * Sidebar showing record metadata: STATUS, CRIADO EM, ATUALIZADO EM, ENQUADRADOR.
 * Width: 280px (w-72), flex-shrink:0.
 * Data comes from parent via RecordMetadata prop — no mock data.
 */

import type { RecordMetadata } from '../types/smartgrid.types';

interface MetadataSidebarProps {
  readonly metadata?: RecordMetadata;
}

/** @contract UX-011-M01 D2 — MetadataSidebar 280px */
export function MetadataSidebar({ metadata }: MetadataSidebarProps) {
  if (!metadata) return null;

  return (
    <aside className="w-72 flex-shrink-0 rounded-xl border border-[#E8E8E6] bg-white p-5">
      <h3 className="mb-4 text-sm font-bold text-[#111111]">Metadata</h3>

      {/* STATUS */}
      {metadata.status != null && (
        <div className="mb-4">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
            STATUS
          </span>
          <span className="mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase leading-tight text-[#1E7A42] bg-[#E8F8EF]">
            {metadata.status}
          </span>
        </div>
      )}

      {/* CRIADO EM */}
      {metadata.createdAt != null && (
        <div className="mb-4">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
            CRIADO EM
          </span>
          <span className="mt-1 block text-xs text-[#555555]">
            {metadata.createdAt}
          </span>
        </div>
      )}

      {/* ATUALIZADO EM */}
      {metadata.updatedAt != null && (
        <div className="mb-4">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
            ATUALIZADO EM
          </span>
          <span className="mt-1 block text-xs text-[#555555]">
            {metadata.updatedAt}
          </span>
        </div>
      )}

      {/* ENQUADRADOR */}
      {(metadata.framerId != null || metadata.framerLabel != null) && (
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#888888]">
            ENQUADRADOR
          </span>
          <span className="mt-1 block text-xs text-[#555555]">
            {metadata.framerLabel ?? metadata.framerId}
          </span>
        </div>
      )}
    </aside>
  );
}
