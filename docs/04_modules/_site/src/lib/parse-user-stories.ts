/**
 * Parser for User Stories (epics) and Features from markdown files.
 *
 * Reads from:
 *   docs/04_modules/user-stories/epics/US-MOD-*.md
 *   docs/04_modules/user-stories/features/US-MOD-*-F*.md
 *
 * Header format:
 *   # US-MOD-003 — Estrutura Organizacional (Épico)
 *   **Status Ágil:** `READY`
 *   **Versão:** 1.1.0
 *   **Data:** 2026-03-15
 *   **Módulo Destino:** **MOD-003** (Estrutura Organizacional)
 *
 * Metadata section:
 *   ## Metadados de Governança
 *   - **status_agil:** READY
 *   - **owner:** Marcos Sulivan
 *   - **nivel_arquitetura:** 1
 *   - **rastreia_para:** ...
 */
import fs from "node:fs";
import path from "node:path";

const DOCS_ROOT = path.resolve(import.meta.dirname ?? ".", "../../../..");
const EPICS_DIR = path.join(DOCS_ROOT, "04_modules/user-stories/epics");
const FEATURES_DIR = path.join(DOCS_ROOT, "04_modules/user-stories/features");

// ── Types ────────────────────────────────────────────────────

export interface UserStory {
  id: string;            // US-MOD-003
  title: string;         // Estrutura Organizacional (Épico)
  status: string;        // READY | DRAFT | APPROVED | TODO
  version: string;       // 1.1.0
  date: string;          // 2026-03-15
  moduleId: string;      // MOD-003
  moduleName: string;    // Estrutura Organizacional
  owner: string;
  nivel: number;         // 0, 1, 2
  rastreiaPara: string[];
  features: Feature[];
  sections: Section[];   // content sections for preview
}

export interface Feature {
  id: string;            // US-MOD-003-F01
  title: string;         // API Core de Estrutura Organizacional
  status: string;        // READY | DRAFT | APPROVED | TODO
  version: string;
  date: string;
  moduleId: string;      // MOD-003
  owner: string;
  tipo: string;          // Backend — cria novos endpoints
  nivel: number;
  epicoPai: string;      // US-MOD-003
  rastreiaPara: string[];
  manifests: string[];
  pendencias: string;
  sections: Section[];
}

export interface Section {
  heading: string;
  level: number;         // 2 or 3
  content: string;       // raw markdown content
}

// ── Helpers ──────────────────────────────────────────────────

function extractField(text: string, field: string): string {
  // Match both **Field:** `value` and **Field:** value formats
  const re = new RegExp(`\\*\\*${field}:\\*\\*\\s*\`?([^\`\\n]+)\`?`, "i");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function extractMetaField(text: string, field: string): string {
  const re = new RegExp(`-\\s*\\*\\*${field}:\\*\\*\\s*(.+)`, "i");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function parseNivel(raw: string): number {
  const m = raw.match(/(\d)/);
  return m ? parseInt(m[1], 10) : 0;
}

function parseSections(content: string): Section[] {
  const sections: Section[] = [];
  const lines = content.split("\n");
  let current: Section | null = null;

  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);

    if (h2) {
      if (current) sections.push(current);
      current = { heading: h2[1].trim(), level: 2, content: "" };
    } else if (h3) {
      if (current) sections.push(current);
      current = { heading: h3[1].trim(), level: 3, content: "" };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);

  // Filter out metadata section and empty sections
  return sections.filter(
    (s) =>
      s.heading !== "Metadados de Governança" &&
      s.content.trim().length > 0,
  );
}

// ── Parse Epic ───────────────────────────────────────────────

function parseEpic(filePath: string): UserStory | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
    const header = content.slice(0, 1500);

    // Title from first heading
    const titleMatch = header.match(/^#\s+(\S+)\s*[—-]\s*(.+)/m);
    if (!titleMatch) return null;

    const id = titleMatch[1].trim();
    const title = titleMatch[2].trim();

    // Module ID
    const modMatch = header.match(/\*\*MOD-(\d{3})\*\*/);
    const moduleId = modMatch ? `MOD-${modMatch[1]}` : "";

    // Module name from Módulo Destino
    const destRaw = extractField(header, "Módulo Destino");
    const nameMatch = destRaw.match(/\(([^)]+)\)/);
    const moduleName = nameMatch ? nameMatch[1] : title.replace(/\s*\(Épico\)\s*/, "");

    return {
      id,
      title,
      status: extractField(header, "Status Ágil") || extractMetaField(header, "status_agil") || "DRAFT",
      version: extractField(header, "Versão") || extractField(header, "Versao") || "",
      date: extractField(header, "Data") || "",
      moduleId,
      moduleName,
      owner: extractMetaField(header, "owner") || "",
      nivel: parseNivel(extractMetaField(header, "nivel_arquitetura")),
      rastreiaPara: (extractMetaField(header, "rastreia_para") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      features: [],
      sections: parseSections(content),
    };
  } catch {
    return null;
  }
}

// ── Parse Feature ────────────────────────────────────────────

function parseFeature(filePath: string): Feature | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
    const header = content.slice(0, 1500);

    const titleMatch = header.match(/^#\s+(\S+)\s*[—-]\s*(.+)/m);
    if (!titleMatch) return null;

    const id = titleMatch[1].trim();
    const title = titleMatch[2].trim();

    // Extract MOD-XXX from id
    const modMatch = id.match(/MOD-(\d{3})/);
    const moduleId = modMatch ? `MOD-${modMatch[1]}` : "";

    // Epic parent
    const epicoPai = extractMetaField(header, "epico_pai") || moduleId ? `US-${moduleId}` : "";

    return {
      id,
      title,
      status: extractField(header, "Status Ágil") || extractMetaField(header, "status_agil") || "DRAFT",
      version: extractField(header, "Versão") || extractField(header, "Versao") || "",
      date: extractField(header, "Data") || "",
      moduleId,
      owner: extractMetaField(header, "owner") || "",
      tipo: extractMetaField(header, "tipo") || "",
      nivel: parseNivel(extractMetaField(header, "nivel_arquitetura")),
      epicoPai,
      rastreiaPara: (extractMetaField(header, "rastreia_para") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      manifests: (extractMetaField(header, "manifests_vinculados") || "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && s !== "N/A"),
      pendencias: extractMetaField(header, "pendencias") || "",
      sections: parseSections(content),
    };
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────

export function loadAllUserStories(): UserStory[] {
  const stories: UserStory[] = [];

  // Load epics
  if (fs.existsSync(EPICS_DIR)) {
    const epicFiles = fs.readdirSync(EPICS_DIR).filter((f) => f.endsWith(".md")).sort();
    for (const file of epicFiles) {
      const epic = parseEpic(path.join(EPICS_DIR, file));
      if (epic) stories.push(epic);
    }
  }

  // Load features and attach to parent epics
  if (fs.existsSync(FEATURES_DIR)) {
    const featureFiles = fs.readdirSync(FEATURES_DIR).filter((f) => f.endsWith(".md")).sort();
    for (const file of featureFiles) {
      const feat = parseFeature(path.join(FEATURES_DIR, file));
      if (!feat) continue;

      const parent = stories.find((s) => s.id === feat.epicoPai || s.moduleId === feat.moduleId);
      if (parent) {
        parent.features.push(feat);
      }
    }
  }

  return stories;
}
