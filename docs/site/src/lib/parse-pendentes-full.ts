/**
 * Full parser for pen-*-pendente.md files.
 * Extracts all structured data: metadata, options, resolution, recommendations.
 * Used by the Plano de Ação page.
 */
import fs from "node:fs";
import path from "node:path";

const DOCS_ROOT = path.resolve(import.meta.dirname ?? ".", "../../..");
const MODULES_DIR = path.join(DOCS_ROOT, "04_modules");

// ── Types ────────────────────────────────────────────────────

export interface PendenteOpcao {
  letra: string;       // A, B, C or 1, 2, 3
  titulo: string;      // Title after the letter
  descricao: string;   // Description text
  pros: string;
  contras: string;
  recomendada: boolean;
}

export interface PendenteFull {
  id: string;           // PENDENTE-001
  titulo: string;
  status: string;       // ABERTA | DECIDIDA | IMPLEMENTADA | RECOMENDADA
  severidade: string;   // ALTA | MEDIA | BAIXA | CRITICA | BLOQ
  dominio: string;      // SEC | ARC | DATA | UX
  tipo: string;         // DEC-TEC | LACUNA | QUESTAO | CONTRADICAO
  origem: string;       // ENRICH | MANUAL | VALIDATION
  modulo: string;       // MOD-000
  moduloNum: string;    // 000
  rastreiaPara: string;
  tags: string;
  dependencias: string;
  questao: string;
  impacto: string;
  opcoes: PendenteOpcao[];
  recomendacao: string;
  resolucao: string;
  opcaoEscolhida: string;
  justificativaDecisao: string;
  artefatoSaida: string;
}

export interface PenModulo {
  pen: string;          // PEN-000
  modulo: string;       // MOD-000
  moduloNome: string;
  owner: string;
  estadoItem: string;
  pendentes: PendenteFull[];
}

// ── Module dir mapping ──────────────────────────────────────

const DIR_MAP: Record<string, { dir: string; nome: string }> = {
  "000": { dir: "mod-000-foundation", nome: "Foundation" },
  "001": { dir: "mod-001-backoffice-admin", nome: "Backoffice Admin" },
  "002": { dir: "mod-002-gestao-usuarios", nome: "Gestao de Usuarios" },
  "003": { dir: "mod-003-estrutura-organizacional", nome: "Estrutura Organizacional" },
  "004": { dir: "mod-004-identidade-avancada", nome: "Identidade Avancada" },
  "005": { dir: "mod-005-modelagem-processos", nome: "Modelagem de Processos" },
  "006": { dir: "mod-006-execucao-casos", nome: "Execucao de Casos" },
  "007": { dir: "mod-007-parametrizacao-contextual", nome: "Parametrizacao Contextual" },
  "008": { dir: "mod-008-integracao-protheus", nome: "Integracao Protheus" },
  "009": { dir: "mod-009-movimentos-aprovacao", nome: "Movimentos Aprovacao" },
  "010": { dir: "mod-010-mcp-automacao", nome: "MCP e Automacao" },
  "011": { dir: "mod-011-smartgrid", nome: "SmartGrid" },
};

// ── Helpers ──────────────────────────────────────────────────

function extractField(text: string, field: string): string {
  const re = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, "im");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function normSev(s: string): string {
  const v = s.toUpperCase();
  if (v.includes("CRÍT") || v.includes("CRIT")) return "CRITICA";
  if (v.includes("BLOQ")) return "BLOQ";
  if (v.includes("ALTA")) return "ALTA";
  if (v.includes("MÉD") || v.includes("MEDIA")) return "MEDIA";
  if (v.includes("BAIXA")) return "BAIXA";
  return v || "—";
}

function normStatus(s: string): string {
  const v = s.toUpperCase().replace(/[✅🔲⬜☐☑]/g, "").trim();
  if (v.includes("IMPLEMENTADA")) return "IMPLEMENTADA";
  if (v.includes("DECIDIDA")) return "DECIDIDA";
  if (v.includes("RECOMENDADA")) return "RECOMENDADA";
  if (v.includes("ABERTA")) return "ABERTA";
  return v || "ABERTA";
}

// ── Parse single PEN file ────────────────────────────────────

