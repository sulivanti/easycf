/**
 * @contract UX-001-M02 M05
 * HierarchyCard — card "Hierarquia" exibido somente em modo edit.
 * Mostra Unidade Pai e Nível como ReadOnlyField com cadeado.
 */

import { ReadOnlyField } from './ReadOnlyField.js';

export interface HierarchyCardProps {
  parentName: string | null;
  levelLabel: string;
}

export function HierarchyCard({ parentName, levelLabel }: HierarchyCardProps) {
  return (
    <div className="rounded-xl border border-a1-border bg-white">
      {/* Header */}
      <div className="rounded-t-xl bg-[#F8F8F6] px-6 py-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">
          Hierarquia
        </h3>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-4 px-6 py-5">
        <ReadOnlyField label="Unidade Pai" value={parentName ?? '(Raiz)'} showLock />
        <ReadOnlyField label="Nível" value={levelLabel} showLock />
      </div>
    </div>
  );
}
