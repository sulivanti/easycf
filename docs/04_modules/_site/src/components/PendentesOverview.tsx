import { useState, useMemo } from "react";
import type { Pendente } from "@lib/types";

interface Props {
  pendentes: Pendente[];
}

const SEV_COLOR: Record<string, string> = {
  CRITICA: "var(--sev-bloq)",
  BLOQ: "var(--sev-bloq)",
  ALTA: "var(--sev-alta)",
  MEDIA: "var(--sev-media)",
  BAIXA: "var(--sev-baixa)",
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  ABERTA: { bg: "var(--danger-bg)", fg: "var(--danger-fg)" },
  DECIDIDA: { bg: "var(--approved-bg)", fg: "var(--approved-fg)" },
  IMPLEMENTADA: { bg: "var(--ready-bg)", fg: "var(--ready-fg)" },
};

export default function PendentesOverview({ pendentes }: Props) {
  const [filterStatus, setFilterStatus] = useState("ABERTA");
  const [filterSev, setFilterSev] = useState("all");

  const filtered = useMemo(() => {
    return pendentes.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterSev !== "all" && p.severidade !== filterSev) return false;
      return true;
    });
  }, [pendentes, filterStatus, filterSev]);

  const openCount = pendentes.filter((p) => p.status === "ABERTA").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: openCount > 0 ? "var(--danger)" : "var(--ready)" }}>
          {openCount}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>pendencias abertas de {pendentes.length} total</span>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {["all", "ABERTA", "DECIDIDA", "IMPLEMENTADA"].map((f) => (
          <button key={f} onClick={() => setFilterStatus(f)} className={`filter-pill ${filterStatus === f ? "active" : ""}`}>
            {f === "all" ? "Todos" : f}
          </button>
        ))}
        <span style={{ width: 8 }} />
        {["all", "CRITICA", "ALTA", "MEDIA", "BAIXA"].map((f) => (
          <button key={f} onClick={() => setFilterSev(f)} className={`filter-pill ${filterSev === f ? "active" : ""}`}>
            {f === "all" ? "Todas Sev" : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", padding: 16, textAlign: "center" }}>
          Nenhuma pendencia com os filtros selecionados.
        </div>
      )}

      {/* Pendentes list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.map((p) => {
          const sevColor = SEV_COLOR[p.severidade] || "var(--text-muted)";
          const ss = STATUS_STYLE[p.status] || { bg: "var(--bg-surface)", fg: "var(--text-secondary)" };
          return (
            <div
              key={`${p.modulo}-${p.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${sevColor}`,
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <span className="mono" style={{ fontWeight: 700, color: "var(--text-muted)", minWidth: 110, fontSize: 11 }}>
                {p.id}
              </span>
              <span className="mono" style={{ color: "var(--accent-fg)", minWidth: 65, fontSize: 10 }}>
                {p.modulo}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center",
                padding: "2px 8px", borderRadius: 100,
                fontSize: 10, fontWeight: 600,
                background: `color-mix(in srgb, ${sevColor} 15%, transparent)`,
                color: sevColor, minWidth: 50,
              }}>
                {p.severidade}
              </span>
              {p.dominio !== "—" && (
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "2px 8px", borderRadius: 100,
                  fontSize: 10, fontWeight: 600,
                  background: "var(--bg-surface)", color: "var(--text-secondary)",
                }}>
                  {p.dominio}
                </span>
              )}
              <span style={{ flex: 1, color: "var(--text-primary)", fontWeight: 500 }}>
                {p.title}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center",
                padding: "2px 8px", borderRadius: 100,
                fontSize: 10, fontWeight: 600,
                background: ss.bg, color: ss.fg,
              }}>
                {p.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
