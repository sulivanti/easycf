import { useState, useMemo, useCallback } from "react";
import type { PenModulo, PendenteFull } from "@lib/parse-pendentes-full";

interface Props {
  modules: PenModulo[];
}

const SEV_STYLE: Record<string, { color: string; label: string }> = {
  CRITICA: { color: "var(--danger)", label: "CRITICA" },
  BLOQ:    { color: "var(--danger)", label: "BLOQ" },
  ALTA:    { color: "var(--sev-alta)", label: "ALTA" },
  MEDIA:   { color: "var(--sev-media)", label: "MEDIA" },
  BAIXA:   { color: "var(--sev-baixa)", label: "BAIXA" },
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  ABERTA:       { bg: "var(--danger-bg)", fg: "var(--danger-fg)" },
  DECIDIDA:     { bg: "var(--approved-bg)", fg: "var(--approved-fg)" },
  IMPLEMENTADA: { bg: "var(--ready-bg)", fg: "var(--ready-fg)" },
  RECOMENDADA:  { bg: "var(--accent-bg)", fg: "var(--accent-fg)" },
};

function Badge({ children, bg, fg, style: st }: { children: React.ReactNode; bg: string; fg: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 100,
      fontSize: 11, fontWeight: 600, lineHeight: "18px",
      background: bg, color: fg, whiteSpace: "nowrap", ...st,
    }}>{children}</span>
  );
}

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    // Fallback for non-HTTPS contexts
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        });
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, [text]);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); handleCopy(); }}
      title={`Copiar: ${text}`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 6,
        border: copied ? "1px solid var(--ready-dim)" : "1px solid var(--border)",
        background: copied ? "var(--ready-bg)" : "var(--cmd-bg)",
        color: copied ? "var(--ready-fg)" : "var(--text-secondary)",
        fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer",
        transition: "all 0.15s", whiteSpace: "nowrap", maxWidth: "100%",
        overflow: "hidden", textOverflow: "ellipsis",
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0 }}>{copied ? "✓ Copiado!" : "⧉"}</span>
      {!copied && (label || text)}
    </button>
  );
}

function CommandBlock({ pen, pendente }: { pen: string; pendente: PendenteFull }) {
  const cmds: { label: string; cmd: string; highlight?: boolean }[] = [];

  if (pendente.status === "ABERTA" && pendente.opcoes.length > 0) {
    // Show decide for each option
    for (const o of pendente.opcoes) {
      cmds.push({
        label: `Decidir Opcao ${o.letra}`,
        cmd: `/manage-pendentes decide ${pen} ${pendente.id} opcao=${o.letra}`,
        highlight: o.recomendada,
      });
    }
  } else if (pendente.status === "ABERTA" && pendente.opcoes.length === 0) {
    // No options — direct decide
    cmds.push({
      label: "Decidir",
      cmd: `/manage-pendentes decide ${pen} ${pendente.id}`,
    });
  }

  if (pendente.status === "DECIDIDA" || pendente.status === "ABERTA") {
    // Artefatos for edição direta
    if (pendente.artefatoSaida) {
      cmds.push({
        label: `Edicao direta (DRAFT) — ${pendente.artefatoSaida}`,
        cmd: `Edicao direta (DRAFT) — ${pendente.artefatoSaida}`,
      });
    }
  }

  if (pendente.status === "DECIDIDA") {
    cmds.push({
      label: "Implementar",
      cmd: `/manage-pendentes implement ${pen} ${pendente.id}`,
    });
  }

  // Full workflow (decide + implement)
  if (pendente.status === "ABERTA" && pendente.opcoes.length > 0) {
    const rec = pendente.opcoes.find((o) => o.recomendada);
    if (rec) {
      const fullCmd = [
        `/manage-pendentes decide ${pen} ${pendente.id} opcao=${rec.letra}`,
        pendente.artefatoSaida ? `Edicao direta (DRAFT) — ${pendente.artefatoSaida}` : null,
        `/manage-pendentes implement ${pen} ${pendente.id}`,
      ].filter(Boolean).join("\n");
      cmds.push({
        label: "Copiar fluxo completo (recomendado)",
        cmd: fullCmd,
        highlight: true,
      });
    }
  }

  if (cmds.length === 0) return null;

  return (
    <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--cmd-bg)", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>
        Comandos
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {cmds.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {c.highlight && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />}
            <CopyBtn text={c.cmd} label={c.label} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Resumo ──────────────────────────────────────────────

function TabResumo({ modules }: Props) {
  const allPen = modules.flatMap((m) => m.pendentes);
  const sevCounts = {
    critica: allPen.filter((p) => p.severidade === "CRITICA").length,
    bloq: allPen.filter((p) => p.severidade === "BLOQ").length,
    alta: allPen.filter((p) => p.severidade === "ALTA").length,
    media: allPen.filter((p) => p.severidade === "MEDIA").length,
    baixa: allPen.filter((p) => p.severidade === "BAIXA").length,
  };
  const statusCounts = {
    aberta: allPen.filter((p) => p.status === "ABERTA").length,
    decidida: allPen.filter((p) => p.status === "DECIDIDA").length,
    implementada: allPen.filter((p) => p.status === "IMPLEMENTADA").length,
  };

  return (
    <div>
      {/* Severity + Status summary */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--text-primary)" }}>{allPen.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--danger)" }}>{sevCounts.critica + sevCounts.bloq}</div>
          <div className="stat-label">Critica / Bloq</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--sev-alta)" }}>{sevCounts.alta}</div>
          <div className="stat-label">Alta</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--sev-media)" }}>{sevCounts.media}</div>
          <div className="stat-label">Media</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--danger)" }}>{statusCounts.aberta}</div>
          <div className="stat-label">Abertas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--ready)" }}>{statusCounts.implementada}</div>
          <div className="stat-label">Implementadas</div>
        </div>
      </div>

      {/* Per module table */}
      <div className="card-header">Por Modulo</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>PEN</th>
              <th>Modulo</th>
              <th style={{ textAlign: "center" }}>Total</th>
              <th style={{ textAlign: "center" }}>Abertas</th>
              <th style={{ textAlign: "center" }}>Implementadas</th>
              <th style={{ textAlign: "center" }}>Opcoes</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => {
              const ab = m.pendentes.filter((p) => p.status === "ABERTA").length;
              const imp = m.pendentes.filter((p) => p.status === "IMPLEMENTADA").length;
              const opts = m.pendentes.reduce((s, p) => s + p.opcoes.length, 0);
              return (
                <tr key={m.pen}>
                  <td className="mono" style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 12 }}>{m.pen}</td>
                  <td style={{ color: "var(--text-primary)" }}>{m.moduloNome}</td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{m.pendentes.length}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: ab > 0 ? "var(--danger)" : "var(--ready)" }}>{ab}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "var(--ready)" }}>{imp}</td>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{opts || "—"}</td>
                  <td style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.owner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Todas Pendencias ────────────────────────────────────

