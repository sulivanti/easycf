/**
 * @contract UX-CASE-001, FR-010, FR-002, FR-003, FR-004, FR-005, FR-006, FR-008
 *
 * Case Panel — Detail screen with 4 tabs:
 * 1. Overview (header + progress bar + transition buttons)
 * 2. Gates (resolution/waive)
 * 3. Assignments (assign/reassign)
 * 4. Timeline (interleaved history)
 */

import React, { useState } from "react";
import { useCaseDetail } from "../../hooks/use-cases.js";
import { useTransitionStage, useControlCase, useResolveGate, useWaiveGate, useAssignResponsible, useRecordEvent } from "../../hooks/use-case-actions.js";
import { useTimeline } from "../../hooks/use-timeline.js";
import type { CaseDetail, GateInstance, Assignment, TimelineEntry } from "../../types/case-execution.types.js";

interface CasePanelPageProps {
  caseId: string;
}

type TabId = "overview" | "gates" | "assignments" | "timeline";

export function CasePanelPage({ caseId }: CasePanelPageProps) {
  const { data: caseData, loading, error, refetch } = useCaseDetail(caseId);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (loading) return <CasePanelSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!caseData) return <div>Caso não encontrado.</div>;

  const isReadonly = caseData.status === "COMPLETED" || caseData.status === "CANCELLED";

  return (
    <div className="case-panel">
      <CaseHeader caseData={caseData} />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="case-panel__content">
        {activeTab === "overview" && (
          <OverviewTab caseData={caseData} isReadonly={isReadonly} onRefresh={refetch} />
        )}
        {activeTab === "gates" && (
          <GatesTab caseId={caseId} gates={caseData.current_stage_gates} isReadonly={isReadonly} onRefresh={refetch} />
        )}
        {activeTab === "assignments" && (
          <AssignmentsTab caseId={caseId} assignments={caseData.active_assignments} isReadonly={isReadonly} onRefresh={refetch} />
        )}
        {activeTab === "timeline" && (
          <TimelineTab caseId={caseId} />
        )}
      </div>
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

function CaseHeader({ caseData }: { caseData: CaseDetail }) {
  const statusColors: Record<string, string> = {
    OPEN: "#27AE60", COMPLETED: "#2980B9", CANCELLED: "#E74C3C", ON_HOLD: "#F39C12",
  };

  return (
    <header className="case-header">
      <div className="case-header__title">
        <h1>{caseData.codigo}</h1>
        <span className="case-header__badge" style={{ backgroundColor: statusColors[caseData.status] }}>
          {caseData.status}
        </span>
      </div>
      <div className="case-header__meta">
        <span>Aberto em: {new Date(caseData.opened_at).toLocaleDateString("pt-BR")}</span>
        {caseData.object_type && <span>Objeto: {caseData.object_type}</span>}
      </div>
    </header>
  );
}

// ── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ activeTab, onChange }: { activeTab: TabId; onChange: (t: TabId) => void }) {
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "overview", label: "Visão Geral" },
    { id: "gates", label: "Gates" },
    { id: "assignments", label: "Responsáveis" },
    { id: "timeline", label: "Histórico" },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`tab-bar__item ${activeTab === t.id ? "tab-bar__item--active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ caseData, isReadonly, onRefresh }: { caseData: CaseDetail; isReadonly: boolean; onRefresh: () => void }) {
  const transition = useTransitionStage(caseData.id);
  const control = useControlCase(caseData.id);
  const [motivo, setMotivo] = useState("");

  const pendingGates = caseData.current_stage_gates.filter((g) => g.status === "PENDING");
  const allGatesCleared = pendingGates.length === 0;

  const handleTransition = async (targetStageId: string) => {
    await transition.execute({ target_stage_id: targetStageId, motivo: motivo || undefined });
    onRefresh();
  };

  const handleControl = async (action: string) => {
    await control.execute({ action, reason: motivo || undefined });
    onRefresh();
  };

  return (
    <div className="overview-tab">
      <section className="overview-tab__gates-summary">
        <h3>Gates do Estágio Atual</h3>
        {pendingGates.length > 0 ? (
          <p>{pendingGates.length} gate(s) pendente(s) — transição bloqueada.</p>
        ) : (
          <p>Todos os gates resolvidos.</p>
        )}
      </section>

      {!isReadonly && (
        <section className="overview-tab__actions">
          <h3>Ações</h3>
          <div className="overview-tab__motivo">
            <label htmlFor="motivo">Motivo (opcional)</label>
            <textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={1000} rows={2} />
          </div>
          <div className="overview-tab__buttons">
            {caseData.status === "OPEN" && (
              <>
                <button disabled={!allGatesCleared || transition.loading} onClick={() => handleTransition("")}>
                  {transition.loading ? "Transicionando..." : "Transicionar"}
                </button>
                <button onClick={() => handleControl("ON_HOLD")} disabled={control.loading}>
                  Suspender (ON_HOLD)
                </button>
                <button onClick={() => handleControl("CANCEL")} disabled={control.loading} className="btn--danger">
                  Cancelar
                </button>
              </>
            )}
            {caseData.status === "ON_HOLD" && (
              <>
                <button onClick={() => handleControl("RESUME")} disabled={control.loading}>
                  Retomar
                </button>
                <button onClick={() => handleControl("CANCEL")} disabled={control.loading} className="btn--danger">
                  Cancelar
                </button>
              </>
            )}
          </div>
          {(transition.error || control.error) && (
            <div className="error-message">{(transition.error ?? control.error)?.message}</div>
          )}
        </section>
      )}
    </div>
  );
}

// ── Gates Tab ────────────────────────────────────────────────────────────────

function GatesTab({ caseId, gates, isReadonly, onRefresh }: { caseId: string; gates: GateInstance[]; isReadonly: boolean; onRefresh: () => void }) {
  const resolve = useResolveGate(caseId);
  const waive = useWaiveGate(caseId);
  const [waiveMotivo, setWaiveMotivo] = useState("");

  const handleResolve = async (gateInstanceId: string, decision: string) => {
    await resolve.execute({ gateInstanceId, body: { decision } });
    onRefresh();
  };

  const handleWaive = async (gateInstanceId: string) => {
    await waive.execute({ gateInstanceId, motivo: waiveMotivo });
    setWaiveMotivo("");
    onRefresh();
  };

  if (gates.length === 0) return <div className="empty-state">Nenhum gate neste estágio.</div>;

  return (
    <div className="gates-tab">
      <table>
        <thead>
          <tr><th>Gate</th><th>Status</th><th>Decisão</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {gates.map((g) => (
            <tr key={g.id}>
              <td>{g.gate_id}</td>
              <td>
                <span className={`badge badge--${g.status.toLowerCase()}`}>{g.status}</span>
              </td>
              <td>{g.decision ?? "—"}</td>
              <td>
                {!isReadonly && g.status === "PENDING" && (
                  <div className="gates-tab__actions">
                    <button onClick={() => handleResolve(g.id, "APPROVED")} disabled={resolve.loading}>
                      Aprovar
                    </button>
                    <button onClick={() => handleResolve(g.id, "REJECTED")} disabled={resolve.loading} className="btn--danger">
                      Rejeitar
                    </button>
                    <div className="gates-tab__waive">
                      <input
                        type="text"
                        placeholder="Motivo dispensa (min 20 chars)"
                        value={waiveMotivo}
                        onChange={(e) => setWaiveMotivo(e.target.value)}
                        minLength={20}
                      />
                      <button
                        onClick={() => handleWaive(g.id)}
                        disabled={waive.loading || waiveMotivo.length < 20}
                      >
                        Dispensar
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(resolve.error || waive.error) && (
        <div className="error-message">{(resolve.error ?? waive.error)?.message}</div>
      )}
    </div>
  );
}

// ── Assignments Tab ──────────────────────────────────────────────────────────

function AssignmentsTab({ caseId, assignments, isReadonly, onRefresh }: { caseId: string; assignments: Assignment[]; isReadonly: boolean; onRefresh: () => void }) {
  const assign = useAssignResponsible(caseId);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ process_role_id: "", user_id: "" });

  const handleAssign = async () => {
    await assign.execute(formData);
    setShowForm(false);
    setFormData({ process_role_id: "", user_id: "" });
    onRefresh();
  };

  return (
    <div className="assignments-tab">
      <table>
        <thead>
          <tr><th>Role</th><th>Usuário</th><th>Atribuído em</th><th>Válido até</th><th>Ativo</th></tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.id}>
              <td>{a.process_role_id}</td>
              <td>{a.user_id}</td>
              <td>{new Date(a.assigned_at).toLocaleDateString("pt-BR")}</td>
              <td>{a.valid_until ? new Date(a.valid_until).toLocaleDateString("pt-BR") : "—"}</td>
              <td>{a.is_active ? "Sim" : "Não"}</td>
            </tr>
          ))}
          {assignments.length === 0 && (
            <tr><td colSpan={5} className="empty-state">Nenhuma atribuição ativa.</td></tr>
          )}
        </tbody>
      </table>

      {!isReadonly && (
        <>
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Nova Atribuição"}
          </button>
          {showForm && (
            <form className="assignments-tab__form" onSubmit={(e) => { e.preventDefault(); handleAssign(); }}>
              <input placeholder="Process Role ID" value={formData.process_role_id} onChange={(e) => setFormData({ ...formData, process_role_id: e.target.value })} required />
              <input placeholder="User ID" value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} required />
              <button type="submit" disabled={assign.loading}>
                {assign.loading ? "Atribuindo..." : "Atribuir"}
              </button>
            </form>
          )}
          {assign.error && <div className="error-message">{assign.error.message}</div>}
        </>
      )}
    </div>
  );
}

// ── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({ caseId }: { caseId: string }) {
  const { entries, loading, error } = useTimeline(caseId);

  if (loading) return <div className="loading">Carregando timeline...</div>;
  if (error) return <ErrorState error={error} />;
  if (entries.length === 0) return <div className="empty-state">Nenhum evento registrado.</div>;

  const sourceLabels: Record<string, string> = {
    stage_history: "Transição",
    gate_instance: "Gate",
    case_event: "Evento",
    case_assignment: "Atribuição",
  };

  return (
    <div className="timeline-tab">
      <ul className="timeline">
        {entries.map((entry) => (
          <li key={entry.id} className={`timeline__item timeline__item--${entry.source}`}>
            <div className="timeline__header">
              <span className="timeline__source">{sourceLabels[entry.source]}</span>
              <time className="timeline__time">{new Date(entry.timestamp).toLocaleString("pt-BR")}</time>
            </div>
            <div className="timeline__body">
              {renderTimelineData(entry)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderTimelineData(entry: TimelineEntry): React.ReactNode {
  const d = entry.data;
  switch (entry.source) {
    case "stage_history":
      return <span>De {String(d.fromStageId ?? "—")} para {String(d.toStageId)}{d.motivo ? ` — ${d.motivo}` : ""}</span>;
    case "gate_instance":
      return <span>Gate {String(d.gateId)}: {String(d.status)}{d.decision ? ` (${d.decision})` : ""}</span>;
    case "case_event":
      return <span>[{String(d.eventType)}] {String(d.descricao)}</span>;
    case "case_assignment":
      return <span>Role {String(d.processRoleId)} → Usuário {String(d.userId)}</span>;
    default:
      return <span>{JSON.stringify(d)}</span>;
  }
}

// ── Shared ───────────────────────────────────────────────────────────────────

function CasePanelSkeleton() {
  return (
    <div className="case-panel case-panel--skeleton">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--tabs" />
      <div className="skeleton skeleton--content" />
    </div>
  );
}

function ErrorState({ error }: { error: Error & { correlationId?: string } }) {
  return (
    <div className="error-state">
      <h3>Erro ao carregar caso</h3>
      <p>{error.message}</p>
      {error.correlationId && (
        <small>Correlation ID: {error.correlationId}</small>
      )}
    </div>
  );
}
