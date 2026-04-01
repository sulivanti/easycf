/**
 * @contract UX-001-M01 D9
 * Modal de revogação/remoção com ícone warning circular.
 * Variantes: revogar compartilhamento, revogar delegação, remover PRIMARY, remover SECONDARY.
 */

import { Button, Spinner } from '@shared/ui';
import { AlertTriangle } from 'lucide-react';

export interface RevokeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'share' | 'delegation' | 'primary' | 'secondary';
  targetName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const VARIANTS = {
  share: {
    title: 'Revogar compartilhamento?',
    body: (name: string) =>
      `Confirma revogação deste compartilhamento? O acesso de ${name} será removido imediatamente.`,
    confirm: 'Revogar',
    iconBg: 'bg-[#FFF3E0]',
    iconColor: 'text-[#E67E22]',
  },
  delegation: {
    title: 'Revogar delegação?',
    body: (name: string) =>
      `Deseja revogar a delegação para ${name}? Os escopos delegados serão removidos imediatamente.`,
    confirm: 'Revogar',
    iconBg: 'bg-[#FFF3E0]',
    iconColor: 'text-[#E67E22]',
  },
  primary: {
    title: 'Remover área principal?',
    body: () =>
      'Ao remover a área principal, processos vinculados a este usuário podem perder contexto organizacional.',
    confirm: 'Remover mesmo assim',
    iconBg: 'bg-[#FFEBEE]',
    iconColor: 'text-[#E74C3C]',
  },
  secondary: {
    title: 'Remover escopo?',
    body: () => 'Deseja remover este vínculo organizacional?',
    confirm: 'Remover',
    iconBg: 'bg-[#FFF3E0]',
    iconColor: 'text-[#E67E22]',
  },
};

export function RevokeModal({
  open,
  onOpenChange,
  variant,
  targetName = '',
  onConfirm,
  isLoading,
}: RevokeModalProps) {
  if (!open) return null;

  const v = VARIANTS[variant];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-[420px] rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${v.iconBg}`}
          >
            <AlertTriangle className={`h-6 w-6 ${v.iconColor}`} />
          </div>

          <h3 className="mt-4 text-lg font-bold text-[#111111]">{v.title}</h3>

          <p className="mt-2 text-[13px] text-[#555555]">{v.body(targetName)}</p>

          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-[#E8E8E6] px-5 text-[13px] font-semibold text-[#555555]"
              onClick={() => onOpenChange(false)}
              autoFocus
            >
              Cancelar
            </Button>
            <Button
              className="h-10 rounded-lg bg-[#E74C3C] px-5 text-[13px] font-bold text-white hover:bg-[#C0392B]"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {v.confirm}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
