import { useState, useMemo } from "react";
import type { UserStory, Feature, Section } from "@lib/parse-user-stories";

interface Props {
  stories: UserStory[];
}

function statusBadge(status: string): string {
  const s = status.toUpperCase();
  if (s === "READY") return "badge badge-ready";
  if (s === "APPROVED") return "badge badge-approved";
  if (s === "DRAFT") return "badge badge-draft";
  if (s === "TODO") return "badge badge-danger";
  return "badge badge-muted";
}

function nivelLabel(nivel: number): { text: string; color: string; bg: string } {
  switch (nivel) {
    case 0: return { text: "N0 CRUD", color: "var(--text-muted)", bg: "var(--bg-surface)" };
    case 1: return { text: "N1 Clean", color: "var(--approved-fg)", bg: "var(--approved-bg)" };
    case 2: return { text: "N2 DDD", color: "var(--accent-fg)", bg: "var(--accent-bg)" };
    default: return { text: `N${nivel}`, color: "var(--text-muted)", bg: "var(--bg-surface)" };
  }
}

// ── Gherkin visual renderer ──────────────────────────────────
// Transforms Gherkin code blocks into visual scenario cards.

function renderGherkinCards(code: string): string {
  const lines = code.split("\n");
  let featureTitle = "";
  const scenarios: { title: string; steps: { type: string; icon: string; color: string; text: string }[] }[] = [];
  let current: typeof scenarios[0] | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Feature title
    const featMatch = line.match(/^(?:Funcionalidade|Feature):\s*(.+)/);
    if (featMatch) {
      featureTitle = escapeHtml(featMatch[1]);
      continue;
    }

    // Scenario
    const scenMatch = line.match(/^(?:Cenário|Scenario|Esquema do Cenário|Scenario Outline):\s*(.+)/);
    if (scenMatch) {
      current = { title: escapeHtml(scenMatch[1]), steps: [] };
      scenarios.push(current);
      continue;
    }

    if (!current) continue;

    // Steps
    const stepMatch = line.match(/^(Dado que|Dado|Given|Quando|When|Então|Then|E\s|And\s|Mas|But)\s*(.+)/);
    if (stepMatch) {
      const kw = stepMatch[1].trim();
      let type: string;
      let icon: string;
      let color: string;

      if (/^(Dado|Given)/.test(kw)) {
        type = "Pre-condicao";
        icon = "&#9679;";  // bullet
        color = "var(--approved-fg)";
      } else if (/^(Quando|When)/.test(kw)) {
        type = "Acao";
        icon = "&#9654;";  // play
        color = "var(--draft-fg)";
      } else if (/^(Ent[aã]o|Then)/.test(kw)) {
        type = "Resultado";
        icon = "&#10003;"; // check
        color = "var(--ready-fg)";
      } else {
        // E / And / Mas / But — inherit type from previous step
        const prev = current.steps[current.steps.length - 1];
        type = prev?.type || "";
        icon = prev?.icon || "&#8226;";
        color = prev?.color || "var(--text-secondary)";
      }

      let text = escapeHtml(stepMatch[2]);
      // Highlight quoted values
      text = text.replace(/&quot;([^&]+)&quot;/g, '<code>$1</code>');
      text = text.replace(/"([^"]+)"/g, '<code>$1</code>');

      current.steps.push({ type, icon, color, text });
    }
  }

  // Build HTML
  let out = '<div class="gherkin-visual">';

  if (featureTitle) {
    out += `<div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid var(--border);">${featureTitle}</div>`;
  }

  for (const sc of scenarios) {
    out += '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:10px;">';
    out += `<div style="font-size:13px;font-weight:700;color:var(--accent-fg);margin-bottom:10px;">${sc.title}</div>`;

    for (const step of sc.steps) {
      out += `<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 0;font-size:12.5px;line-height:1.55;">`;
      out += `<span style="color:${step.color};font-size:11px;flex-shrink:0;margin-top:2px;width:14px;text-align:center;">${step.icon}</span>`;
      out += `<span style="color:var(--text-secondary);">${step.text}</span>`;
      out += `</div>`;
    }

    out += '</div>';
  }

  out += '</div>';
  return out;
}

// ── Markdown renderer ────────────────────────────────────────
// Handles: bold, code, lists, blockquotes, code blocks (with Gherkin),
// tables (full HTML), and paragraphs.

