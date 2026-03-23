import { useState } from "react";
import type { Module } from "@lib/types";

interface Props {
  modules: Module[];
}

function sevClass(sev: string): string {
  const s = sev.toUpperCase();
  if (s === "BLOQ") return "sev-bloq";
  if (s === "ALTA") return "sev-alta";
  if (s === "MEDIA" || s === "MÉDIA") return "sev-media";
  if (s === "BAIXA") return "sev-baixa";
  return "";
}

function statusBadge(status: string): string {
  switch (status) {
    case "ABERTA": return "badge badge-danger";
    case "DECIDIDA": return "badge badge-approved";
    case "IMPLEMENTADA": return "badge badge-ready";
    case "RECOMENDADA": return "badge badge-accent";
    default: return "badge badge-muted";
  }
}

export default function PendentesTable({ modules }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterSev, setFilterSev] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Severidade</span>
          <select className="select-styled" value={filterSev} onChange={(e) => setFilterSev(e.target.value)}>
            <option value="all">Todas</option>
            <option value="BLOQ">BLOQ</option>
            <option value="ALTA">ALTA</option>
            <option value="MEDIA">MEDIA</option>
            <option value="BAIXA">BAIXA</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Status</span>
          <select className="select-styled" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos</option>
            <option value="ABERTA">ABERTA</option>
            <option value="DECIDIDA">DECIDIDA</option>
            <option value="IMPLEMENTADA">IMPLEMENTADA</option>
            <option value="RECOMENDADA">RECOMENDADA</option>
          </select>
        </div>
      </div>

      {modules.map((mod) => {
        let pens = mod.pendentes;
        if (filterSev !== "all") pens = pens.filter((p) => p.severidade.toUpperCase() === filterSev);
        if (filterStatus !== "all") pens = pens.filter((p) => p.status === filterStatus);

        const openCount = pens.filter((p) => p.status === "ABERTA").length;
        const pct = pens.length > 0
          ? Math.round(((pens.length - openCount) / pens.length) * 100)
          : 100;
        const isOpen = expanded === mod.id;

        return (
          <div key={mod.id} className="accordion-item">
            <div className="accordion-header" onClick={() => toggle(mod.id)}>
              <span style={{
                fontSize: 11,
                width: 18,
                textAlign: "center",
                color: "var(--text-muted)",
                transition: "transform 0.15s",
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                display: "inline-block",
              }}>
                &#9654;
              </span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 12, minWidth: 70, color: "var(--text-primary)" }}>
                {mod.id}
              </span>
              <span style={{ fontSize: 12.5, flex: 1, color: "var(--text-secondary)" }}>{mod.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="progress-bar" style={{ width: 80 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? "var(--ready)" : "var(--draft)",
                    }}
                  />
                </div>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 50, textAlign: "right" }}>
                  {pens.length}
                </span>
              </div>
            </div>

            {isOpen && pens.length > 0 && (
              <div className="accordion-body">
                <table className="data-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 110 }}>ID</th>
                      <th style={{ width: 80 }}>Severidade</th>
                      <th style={{ width: 60 }}>Dominio</th>
                      <th>Titulo</th>
                      <th style={{ width: 110 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pens.map((p) => (
                      <tr key={p.id}>
                        <td className="mono" style={{ fontSize: 11 }}>{p.id}</td>
                        <td>
                          <span className={sevClass(p.severidade)} style={{ fontWeight: 700, fontSize: 11 }}>
                            {p.severidade}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: 10 }}>{p.dominio}</td>
                        <td style={{ color: "var(--text-primary)" }}>{p.title}</td>
                        <td><span className={statusBadge(p.status)}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {isOpen && pens.length === 0 && (
              <div className="accordion-body" style={{ padding: "8px 16px 16px", fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                Nenhuma pendencia com os filtros atuais.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
