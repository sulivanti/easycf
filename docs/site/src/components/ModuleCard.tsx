import { useState } from "react";
import type { Module } from "@lib/types";

interface Props {
  mod: Module;
}

const STATUS_COLORS: Record<string, string> = {
  READY: "var(--ready-dim)",
  DRAFT: "var(--draft-dim)",
  APPROVED: "var(--approved-dim)",
};

function badgeClass(estado: string): string {
  switch (estado) {
    case "READY": return "badge badge-ready";
    case "DRAFT": return "badge badge-draft";
    case "APPROVED": return "badge badge-approved";
    default: return "badge badge-muted";
  }
}

function sevClass(sev: string): string {
  const s = sev.toUpperCase();
  if (s === "BLOQ") return "sev-bloq";
  if (s === "ALTA") return "sev-alta";
  if (s === "MEDIA" || s === "MÉDIA") return "sev-media";
  if (s === "BAIXA") return "sev-baixa";
  return "";
}

const SEV_COLOR: Record<string, string> = {
  CRITICA: "var(--sev-bloq)",
  BLOQ: "var(--sev-bloq)",
  ALTA: "var(--sev-alta)",
  MEDIA: "var(--sev-media)",
  BAIXA: "var(--sev-baixa)",
};

export default function ModuleCard({ mod }: Props) {
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const openPendentes = mod.pendentes.filter((p) => p.status === "ABERTA").length;
  const totalPendentes = mod.pendentes.length;
  const resolvedPct = totalPendentes > 0
    ? Math.round(((totalPendentes - openPendentes) / totalPendentes) * 100)
    : 100;

  const accentColor = STATUS_COLORS[mod.estado] || "var(--text-muted)";

  const filtered = filterStatus === "all"
    ? mod.pendentes
    : mod.pendentes.filter((p) => p.status === filterStatus);

  return (
    <div
      className="card"
      style={{
        position: "relative",
        borderLeft: `3px solid ${accentColor}`,
        padding: "18px 18px 16px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              {mod.id}
            </span>
            <span className={badgeClass(mod.estado)}>{mod.estado}</span>
            <span className="badge badge-muted" style={{ fontSize: 9 }}>{mod.version}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{mod.name}</div>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>
          {mod.owner}
        </div>
      </div>

      {/* Phase bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 3, flex: 1 }}>
          {[0, 1, 2, 3, 4, 5].map((p) => (
            <div
              key={p}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background:
                  p < mod.phase ? "var(--ready)" :
                  p === mod.phase ? "var(--draft)" :
                  "var(--phase-empty)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
          {mod.phase}/5
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Features</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {mod.featuresReady}
            <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 12 }}>/{mod.featuresTotal}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Pendencias</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {openPendentes > 0 ? (
              <span style={{ color: "var(--sev-alta)" }}>{openPendentes}</span>
            ) : (
              <span style={{ color: "var(--ready)" }}>0</span>
            )}
            <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 12 }}> / {totalPendentes}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 14 }}>
        <div
          className="progress-fill"
          style={{
            width: `${resolvedPct}%`,
            background: resolvedPct === 100
              ? "var(--ready)"
              : `linear-gradient(90deg, var(--ready-dim), var(--draft-dim))`,
          }}
        />
      </div>

      {/* Deps */}
      {mod.deps.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
          {mod.deps.map((d) => (
            <span key={d} className="mono" style={{
              fontSize: 9,
              color: "var(--text-muted)",
              background: "var(--bg-surface)",
              padding: "1px 6px",
              borderRadius: 100,
            }}>
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Next action */}
      {mod.nextAction !== "Manutencao" && (
        <div className="cmd-box" style={{ padding: "6px 10px", fontSize: 10.5 }}>
          <span className="cmd-prefix">$</span>
          <span className="cmd-text">{mod.nextCmd}</span>
        </div>
      )}

      {/* Pendentes expandable */}
      {totalPendentes > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            onClick={() => setOpen(!open)}
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px 0",
              display: "flex",
              alignItems: "center",
              gap: 6,
              userSelect: "none",
            }}
          >
            <span style={{
              fontSize: 8,
              transition: "transform 0.15s",
              display: "inline-block",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}>&#9654;</span>
            {totalPendentes} pendencias ({openPendentes} abertas)
          </div>

          {open && (
            <div style={{ marginTop: 8 }}>
              {/* Filters */}
              <div style={{ display: "flex", gap: 3, marginBottom: 8, flexWrap: "wrap" }}>
                {["all", "ABERTA", "DECIDIDA", "IMPLEMENTADA"].map((f) => (
                  <button
                    key={f}
                    onClick={(e) => { e.stopPropagation(); setFilterStatus(f); }}
                    className={`filter-pill ${filterStatus === f ? "active" : ""}`}
                    style={{ padding: "3px 10px", fontSize: 10 }}
                  >
                    {f === "all" ? "Todos" : f}
                    {f !== "all" && (
                      <span style={{ marginLeft: 4, opacity: 0.6 }}>
                        {mod.pendentes.filter((p) => p.status === f).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* List */}
              {filtered.map((p) => {
                const sevColor = SEV_COLOR[p.severidade] || "var(--text-muted)";
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 0",
                      fontSize: 11,
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span className="mono" style={{ color: "var(--text-muted)", minWidth: 90, fontSize: 10 }}>{p.id}</span>
                    <span style={{
                      fontWeight: 600, minWidth: 45, fontSize: 10,
                      color: sevColor,
                    }}>
                      {p.severidade}
                    </span>
                    <span style={{ color: "var(--text-secondary)", flex: 1, fontSize: 11 }}>{p.title}</span>
                    <span className={badgeClass(p.status)} style={{ fontSize: 9 }}>{p.status}</span>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", padding: "8px 0" }}>
                  Nenhuma pendencia com este filtro.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
