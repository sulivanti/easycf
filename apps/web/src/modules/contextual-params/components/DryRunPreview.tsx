/**
 * @contract UX-007 §2.5, FR-009
 * DryRunPreview — Drawer lateral com resultado do motor de avaliacao em secoes colapsaveis.
 */

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, Badge } from '@shared/ui';
import type { EvaluateResponseDTO } from '../types/contextual-params.types.js';
import { COPY } from '../types/view-model.js';

interface DryRunPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: EvaluateResponseDTO | null;
}

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

export function DryRunPreview({ open, onOpenChange, result }: DryRunPreviewProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 w-[420px] rounded-none">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>Pre-visualizacao (Dry-Run)</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto flex-1">
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
                      <span className="font-mono">{v.field_id}</span>:{' '}
                      {v.message ?? '(sem mensagem)'}
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
                  {result.applied_routines.map((r) => (
                    <li key={r.routine_id} className="text-muted-foreground">
                      {r.codigo} <span className="text-xs text-muted-foreground">v{r.version}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
