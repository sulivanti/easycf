/**
 * @contract UX-000-M04, 07-role-form-spec
 * ScopeChip — removable chip for scope tags.
 * bg #F4F4F2, border #E0E0DE, radius 6px, padding 6px 12px.
 */

interface ScopeChipProps {
  scope: string;
  onRemove?: (scope: string) => void;
}

function ScopeChip({ scope, onRemove }: ScopeChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#E0E0DE] bg-[#F4F4F2] px-3 py-1.5 font-display text-xs font-medium text-a1-text-tertiary">
      {scope}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(scope)}
          className="text-xs font-semibold text-a1-text-auxiliary transition-colors hover:text-a1-text-primary"
          aria-label={`Remover ${scope}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export { ScopeChip };
export type { ScopeChipProps };
