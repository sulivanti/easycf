/**
 * @contract UX-007-M01 §2.5, FR-009
 * DryRunModal — Modal centralizado (w:560) com resultado do motor de avaliacao.
 * Resultados color-coded por incidence_type nas rotinas aplicadas.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from '@shared/ui';
import type { EvaluateResponseDTO } from '../types/contextual-params.types.js';
import { COPY } from '../types/view-model.js';

interface DryRunModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: EvaluateResponseDTO | null;
}

const INCIDENCE_TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  OBR: { bg: 'bg-[#EDE7F6]', text: 'text-[#4A148C]', label: 'OBR' },
  OPC: { bg: 'bg-[#E0F2F1]', text: 'text-[#004D40]', label: 'OPC' },
  AUTO: { bg: 'bg-[#FFF8E1]', text: 'text-[#E65100]', label: 'AUTO' },
};

function CollapsibleSection({
  title,
  count,
  children,
  variant = 'default',
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}) {
  return (
    <details className="border border-border rounded-lg overflow-hidden mb-2">
      <summary className="flex items-center justify-between cursor-pointer px-4 py-2.5 hover:bg-muted/50">
        <span
          className={variant === 'destructive' ? 'text-destructive font-medium' : 'font-medium'}
        >
          {title}
        </span>
        <Badge variant={variant === 'destructive' ? 'destructive' : 'secondary'}>{count}</Badge>
      </summary>
      <div className="px-4 pb-3 pt-1">{children}</div>
    </details>
  );
}

export function DryRunPreview({ open, onOpenChange, result }: DryRunModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pre-visualizacao (Dry-Run)</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-amber-600 italic mb-4">{COPY.dry_run_aviso_routine}</p>

        {result && (
          <div className="space-y-1">
            <CollapsibleSection title="Campos visiveis" count={result.visible_fields.length}>
              <ul className="text-sm space-y-1">
                {result.visible_fields.map((f) => (
                  <li key={f} className="text-muted-foreground">
                    {f}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Campos obrigatorios" count={result.required_fields.length}>
              <ul className="text-sm space-y-1">
                {result.required_fields.map((f) => (
                  <li key={f} className="text-muted-foreground">
                    {f}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Campos ocultos" count={result.hidden_fields.length}>
              <ul className="text-sm space-y-1">
                {result.hidden_fields.map((f) => (
                  <li key={f} className="text-muted-foreground">
                    {f}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Defaults" count={result.defaults.length}>
              <ul className="text-sm space-y-1">
                {result.defaults.map((d) => (
                  <li key={d.field_id} className="text-muted-foreground">
                    <span className="font-mono">{d.field_id}</span>: {JSON.stringify(d.value)}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection
              title="Restricoes de dominio"
              count={result.domain_restrictions.length}
            >
              <ul className="text-sm space-y-1">
                {result.domain_restrictions.map((d) => (
                  <li key={d.field_id} className="text-muted-foreground">
                    <span className="font-mono">{d.field_id}</span>:{' '}
                    {JSON.stringify(d.allowed_values)}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Validacoes" count={result.validations.length}>
              <ul className="text-sm space-y-1">
                {result.validations.map((v) => (
                  <li key={v.field_id} className="text-muted-foreground">
                    <span className="font-mono">{v.field_id}</span>: {v.message ?? '(sem mensagem)'}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection
              title="Bloqueantes"
              count={result.blocking_validations.length}
              variant="destructive"
            >
              <ul className="text-sm space-y-1">
                {result.blocking_validations.map((v) => (
                  <li key={v} className="text-destructive font-medium">
                    {v}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Rotinas aplicadas" count={result.applied_routines.length}>
              <ul className="text-sm space-y-1">
                {result.applied_routines.map((r) => {
                  const typeStyle = INCIDENCE_TYPE_STYLE[r.incidence_type];
                  return (
                    <li key={r.routine_id} className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {r.codigo}{' '}
                        <span className="text-xs text-muted-foreground">v{r.version}</span>
                      </span>
                      {typeStyle && (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${typeStyle.bg} ${typeStyle.text}`}
                        >
                          {typeStyle.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CollapsibleSection>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
