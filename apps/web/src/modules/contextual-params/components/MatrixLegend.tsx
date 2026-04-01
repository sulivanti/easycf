/**
 * @contract UX-007-M01 §MatrixLegend
 * MatrixLegend — 3 swatches com labels para a legenda da matriz de incidencia.
 */

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function MatrixLegend() {
  return (
    <div className="flex items-center gap-4 mt-3 px-1">
      <Swatch color="bg-[#B39DDB]" label="Obrigatório" />
      <Swatch color="bg-[#80CBC4]" label="Opcional" />
      <Swatch color="bg-[#FFD54F]" label="Auto-apply" />
    </div>
  );
}
