// ============================================================
// Domain types — derived from project markdown structure
// ============================================================

export interface Module {
  id: string;           // MOD-000
  name: string;         // Foundation
  estado: string;       // READY | DRAFT
  version: string;      // v1.0.0
  epicStatus: string;   // READY | APPROVED | DRAFT
  epicVersion: string;  // v0.9.0
  featuresReady: number;
  featuresTotal: number;
  phase: number;        // 0-5
  codegen: string;      // NAO INICIADO | EM ANDAMENTO | CONCLUIDO | N/A
  owner: string;
  features: string[];
  deps: string[];       // ["MOD-000", "MOD-003"]
  pendentes: Pendente[];
  nextAction: string;
  nextCmd: string;
}

export interface Pendente {
  id: string;           // PENDENTE-001
  title: string;
  status: string;       // ABERTA | DECIDIDA | IMPLEMENTADA | RECOMENDADA
  severidade: string;   // ALTA | MEDIA | BAIXA | BLOQ
  dominio: string;      // SEC | ARC | DATA | UX
  modulo: string;       // MOD-000
}

export interface Phase {
  id: number;
  label: string;
  desc: string;
  icon: string;
}

export const PHASES: Phase[] = [
  { id: 0, label: "Pre-Modulo", desc: "Epico + Features", icon: "📋" },
  { id: 1, label: "Genese", desc: "forge-module", icon: "⚒️" },
  { id: 2, label: "Enriquecimento", desc: "11 agentes DEV", icon: "🧬" },
  { id: 3, label: "Validacao", desc: "validate-all", icon: "✅" },
  { id: 4, label: "Promocao", desc: "DRAFT → READY", icon: "🏅" },
  { id: 5, label: "Codegen", desc: "6 agentes COD", icon: "🚀" },
];

export interface Stats {
  ready: number;
  draft: number;
  features: number;
  pendentes: number;
  resolved: number;
  codegen: number;
  promote: number;
}

export function computeStats(modules: Module[]): Stats {
  return {
    ready: modules.filter((m) => m.estado === "READY").length,
    draft: modules.filter((m) => m.estado === "DRAFT").length,
    features: modules.reduce((s, m) => s + m.featuresReady, 0),
    pendentes: modules.reduce((s, m) => s + m.pendentes.length, 0),
    resolved: modules.reduce(
      (s, m) => s + m.pendentes.filter((p) => p.status !== "ABERTA").length,
      0,
    ),
    codegen: modules.filter(
      (m) => m.estado === "READY" && m.codegen === "NAO INICIADO",
    ).length,
    promote: modules.filter(
      (m) => m.estado === "DRAFT" && m.phase >= 4,
    ).length,
  };
}