function parsePenFile(filePath: string, num: string): PenModulo | null {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
  const info = DIR_MAP[num] || { dir: "", nome: `MOD-${num}` };

  // Header metadata
  const owner = extractField(content, "owner") || "arquitetura";
  const estadoItem = extractField(content, "estado_item") || "DRAFT";

  // Split into PENDENTE sections
  const sections = content.split(/^## /m).slice(1);
  const pendentes: PendenteFull[] = [];

  for (const section of sections) {
    const fullSection = "## " + section;

    // Match title patterns:
    //   PENDENTE-001 — Title
    //   ~~PENDENTE-001~~ — ✅ RESOLVIDA: Title
    //   PEN-009-001 — Title
    //   PEND-SGR-01 — Title
    //   ~~PENDENTE-001 — Title~~
    const firstLine = section.split("\n")[0].trim();

    // Skip non-pendente sections
    if (!/PEND|PEN-\d{3}-\d|Q\d/i.test(firstLine)) continue;
    // Skip table separator rows
    if (/^\|/.test(firstLine) || /^-+$/.test(firstLine)) continue;

    const titleMatch = firstLine.match(
      /~{0,2}((?:PENDENTE|PEN|PEND)[\w-]*)~{0,2}\s*[—-]\s*(?:✅\s*\w+:\s*)?(.+?)~{0,2}\s*$/,
    );
    if (!titleMatch) {
      // Try Q-format (Q1, Q2, etc.)
      const qMatch = firstLine.match(/^(Q\d+)\s*[—-]\s*(.+)/);
      if (!qMatch) continue;
      const id = qMatch[1];
      const titulo = qMatch[2].trim();
      // Simplified for Q-entries
      pendentes.push({
        id, titulo, status: "ABERTA", severidade: "—", dominio: "—",
        tipo: "—", origem: "—", modulo: `MOD-${num}`, moduloNum: num,
        rastreiaPara: "", tags: "", dependencias: "",
        questao: "", impacto: "", opcoes: [], recomendacao: "", resolucao: "",
        opcaoEscolhida: "", justificativaDecisao: "", artefatoSaida: "",
      });
      continue;
    }

    const id = titleMatch[1].replace(/~~/g, "");
    const titulo = titleMatch[2].replace(/~~$/g, "").trim();

    // Metadata fields (both formats: **key:** value and - **key:** value)
    const status = normStatus(
      extractField(fullSection, "status") ||
      (fullSection.includes("DECIDIDA + IMPLEMENTADA") ? "IMPLEMENTADA" :
       fullSection.includes("DECIDIDA") ? "DECIDIDA" : "ABERTA"),
    );
    const severidade = normSev(
      extractField(fullSection, "severidade") ||
      extractField(fullSection, "Prioridade") || "—",
    );
    const dominio = extractField(fullSection, "domínio") || extractField(fullSection, "dominio") || "—";
    const tipo = extractField(fullSection, "tipo") || "—";
    const origem = extractField(fullSection, "origem") || "—";
    const rastreiaPara = extractField(fullSection, "rastreia_para") || "";
    const tags = extractField(fullSection, "tags") || "";
    const dependencias = extractField(fullSection, "dependencias") || "";
    const opcaoEscolhida = extractField(fullSection, "opcao_escolhida") || "";

    // Extract subsections
    const questaoMatch = fullSection.match(/### Questão\n+([\s\S]*?)(?=\n### |$)/);
    const questao = questaoMatch ? questaoMatch[1].trim() :
      extractField(fullSection, "Questão") || extractField(fullSection, "Descrição") || "";

    const impactoMatch = fullSection.match(/### Impacto\n+([\s\S]*?)(?=\n### |$)/);
    const impacto = impactoMatch ? impactoMatch[1].trim() :
      extractField(fullSection, "Impacto") || "";

    // Parse options - handle both formats
    const opcoes: PendenteOpcao[] = [];

    // Format 1: **Opção A — Title:**\nDescription\n- Prós: ...\n- Contras: ...
    const opcoesMatch = fullSection.match(/### Opções\n+([\s\S]*?)(?=\n### |$)/);
    if (opcoesMatch) {
      const optsBlock = opcoesMatch[1];
      const optSections = optsBlock.split(/\*\*Opção\s+/).slice(1);
      for (const opt of optSections) {
        const headerMatch = opt.match(/^([A-C])\s*[—-]\s*(.+?):\*\*/);
        if (headerMatch) {
          const rest = opt.slice(headerMatch[0].length - 2); // after **
          const prosMatch = rest.match(/Prós:\s*(.+?)(?=\n|$)/);
          const contrasMatch = rest.match(/Contras:\s*(.+?)(?=\n|$)/);
          const descLines = rest.split("\n").filter((l) => !l.match(/^\s*-\s*(?:Prós|Contras)/) && l.trim());
          opcoes.push({
            letra: headerMatch[1],
            titulo: headerMatch[2].trim(),
            descricao: descLines.join(" ").replace(/\*\*/g, "").trim(),
            pros: prosMatch ? prosMatch[1].trim() : "",
            contras: contrasMatch ? contrasMatch[1].trim() : "",
            recomendada: false,
          });
        }
      }
    }

    // Format 2: numbered options: 1. **Title:** Description
    if (opcoes.length === 0) {
      const optsInline = fullSection.match(/\*\*Opções:\*\*\n([\s\S]*?)(?=\n-\s+\*\*Recomendação|### |$)/);
      if (optsInline) {
        const lines = optsInline[1].split(/\n\s+\d+\.\s+/).slice(1);
        lines.forEach((line, i) => {
          const m = line.match(/\*\*(.+?):\*\*\s*(.*)/s);
          if (m) {
            opcoes.push({
              letra: String(i + 1),
              titulo: m[1].trim(),
              descricao: m[2].replace(/\n/g, " ").trim(),
              pros: "",
              contras: "",
              recomendada: false,
            });
          }
        });
      }
    }

    // Format 3: bulleted inline options: - **Opção A:** Description
    if (opcoes.length === 0) {
      const optsInline = fullSection.match(/\*\*Opções:\*\*\n([\s\S]*?)(?=\n-\s+\*\*Recomendação|### |$)/);
      if (optsInline) {
        const optMatches = optsInline[1].matchAll(/-\s+\*\*Opção\s+([A-C])\s*(?::|—|-)\*\*\s*(.+)/gi);
        for (const om of optMatches) {
          opcoes.push({
            letra: om[1].toUpperCase(),
            titulo: om[2].split("—")[0].trim(),
            descricao: om[2].includes("—") ? om[2].split("—").slice(1).join("—").trim() : "",
            pros: "",
            contras: "",
            recomendada: false,
          });
        }
      }
    }

    // Recommendation
    const recMatch = fullSection.match(/### Recomendação\n+([\s\S]*?)(?=\n### |$)/);
    const recomendacao = recMatch ? recMatch[1].trim() :
      extractField(fullSection, "Recomendação") || "";

    // Mark recommended option
    const recOptMatch = recomendacao.match(/Op[çc][ãa]o\s+([A-C1-3])/i);
    if (recOptMatch) {
      const recLetter = recOptMatch[1];
      const found = opcoes.find((o) => o.letra === recLetter);
      if (found) found.recomendada = true;
    }

    // Resolution
    const resMatch = fullSection.match(/### Resolução\n+([\s\S]*?)(?=\n---|\n## |$)/);
    const resolucao = resMatch ? resMatch[1].trim() : "";

    // Extract justificativa and artefato from resolucao
    const justMatch = resolucao.match(/\*\*Justificativa:\*\*\s*(.+?)(?=\n>|$)/s);
    const artMatch = resolucao.match(/\*\*Artefato de saída:\*\*\s*(.+?)(?=\n>|$)/s);

    pendentes.push({
      id,
      titulo,
      status,
      severidade,
      dominio,
      tipo,
      origem,
      modulo: `MOD-${num}`,
      moduloNum: num,
      rastreiaPara,
      tags,
      dependencias,
      questao,
      impacto,
      opcoes,
      recomendacao,
      resolucao,
      opcaoEscolhida,
      justificativaDecisao: justMatch ? justMatch[1].trim() : "",
      artefatoSaida: artMatch ? artMatch[1].trim() : "",
    });
  }

  return {
    pen: `PEN-${num}`,
    modulo: `MOD-${num}`,
    moduloNome: info.nome,
    owner,
    estadoItem,
    pendentes,
  };
}

// ── Public API ───────────────────────────────────────────────

export function loadAllPendentesDetailed(): PenModulo[] {
  const modules: PenModulo[] = [];

  for (const [num, info] of Object.entries(DIR_MAP)) {
    const filePath = path.join(MODULES_DIR, info.dir, "requirements", `pen-${num}-pendente.md`);
    const mod = parsePenFile(filePath, num);
    if (mod && mod.pendentes.length > 0) modules.push(mod);
  }

  return modules;
}
