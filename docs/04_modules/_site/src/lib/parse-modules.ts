/**
 * Parser for PLANO-ACAO-MOD-*.md files.
 *
 * These files don't use standard YAML frontmatter. Instead, the metadata
 * is embedded in blockquotes and markdown tables in the first ~30 lines.
 *
 * Example header:
 *   # Procedimento — Plano de Acao MOD-000 Foundation
 *   > **Versao:** 1.4.1 | **Data:** 2026-03-23 | **Owner:** arquitetura
 *   > **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v0.9.0) | **Features:** 17/17 READY
 */
import fs from "node:fs";
import path from "node:path";
import type { Module, Pendente } from "./types.js";

const DOCS_ROOT = path.resolve(
  import.meta.dirname ?? ".",
  "../../../..",
);
const PLANO_DIR = path.join(
  DOCS_ROOT,
  "04_modules/user-stories/plano",
);
const MODULES_DIR = path.join(DOCS_ROOT, "04_modules");

// ── Module names by ID (fallback if parse fails) ────────────
const MODULE_NAMES: Record<string, string> = {
  "MOD-000": "Foundation",
  "MOD-001": "Backoffice Admin",
  "MOD-002": "Gestao de Usuarios",
  "MOD-003": "Estrutura Organizacional",
  "MOD-004": "Identidade Avancada",
  "MOD-005": "Modelagem de Processos",
  "MOD-006": "Execucao de Casos",
  "MOD-007": "Parametrizacao Contextual",
  "MOD-008": "Integracao Protheus",
  "MOD-009": "Movimentos Aprovacao",
  "MOD-010": "MCP e Automacao",
  "MOD-011": "SmartGrid",
};

// ── Dependency graph (from project docs) ─────────────────────
const DEPS: Record<string, string[]> = {
  "MOD-000": [],
  "MOD-001": ["MOD-000"],
  "MOD-002": ["MOD-000"],
  "MOD-003": ["MOD-000"],
  "MOD-004": ["MOD-000", "MOD-003"],
  "MOD-005": ["MOD-000", "MOD-003", "MOD-004"],
  "MOD-006": ["MOD-000", "MOD-003", "MOD-004", "MOD-005"],
  "MOD-007": ["MOD-000", "MOD-003", "MOD-004", "MOD-005", "MOD-006"],
  "MOD-008": ["MOD-000", "MOD-006", "MOD-007"],
  "MOD-009": ["MOD-000", "MOD-004", "MOD-006"],
  "MOD-010": ["MOD-000", "MOD-004", "MOD-007", "MOD-008", "MOD-009"],
  "MOD-011": ["MOD-000", "MOD-007"],
};

// ── Helpers ──────────────────────────────────────────────────
function extractBetween(text: string, key: string, delimiter = "|"): string {
  const re = new RegExp(`\\*\\*${key}:\\*\\*\\s*([^|\\n]+)`);
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function parseStatusVersion(raw: string): { status: string; version: string } {
  const m = raw.match(/(\w+)\s*\(([^)]+)\)/);
  return m
    ? { status: m[1], version: m[2] }
    : { status: raw.trim(), version: "" };
}

function parseFeatureCount(raw: string): {
  ready: number;
  total: number;
} {
  const m = raw.match(/(\d+)\/(\d+)/);
  return m ? { ready: +m[1], total: +m[2] } : { ready: 0, total: 0 };
}

function detectPhase(content: string): number {
  // Check from highest phase down
  // Phase 5 (Codegen): "Fase 5 ... CONCLUÍDA" or "Fases 0-5 concluidas" or "Codegen completo"
  if (/Fase\s+5.*CONCLU[IÍ]D/i.test(content) || /Fases\s+0-5.*conclu/i.test(content) || /Codegen\s+completo/i.test(content)) return 5;
  // Phase 5 in progress: Fase 4 done + codegen started but not done
  if (/Fase\s+4.*CONCLU/i.test(content)) return 5;
  if (/Fase\s+3.*CONCLU/i.test(content)) return 4;
  if (/Fase\s+2.*CONCLU/i.test(content)) return 3;
  if (/Fase\s+1.*CONCLU/i.test(content)) return 2;
  if (/Fase\s+0.*CONCLU/i.test(content) || /Epico.*READY/i.test(content)) return 1;
  return 0;
}

function detectCodegen(content: string): string {
  // Check NAO INICIADO first — the table row "Codegen ... | NAO INICIADO |"
  // often contains "concluido" later in the same line (e.g. "Scaffold concluido")
  // which would false-positive match CONCLUIDO if checked first.
  if (/codegen.*NAO INICIADO/i.test(content)) return "NAO INICIADO";
  if (/codegen.*EM ANDAMENTO/i.test(content)) return "EM ANDAMENTO";
  // For CONCLUIDO, require it closer to "codegen" (same table cell or short phrase)
  if (/codegen\s*(?:\([^)]*\)\s*\|?\s*)?(?:completo|CONCLU[IÍ]D)/i.test(content)) return "CONCLUIDO";
  // Also match "Fase 5 ... CONCLUÍDA" or "Fases 0-5 concluidas"
  if (/Fase(?:s)?\s+(?:0-)?5.*CONCLU[IÍ]D/i.test(content)) return "CONCLUIDO";
  return "N/A";
}

function extractFeatures(content: string): string[] {
  const features: string[] = [];
  const re = /\bF(\d{2})\s+(.+?)(?:\||$)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    features.push(`F${m[1]} ${m[2].trim()}`);
  }
  return [...new Set(features)];
}

