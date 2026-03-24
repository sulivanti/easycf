/**
 * @contract UX-CASE-002, FR-009, FR-001
 *
 * Case Listing page with filters, cursor-based pagination,
 * new case drawer, and pending gates badge.
 */

import React, { useState, useCallback } from "react";
import { useCaseList, useOpenCase } from "../../hooks/use-cases.js";
import type { CaseStatus, CaseListItem } from "../../types/case-execution.types.js";

interface CaseListPageProps {
  onSelectCase: (caseId: string) => void;
}

export function CaseListPage({ onSelectCase }: CaseListPageProps) {
  const [filters, setFilters] = useState<{
    cycle_id?: string;
    status?: CaseStatus;
    my_responsibility?: boolean;
    search?: string;
  }>({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { data, loading, error, refetch, loadMore } = useCaseList(filters);

  // Debounced search (400ms — UX-CASE-002)
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    const timeout = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value || undefined }));
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="case-list-page">
      <header className="case-list-page__header">
        <h1>Casos</h1>
        <button onClick={() => setShowDrawer(true)}>Novo Caso</button>
      </header>

      <div className="case-list-page__filters">
        <input
          type="search"
          placeholder="Buscar por código ou object_id..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as CaseStatus | undefined }))}
        >
          <option value="">Todos os status</option>
          <option value="OPEN">Aberto</option>
          <option value="ON_HOLD">Suspenso</option>
          <option value="COMPLETED">Concluído</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={filters.my_responsibility ?? false}
            onChange={(e) => setFilters((f) => ({ ...f, my_responsibility: e.target.checked || undefined }))}
          />
          Minha responsabilidade
        </label>
      </div>

      {error && <div className="error-message">{error.message}</div>}

      {loading && !data ? (
        <TableSkeleton />
      ) : data && data.data.length > 0 ? (
        <>
          <table className="case-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Status</th>
                <th>Estágio</th>
                <th>Gates Pendentes</th>
                <th>Aberto em</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((c) => (
                <CaseRow key={c.id} caseItem={c} onSelect={() => onSelectCase(c.id)} />
              ))}
            </tbody>
          </table>
          {data.meta.has_more && (
            <button className="btn--load-more" onClick={loadMore} disabled={loading}>
              {loading ? "Carregando..." : "Carregar mais"}
            </button>
          )}
        </>
      ) : (
        <EmptyState />
      )}

      {showDrawer && (
        <NewCaseDrawer
          onClose={() => setShowDrawer(false)}
          onCreated={(caseId) => { setShowDrawer(false); refetch(); onSelectCase(caseId); }}
        />
      )}
    </div>
  );
}

// ── Case Row ─────────────────────────────────────────────────────────────────

function CaseRow({ caseItem, onSelect }: { caseItem: CaseListItem; onSelect: () => void }) {
  const statusColors: Record<string, string> = {
    OPEN: "#27AE60", COMPLETED: "#2980B9", CANCELLED: "#E74C3C", ON_HOLD: "#F39C12",
  };

  return (
    <tr className="case-row" onClick={onSelect} style={{ cursor: "pointer" }}>
      <td>{caseItem.codigo}</td>
      <td>
        <span className="badge" style={{ backgroundColor: statusColors[caseItem.status] }}>
          {caseItem.status}
        </span>
      </td>
      <td>{caseItem.current_stage_id}</td>
      <td>
        {caseItem.pending_gates_count > 0 ? (
          <span className="badge badge--warning" title="Clique para ver gates pendentes">
            {caseItem.pending_gates_count}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td>{new Date(caseItem.opened_at).toLocaleDateString("pt-BR")}</td>
    </tr>
  );
}

// ── New Case Drawer ──────────────────────────────────────────────────────────

function NewCaseDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: (caseId: string) => void }) {
  const { execute, loading, error } = useOpenCase();
  const [cycleId, setCycleId] = useState("");
  const [objectType, setObjectType] = useState("");
  const [objectId, setObjectId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await execute({
      cycle_id: cycleId,
      object_type: objectType || undefined,
      object_id: objectId || undefined,
    });
    if (result) onCreated(result.id);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <header className="drawer__header">
          <h2>Novo Caso</h2>
          <button onClick={onClose} className="btn--close">X</button>
        </header>
        <form className="drawer__body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cycle_id">Ciclo (obrigatório)</label>
            <input id="cycle_id" value={cycleId} onChange={(e) => setCycleId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="object_type">Tipo do Objeto</label>
            <input id="object_type" value={objectType} onChange={(e) => setObjectType(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="object_id">ID do Objeto</label>
            <input id="object_id" value={objectId} onChange={(e) => setObjectId(e.target.value)} />
          </div>
          {error && <div className="error-message">{error.message}</div>}
          <button type="submit" disabled={loading || !cycleId}>
            {loading ? "Criando..." : "Criar Caso"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="table-skeleton">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton skeleton--row" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <p>Nenhum caso encontrado.</p>
      <small>Tente ajustar os filtros ou crie um novo caso.</small>
    </div>
  );
}