function renderMarkdown(md: string): string {
  let html = md.replace(/\r\n/g, "\n");

  // Code blocks (must be first to protect content)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const isGherkin = lang === "gherkin" || /^\s*(Funcionalidade|Feature|Cenário|Scenario|Dado|Given|Quando|When|Então|Then|E\s|And\s|Mas|But)/m.test(code);

    if (isGherkin) {
      return renderGherkinCards(code);
    }

    const formatted = escapeHtml(code.trimEnd());
    return `<pre><code>${formatted}</code></pre>`;
  });

  // Inline code (protect from further transforms)
  const codeMap: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    codeMap.push(code);
    return `%%CODE${codeMap.length - 1}%%`;
  });

  // Tables
  html = html.replace(/((?:\|.+\|\n)+)/g, (tableBlock) => {
    const rows = tableBlock.trim().split("\n").filter(Boolean);
    if (rows.length < 2) return tableBlock;

    // Check if row 2 is separator (|---|---|)
    const isSep = (r: string) => /^\|[\s\-:|]+\|$/.test(r.trim());
    const hasSep = rows.length >= 2 && isSep(rows[1]);

    const parseCells = (row: string) =>
      row.split("|").slice(1, -1).map((c) => c.trim());

    let out = '<table>';
    const startData = hasSep ? 2 : 1;

    // Header
    const hCells = parseCells(rows[0]);
    out += '<thead><tr>';
    for (const c of hCells) out += `<th>${c}</th>`;
    out += '</tr></thead>';

    // Body
    out += '<tbody>';
    for (let i = startData; i < rows.length; i++) {
      if (isSep(rows[i])) continue;
      const cells = parseCells(rows[i]);
      out += '<tr>';
      for (const c of cells) out += `<td>${c}</td>`;
      out += '</tr>';
    }
    out += '</tbody></table>';
    return out;
  });

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Blockquotes
  html = html.replace(/^>\s*(.+)/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^- (.+)/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)/gm, '<li>$1</li>');

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p>\s*<(pre|table|ul|ol|blockquote)/g, '<$1');
  html = html.replace(/<\/(pre|table|ul|ol|blockquote)>\s*<\/p>/g, '</$1>');
  html = html.replace(/<p>\s*<\/p>/g, '');

  // Restore inline code
  html = html.replace(/%%CODE(\d+)%%/g, (_, idx) => `<code>${escapeHtml(codeMap[+idx])}</code>`);

  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Section Content ──────────────────────────────────────────

function SectionContent({ section }: { section: Section }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{
        fontSize: section.level === 2 ? 15 : 13,
        fontWeight: 700,
        color: section.level === 2 ? "var(--text-primary)" : "var(--text-secondary)",
        marginBottom: 10,
        paddingBottom: section.level === 2 ? 6 : 0,
        borderBottom: section.level === 2 ? "1px solid var(--border)" : "none",
        letterSpacing: "-0.01em",
      }}>
        {section.heading}
      </h4>
      <div
        className="md-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
      />
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────

function FeatureCard({ feat, isActive, onClick }: { feat: Feature; isActive: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 14px",
        background: isActive ? "var(--accent-bg)" : "var(--bg-card)",
        border: isActive ? "1px solid var(--accent-dim)" : "1px solid var(--border)",
        borderRadius: 10,
        cursor: "pointer",
        transition: "all 0.15s ease",
        marginBottom: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: isActive ? "var(--accent-fg)" : "var(--text-secondary)" }}>
          {feat.id.replace(/^US-MOD-\d{3}-/, "")}
        </span>
        <span className={statusBadge(feat.status)} style={{ fontSize: 9 }}>{feat.status}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{feat.title}</div>
      {feat.tipo && (
        <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 3 }}>{feat.tipo}</div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