function determineNextAction(estado: string, phase: number, codegen: string): { action: string; cmd: string; modId: string } {
  let action: string;
  if (estado === "READY" && (codegen === "CONCLUIDO" || codegen === "EM ANDAMENTO")) {
    action = "Manutencao";
  } else if (estado === "READY" && codegen === "NAO INICIADO") {
    action = "Codegen";
  } else if (estado === "DRAFT" && phase >= 4) {
    action = "Promover";
  } else if (estado === "DRAFT" && phase >= 2) {
    action = "Validar";
  } else {
    action = "Enriquecer";
  }
  return { action, cmd: "", modId: "" };
}

// ── Parse a single PLANO-ACAO-MOD-*.md ──────────────────────
function parsePlanoAcao(filePath: string): Module | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
    const lines = content.split("\n");
    const header = lines.slice(0, 30).join("\n");

    // Extract module ID from filename
    const fileMatch = path.basename(filePath).match(/MOD-(\d{3})/);
    if (!fileMatch) return null;
    const modId = `MOD-${fileMatch[1]}`;

    // Parse header metadata
    const modStatusRaw = extractBetween(header, "Estado atual do modulo");
    const { status: estado, version } = parseStatusVersion(modStatusRaw);

    const epicRaw = extractBetween(header, "Epico");
    const { status: epicStatus, version: epicVersion } = parseStatusVersion(epicRaw);

    const featRaw = extractBetween(header, "Features");
    const { ready: featuresReady, total: featuresTotal } = parseFeatureCount(featRaw);

    const owner = extractBetween(header, "Owner");
    const phase = detectPhase(content);
    const codegen = detectCodegen(content);
    const features = extractFeatures(content);

    const next = determineNextAction(estado, phase, codegen);
    const modIdLower = modId.toLowerCase().replace("-", "-");

    return {
      id: modId,
      name: MODULE_NAMES[modId] || modId,
      estado: estado || "DRAFT",
      version: version || "v0.0.0",
      epicStatus: epicStatus || "DRAFT",
      epicVersion: epicVersion || "v0.0.0",
      featuresReady,
      featuresTotal,
      phase,
      codegen,
      owner: owner || "arquitetura",
      features,
      deps: DEPS[modId] || [],
      pendentes: [], // filled later by parsePendentes
      nextAction: next.action,
      nextCmd:
        next.action === "Manutencao"
          ? `/validate-all ${modId}`
          : next.action === "Codegen"
            ? `/app-scaffold all && /codegen ${modIdLower}`
            : next.action === "Promover"
              ? `/promote-module ${modId}`
              : next.action === "Validar"
                ? `/validate-all ${modId}`
                : `/enrich-all ${modId}`,
    };
  } catch {
    return null;
  }
}

// ── Parse pen-*-pendente.md ─────────────────────────────────
function parsePendentes(modId: string): Pendente[] {
  const num = modId.replace("MOD-", "");
  const dirName = getDirName(modId);
  const penPath = path.join(
    MODULES_DIR,
    dirName,
    "requirements",
    `pen-${num}-pendente.md`,
  );

  if (!fs.existsSync(penPath)) return [];

  try {
    const content = fs.readFileSync(penPath, "utf-8").replace(/\r\n/g, "\n");
    const pendentes: Pendente[] = [];

    // Match each PENDENTE section (including resolved with strikethrough)
    const sections = content.split(/^##\s+/m).slice(1);
    for (const section of sections) {
      const titleMatch = section.match(
        /(?:~~)?\[?(PENDENTE-\d+|[A-Z]+-\d+)\]?(?:~~)?\s*[—-]\s*(.+)/,
      );
      if (!titleMatch) continue;

      const id = titleMatch[1];
      const title = titleMatch[2].replace(/~~$/g, "").trim();

      const statusMatch = section.match(/\*\*status:\*\*\s*(\S+)/i);
      const sevMatch = section.match(/\*\*severidade:\*\*\s*(\S+)/i);
      const domMatch = section.match(/\*\*dom[ií]nio:\*\*\s*(\S+)/i);

      pendentes.push({
        id,
        title,
        status: statusMatch?.[1] || "ABERTA",
        severidade: sevMatch?.[1] || "MEDIA",
        dominio: domMatch?.[1] || "—",
        modulo: modId,
      });
    }

    return pendentes;
  } catch {
    return [];
  }
}

function getDirName(modId: string): string {
  const names: Record<string, string> = {
    "MOD-000": "mod-000-foundation",
    "MOD-001": "mod-001-backoffice-admin",
    "MOD-002": "mod-002-gestao-usuarios",
    "MOD-003": "mod-003-estrutura-organizacional",
    "MOD-004": "mod-004-identidade-avancada",
    "MOD-005": "mod-005-modelagem-processos",
    "MOD-006": "mod-006-execucao-casos",
    "MOD-007": "mod-007-parametrizacao-contextual",
    "MOD-008": "mod-008-integracao-protheus",
    "MOD-009": "mod-009-movimentos-aprovacao",
    "MOD-010": "mod-010-mcp-automacao",
    "MOD-011": "mod-011-smartgrid",
  };
  return names[modId] || modId.toLowerCase();
}

// ── Public API ──────────────────────────────────────────────
export function loadAllModules(): Module[] {
  const modules: Module[] = [];

  for (let i = 0; i <= 11; i++) {
    const num = String(i).padStart(3, "0");
    const filePath = path.join(PLANO_DIR, `PLANO-ACAO-MOD-${num}.md`);

    if (!fs.existsSync(filePath)) continue;

    const mod = parsePlanoAcao(filePath);
    if (!mod) continue;

    mod.pendentes = parsePendentes(mod.id);
    modules.push(mod);
  }

  return modules;
}
