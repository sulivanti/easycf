/**
 * @contract UX-002, 12-departments-spec §7
 * Modal de confirmação de desativação de departamento.
 */

interface DeactivateModalProps {
  nome: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeactivateModal({ nome, onConfirm, onCancel, isLoading }: DeactivateModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[420px] rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3E0]">
            <svg className="h-6 w-6 text-[#E67E22]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h3 className="mt-4 text-center text-lg font-bold text-[#111]">
          Desativar departamento?
        </h3>
        <p className="mt-2 text-center text-[13px] text-[#555]">
          Deseja desativar o departamento <strong className="text-[#111]">{nome}</strong>?
          Ele poderá ser restaurado posteriormente.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-[#E8E8E6] px-5 text-[13px] font-semibold text-[#555] hover:bg-[#F8F8F6]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 rounded-lg bg-[#E74C3C] px-5 text-[13px] font-bold text-white hover:bg-[#C0392B] disabled:opacity-60"
          >
            {isLoading ? 'Desativando...' : 'Desativar'}
          </button>
        </div>
      </div>
    </div>
  );
}