export default function UserStoryViewer({ stories }: Props) {
  const [selectedEpic, setSelectedEpic] = useState<string | null>(stories[0]?.id || null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => {
    if (filterStatus === "all") return stories;
    return stories.filter((s) => s.status.toUpperCase() === filterStatus);
  }, [stories, filterStatus]);

  const epic = stories.find((s) => s.id === selectedEpic);
  const feature = epic?.features.find((f) => f.id === selectedFeature);
  const viewItem = feature || epic;
  const viewSections = viewItem?.sections || [];

  const totalFeatures = stories.reduce((s, e) => s + e.features.length, 0);
  const readyFeatures = stories.reduce(
    (s, e) => s + e.features.filter((f) => f.status.toUpperCase() === "READY").length,
    0,
  );

  return (
    <div>
      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--accent)" }}>{stories.length}</div>
          <div className="stat-label">Epicos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--approved)" }}>{totalFeatures}</div>
          <div className="stat-label">Features</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--ready)" }}>{readyFeatures}</div>
          <div className="stat-label">READY</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--draft)" }}>{totalFeatures - readyFeatures}</div>
          <div className="stat-label">Pendentes</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 18, display: "flex", gap: 4 }}>
        {["all", "READY", "APPROVED", "DRAFT", "TODO"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`filter-pill ${filterStatus === f ? "active" : ""}`}
          >
            {f === "all" ? "Todos" : f}
          </button>
        ))}
      </div>

      {/* Three-column layout */}
      <div style={{ display: "flex", gap: 12, minHeight: "calc(100vh - 360px)" }}>

        {/* Left: Epic list */}
        <div style={{
          flex: "0 0 20%",
          minWidth: 200,
          overflowY: "auto",
          maxHeight: "calc(100vh - 360px)",
          paddingRight: 4,
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}>
            Epicos ({filtered.length})
          </div>
          {filtered.map((s) => {
            const nl = nivelLabel(s.nivel);
            const featReady = s.features.filter((f) => f.status.toUpperCase() === "READY").length;
            const isSelected = selectedEpic === s.id;
            return (
              <div
                key={s.id}
                onClick={() => { setSelectedEpic(s.id); setSelectedFeature(null); }}
                style={{
                  padding: "10px 12px",
                  background: isSelected ? "var(--accent-bg)" : "transparent",
                  border: isSelected ? "1px solid var(--accent-dim)" : "1px solid transparent",
                  borderRadius: 10,
                  cursor: "pointer",
                  marginBottom: 2,
                  transition: "all 0.12s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: isSelected ? "var(--accent-fg)" : "var(--text-secondary)" }}>
                    {s.moduleId}
                  </span>
                  <span className={statusBadge(s.status)} style={{ fontSize: 9 }}>{s.status}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.35 }}>
                  {s.moduleName || s.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
                  <span style={{ color: nl.color, background: nl.bg, padding: "0 5px", borderRadius: 100, fontSize: 9, fontWeight: 600 }}>
                    {nl.text}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {featReady}/{s.features.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Features list */}
        {epic && (
          <div style={{
            flex: "0 0 25%",
            minWidth: 220,
            overflowY: "auto",
            maxHeight: "calc(100vh - 360px)",
            borderLeft: "1px solid var(--border)",
            paddingLeft: 12,
            paddingRight: 4,
          }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}>
              {epic.id} — {epic.features.length} features
            </div>

            {/* Epic card */}
            <div
              onClick={() => setSelectedFeature(null)}
              style={{
                padding: "10px 14px",
                background: !selectedFeature ? "var(--accent-bg)" : "var(--bg-card)",
                border: !selectedFeature ? "1px solid var(--accent-dim)" : "1px solid var(--border)",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 8,
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-fg)" }}>Epico</span>
                <span className={statusBadge(epic.status)} style={{ fontSize: 9 }}>{epic.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.4 }}>{epic.title}</div>
            </div>

            {epic.features.map((f) => (
              <FeatureCard
                key={f.id}
                feat={f}
                isActive={selectedFeature === f.id}
                onClick={() => setSelectedFeature(f.id)}
              />
            ))}
          </div>
        )}

        {/* Right: Content preview */}
        {viewItem && (
          <div style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 360px)",
            borderLeft: "1px solid var(--border)",
            paddingLeft: 20,
            paddingRight: 8,
          }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: "var(--accent-fg)", letterSpacing: "-0.01em" }}>
                  {viewItem.id}
                </span>
                <span className={statusBadge(viewItem.status)}>{viewItem.status}</span>
                <span className="badge badge-muted">{viewItem.version}</span>
                {(() => {
                  const nl = nivelLabel(viewItem.nivel);
                  return <span style={{ color: nl.color, background: nl.bg, padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 600 }}>{nl.text}</span>;
                })()}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                {"title" in viewItem ? viewItem.title : ""}
              </h2>

              {/* Meta chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {viewItem.owner && (
                  <span className="badge badge-muted" style={{ fontSize: 10 }}>
                    Owner: {viewItem.owner}
                  </span>
                )}
                {viewItem.date && (
                  <span className="badge badge-muted" style={{ fontSize: 10 }}>{viewItem.date}</span>
                )}
                {"tipo" in viewItem && viewItem.tipo && (
                  <span className="badge badge-accent" style={{ fontSize: 10 }}>{viewItem.tipo}</span>
                )}
                {"manifests" in viewItem && (viewItem as Feature).manifests.length > 0 && (
                  <span className="badge badge-approved" style={{ fontSize: 10 }}>
                    Manifests: {(viewItem as Feature).manifests.join(", ")}
                  </span>
                )}
              </div>

              {/* Rastreia */}
              {viewItem.rastreiaPara.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>Rastreia:</span>
                  {viewItem.rastreiaPara.map((r, i) => (
                    <span key={i} className="mono" style={{
                      fontSize: 9.5,
                      color: "var(--approved-fg)",
                      background: "var(--approved-bg)",
                      padding: "1px 7px",
                      borderRadius: 100,
                    }}>
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />

            {/* Sections */}
            {viewSections.map((sec, i) => (
              <SectionContent key={i} section={sec} />
            ))}

            {viewSections.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", padding: 24, textAlign: "center" }}>
                Sem conteudo detalhado neste artefato.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
