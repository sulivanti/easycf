/**
 * @contract UX-002, 12-departments-spec §8
 * Badge colorido de departamento (circle + nome).
 * Reutilizado em: DepartmentTable, DetailPanel (org-units futuro).
 */

interface DepartmentTagProps {
  nome: string;
  cor: string | null;
}

export function DepartmentTag({ nome, cor }: DepartmentTagProps) {
  if (!cor) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E8E8E6] bg-white px-3 py-1 text-xs font-semibold text-[#888]">
        {nome}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold"
      style={{
        color: cor,
        backgroundColor: `${cor}1A`, // 10% opacity
        borderColor: `${cor}4D`, // 30% opacity
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cor }} />
      {nome}
    </span>
  );
}
