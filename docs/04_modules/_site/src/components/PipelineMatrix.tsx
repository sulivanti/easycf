import type { Module } from "@lib/types";
import { PHASES } from "@lib/types";

interface Props {
  modules: Module[];
}

function phaseCell(modulePhase: number, phaseId: number) {
  const done = phaseId < modulePhase;
  const current = phaseId === modulePhase;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 700,
      background: done
        ? "var(--ready-bg)"
        : current
          ? "var(--draft-bg)"
          : "transparent",
      color: done
        ? "var(--ready)"
        : current
          ? "var(--draft)"
          : "var(--text-muted)",
      transition: "all 0.15s",
    }}>
      {done ? "✓" : current ? "●" : "○"}
    </span>
  );
}

function badgeClass(estado: string): string {
  return estado === "READY" ? "badge badge-ready"
    : estado === "APPROVED" ? "badge badge-approved"
    : "badge badge-draft";
}

export default function PipelineMatrix({ modules }: Props) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="pipeline-table">
        <thead>
          <tr>
            <th style={{ textAlign: "left", minWidth: 220 }}>Modulo</th>
            <th style={{ minWidth: 70 }}>Estado</th>
            {PHASES.map((p) => (
              <th key={p.id} style={{ minWidth: 90 }}>
                <span style={{ fontSize: 13 }}>{p.icon}</span><br/>
                <span style={{ fontSize: 9 }}>{p.label}</span>
              </th>
            ))}
            <th style={{ textAlign: "left", minWidth: 200 }}>Proxima Acao</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((mod) => (
            <tr key={mod.id}>
              <td style={{ textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 12, color: "var(--text-primary)" }}>
                    {mod.id}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{mod.name}</span>
                </div>
              </td>
              <td>
                <span className={badgeClass(mod.estado)}>{mod.estado}</span>
              </td>
              {PHASES.map((p) => (
                <td key={p.id}>
                  {phaseCell(mod.phase, p.id)}
                </td>
              ))}
              <td style={{ textAlign: "left" }}>
                {mod.nextAction === "Manutencao" ? (
                  <span className="badge badge-ready" style={{ fontSize: 10 }}>Concluido — Manutencao</span>
                ) : (
                  <div className="cmd-box" style={{ padding: "4px 8px", fontSize: 10 }}>
                    <span className="cmd-prefix">$</span>
                    <span className="cmd-text">{mod.nextCmd}</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