function TabPendencias({ modules }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterSev, setFilterSev] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "ABERTA", "DECIDIDA", "IMPLEMENTADA"].map((f) => (
          <button key={f} onClick={() => setFilterStatus(f)} className={`filter-pill ${filterStatus === f ? "active" : ""}`}>
            {f === "all" ? "Todos Status" : f}
          </button>
        ))}
        <span style={{ width: 8 }} />
        {["all", "CRITICA", "ALTA", "MEDIA", "BAIXA"].map((f) => (
          <button key={f} onClick={() => setFilterSev(f)} className={`filter-pill ${filterSev === f ? "active" : ""}`}>
            {f === "all" ? "Todas Sev" : f}
          </button>
        ))}
      </div>

      {modules.map((mod) => {
        let pens = mod.pendentes;
        if (filterStatus !== "all") pens = pens.filter((p) => p.status === filterStatus);
        if (filterSev !== "all") pens = pens.filter((p) => p.severidade === filterSev);
        if (pens.length === 0) return null;

        return (
          <div key={mod.pen} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-fg)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mono">{mod.pen}</span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{mod.moduloNome}</span>
              <Badge bg="var(--bg-surface)" fg="var(--text-muted)">{pens.length}</Badge>
            </div>

            {pens.map((p) => {
              const sev = SEV_STYLE[p.severidade] || { color: "var(--text-muted)", label: p.severidade };
              const ss = STATUS_STYLE[p.status] || { bg: "var(--bg-surface)", fg: "var(--text-secondary)" };
              const key = `${mod.pen}-${p.id}`;
              const isOpen = expanded === key;

              return (
                <div key={key} className="card" style={{
                  marginBottom: 8, padding: 0, overflow: "hidden",
                  borderLeft: `3px solid ${sev.color}`,
                }}>
                  {/* Header */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "14px 16px", cursor: "pointer",
                    }}
                  >
                    <span style={{
                      fontSize: 12, width: 18, textAlign: "center",
                      color: "var(--text-muted)", transition: "transform 0.15s",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}>&#9654;</span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", minWidth: 120 }}>
                      {p.id}
                    </span>
                    <Badge bg={`color-mix(in srgb, ${sev.color} 15%, transparent)`} fg={sev.color}>{sev.label}</Badge>
                    {p.dominio !== "—" && <Badge bg="var(--bg-surface)" fg="var(--text-secondary)">{p.dominio}</Badge>}
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                      {p.titulo}
                    </span>
                    <Badge bg={ss.bg} fg={ss.fg}>{p.status}</Badge>
                    {p.opcaoEscolhida && (
                      <Badge bg="var(--ready-bg)" fg="var(--ready-fg)">Opcao {p.opcaoEscolhida}</Badge>
                    )}
                  </div>

                  {/* Body */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 18px 44px" }}>
                      {/* Questao / Descricao */}
                      {p.questao && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>Questao</div>
                          <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>{p.questao}</div>
                        </div>
                      )}

                      {p.impacto && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>Impacto</div>
                          <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>{p.impacto}</div>
                        </div>
                      )}

                      {/* Options side by side */}
                      {p.opcoes.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>Opcoes</div>
                          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(p.opcoes.length, 3)}, 1fr)`, gap: 10 }}>
                            {p.opcoes.map((o) => {
                              const chosen = p.opcaoEscolhida === o.letra;
                              return (
                                <div key={o.letra} style={{
                                  padding: 14, borderRadius: 10,
                                  background: chosen ? "rgba(52,211,153,0.04)" : o.recomendada ? "rgba(139,92,246,0.03)" : "var(--bg-surface)",
                                  border: chosen ? "1px solid rgba(52,211,153,0.25)" : o.recomendada ? "1px solid rgba(139,92,246,0.15)" : "1px solid var(--border-subtle)",
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                      width: 26, height: 26, borderRadius: 6,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: 13, fontWeight: 800,
                                      background: chosen ? "var(--ready-bg)" : o.recomendada ? "var(--accent-bg)" : "var(--bg-surface)",
                                      color: chosen ? "var(--ready-fg)" : o.recomendada ? "var(--accent-fg)" : "var(--text-muted)",
                                    }}>{o.letra}</span>
                                    {chosen && <Badge bg="var(--ready-bg)" fg="var(--ready-fg)" style={{ fontSize: 10 }}>Escolhida</Badge>}
                                    {o.recomendada && !chosen && <Badge bg="var(--accent-bg)" fg="var(--accent-fg)" style={{ fontSize: 10 }}>Recomendada</Badge>}
                                  </div>
                                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, marginBottom: 8, lineHeight: 1.45 }}>
                                    {o.titulo}
                                  </div>
                                  {o.descricao && <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.55 }}>{o.descricao}</div>}
                                  {o.pros && (
                                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                                      <span style={{ color: "var(--ready)", fontWeight: 700 }}>+</span>{" "}
                                      <span style={{ color: "var(--text-secondary)" }}>{o.pros}</span>
                                    </div>
                                  )}
                                  {o.contras && (
                                    <div style={{ fontSize: 12 }}>
                                      <span style={{ color: "var(--danger)", fontWeight: 700 }}>−</span>{" "}
                                      <span style={{ color: "var(--text-secondary)" }}>{o.contras}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      {p.recomendacao && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>Recomendacao</div>
                          <div style={{
                            fontSize: 13.5, color: "var(--accent-fg)", lineHeight: 1.55,
                            padding: "10px 14px", background: "var(--accent-bg)",
                            borderLeft: "2px solid var(--accent-dim)", borderRadius: "0 8px 8px 0",
                          }}>{p.recomendacao}</div>
                        </div>
                      )}

                      {/* Resolution */}
                      {p.resolucao && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>Resolucao</div>
                          <div style={{
                            fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65,
                            padding: "10px 14px", background: "rgba(52,211,153,0.04)",
                            borderLeft: "2px solid var(--ready-dim)", borderRadius: "0 8px 8px 0",
                          }}>
                            {p.resolucao.split("\n").map((line, i) => <div key={i}>{line.replace(/^>\s*/, "")}</div>)}
                          </div>
                        </div>
                      )}

                      {/* Metadata chips */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                        {p.rastreiaPara && <Badge bg="var(--bg-surface)" fg="var(--text-muted)" style={{ fontSize: 10 }}>Rastreia: {p.rastreiaPara}</Badge>}
                        {p.tags && <Badge bg="var(--bg-surface)" fg="var(--text-muted)" style={{ fontSize: 10 }}>Tags: {p.tags}</Badge>}
                        {p.artefatoSaida && <Badge bg="var(--ready-bg)" fg="var(--ready-fg)" style={{ fontSize: 10 }}>Saida: {p.artefatoSaida}</Badge>}
                      </div>

                      {/* Copy commands */}
                      <CommandBlock pen={mod.pen} pendente={p} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Checklist ───────────────────────────────────────────

function TabChecklist({ modules }: Props) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [filterSev, setFilterSev] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Show all pendentes (not just ones with options)
  const allDecisoes = modules.flatMap((m) =>
    m.pendentes.map((p) => ({ ...p, penFile: m.pen, moduloNome: m.moduloNome })),
  );

  // Apply filters
  const decisoes = allDecisoes.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterSev !== "all" && c.severidade !== filterSev) return false;
    return true;
  });

  const total = allDecisoes.length;
  const done = allDecisoes.filter((c) => {
    const key = `${c.penFile}-${c.id}`;
    return checks[key] || c.status === "IMPLEMENTADA" || c.status === "DECIDIDA";
  }).length;

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "ABERTA", "DECIDIDA", "IMPLEMENTADA"].map((f) => (
          <button key={f} onClick={() => setFilterStatus(f)} className={`filter-pill ${filterStatus === f ? "active" : ""}`}>
            {f === "all" ? "Todos Status" : f}
          </button>
        ))}
        <span style={{ width: 8 }} />
        {["all", "CRITICA", "ALTA", "MEDIA", "BAIXA"].map((f) => (
          <button key={f} onClick={() => setFilterSev(f)} className={`filter-pill ${filterSev === f ? "active" : ""}`}>
            {f === "all" ? "Todas Sev" : f}
          </button>
        ))}
      </div>

      {/* Counter */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: done === total ? "var(--ready)" : "var(--accent)" }}>
          {done}/{total}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>pendencias resolvidas</span>
        <div className="progress-bar" style={{ flex: 1, maxWidth: 200 }}>
          <div className="progress-fill" style={{
            width: `${total > 0 ? (done / total) * 100 : 0}%`,
            background: done === total ? "var(--ready)" : "var(--accent)",
          }} />
        </div>
      </div>

      {decisoes.map((c) => {
        const key = `${c.penFile}-${c.id}`;
        const isChecked = checks[key] || c.status === "IMPLEMENTADA" || c.status === "DECIDIDA";
        const sev = SEV_STYLE[c.severidade] || { color: "var(--text-muted)", label: c.severidade };
        const rec = c.opcoes.find((o) => o.recomendada);

        return (
          <div
            key={key}
            className="card"
            style={{
              marginBottom: 8, padding: "14px 18px", cursor: "pointer",
              borderLeft: `3px solid ${isChecked ? "var(--ready)" : sev.color}`,
              opacity: isChecked ? 0.65 : 1,
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              onClick={() => setChecks((p) => ({ ...p, [key]: !p[key] }))}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                border: isChecked ? "2px solid var(--ready)" : "2px solid var(--border)",
                background: isChecked ? "var(--ready-bg)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: "var(--ready)", fontWeight: 700,
                transition: "all 0.15s",
              }}>
                {isChecked ? "✓" : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--accent-fg)" }}>{c.penFile}/{c.id}</span>
                  <Badge bg="var(--bg-surface)" fg="var(--text-secondary)">{c.moduloNome}</Badge>
                  <Badge bg={`color-mix(in srgb, ${sev.color} 15%, transparent)`} fg={sev.color}>{sev.label}</Badge>
                  <Badge bg={STATUS_STYLE[c.status]?.bg || "var(--bg-surface)"} fg={STATUS_STYLE[c.status]?.fg || "var(--text-muted)"}>{c.status}</Badge>
                  {c.opcaoEscolhida && <Badge bg="var(--ready-bg)" fg="var(--ready-fg)">Opcao {c.opcaoEscolhida}</Badge>}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.45 }}>
                  {c.titulo}
                </div>
                {rec && (
                  <div style={{ fontSize: 12, color: "var(--accent-fg)", marginTop: 6 }}>
                    Rec: Opcao {rec.letra} — {rec.titulo}
                  </div>
                )}
                {c.opcoes.length > 0 && (
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                    {c.opcoes.map((o) => o.letra).join(" / ")}
                    {c.opcoes.filter((o) => !o.recomendada).length > 0 && (
                      <span> — Alt: {c.opcoes.filter((o) => !o.recomendada).map((o) => `${o.letra}: ${o.titulo.slice(0, 30)}`).join(" | ")}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Copy commands for checklist items */}
            {!isChecked && c.status === "ABERTA" && (
              <div style={{ marginTop: 10, marginLeft: 34 }}>
                <CommandBlock pen={c.penFile} pendente={c} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────

const TABS = [
  { id: "resumo", label: "Resumo" },
  { id: "pendencias", label: "Pendencias" },
  { id: "checklist", label: "Checklist Decisoes" },
];

export default function PlanoAcaoViewer({ modules }: Props) {
  const [tab, setTab] = useState("resumo");

  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 1 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              background: "transparent",
              color: tab === t.id ? "var(--accent-fg)" : "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resumo" && <TabResumo modules={modules} />}
      {tab === "pendencias" && <TabPendencias modules={modules} />}
      {tab === "checklist" && <TabChecklist modules={modules} />}
    </div>
  );
}
