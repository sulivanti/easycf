/**
 * @contract UX-000-M04, 07-role-form-spec
 * ScopeGrid — flex-wrap container for ScopeChips. gap:8px.
 */

import { ScopeChip } from './scope-chip.js';

interface ScopeGridProps {
  scopes: string[];
  onRemove?: (scope: string) => void;
}

function ScopeGrid({ scopes, onRemove }: ScopeGridProps) {
  if (scopes.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-a1-text-auxiliary">
        Nenhum escopo adicionado ainda
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {scopes.map((scope) => (
        <ScopeChip key={scope} scope={scope} onRemove={onRemove} />
      ))}
    </div>
  );
}

export { ScopeGrid };
export type { ScopeGridProps };
