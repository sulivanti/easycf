#!/usr/bin/env node
/**
 * EasyCodeFramework — Script de Release Automático
 *
 * Uso:
 *   node scripts/release.mjs          → bump de PATCH  (0.1.0 → 0.1.1)
 *   node scripts/release.mjs minor    → bump de MINOR  (0.1.0 → 0.2.0)
 *   node scripts/release.mjs major    → bump de MAJOR  (0.1.0 → 1.0.0)
 *
 * O script executa (sem intervenção manual):
 *   1. Lê a versão atual do package.json raiz
 *   2. Calcula a nova versão com base no tipo de bump
 *   3. Atualiza o package.json com a nova versão
 *   4. Popula easyCF/ com os arquivos do template
 *   5. Cria o commit: "release: v0.2.0"
 *   6. Cria o Git tag: v0.2.0
 *   7. Imprime instruções do push final (feito manualmente para segurança)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// ─── Helpers ────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const log = (msg) => console.log(`\x1b[36m[ECF Release]\x1b[0m ${msg}`);
const ok = (msg) => console.log(`\x1b[32m  ✔\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m  ⚠\x1b[0m ${msg}`);
const err = (msg) => { console.error(`\x1b[31m  ✖\x1b[0m ${msg}`); process.exit(1); };

/**
 * Copia um diretório recursivamente.
 * @param {string} src  Caminho de origem absoluto
 * @param {string} dest Caminho de destino absoluto
 */
function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        warn(`Origem não encontrada, pulando: ${path.relative(ROOT, src)}`);
        return;
    }
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Remove um diretório e todo seu conteúdo, mas preserva o próprio diretório.
 * @param {string} dirPath Caminho absoluto do diretório
 */
function cleanDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        return;
    }
    for (const entry of fs.readdirSync(dirPath)) {
        const full = path.join(dirPath, entry);
        fs.rmSync(full, { recursive: true, force: true });
    }
}

/**
 * Faz o bump da versão semântica.
 * @param {string} version Versão atual "MAJOR.MINOR.PATCH"
 * @param {"patch"|"minor"|"major"} type Tipo do bump
 * @returns {string} Nova versão
 */
function bumpVersion(version, type) {
    const parts = version.split(".").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
        err(`Versão inválida no package.json: "${version}"`);
    }
    const [major, minor, patch] = parts;
    switch (type) {
        case "major": return `${major + 1}.0.0`;
        case "minor": return `${major}.${minor + 1}.0`;
        case "patch":
        default: return `${major}.${minor}.${patch + 1}`;
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const bumpType = (process.argv[2] || "patch").toLowerCase();
if (!["patch", "minor", "major"].includes(bumpType)) {
    err(`Tipo de bump inválido: "${bumpType}". Use: patch | minor | major`);
}

// 1. Ler versão atual
const pkgPath = path.join(ROOT, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const oldVersion = pkg.version;

// 2. Calcular nova versão
const newVersion = bumpVersion(oldVersion, bumpType);
const tag = `v${newVersion}`;

log(`Iniciando release: ${oldVersion} → ${newVersion} (${bumpType})`);
console.log();

// 3. Atualizar package.json raiz
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + "\n", "utf-8");
ok(`package.json atualizado para ${newVersion}`);

// 4. Definir paths
const EASY_CF = path.join(ROOT, "easyCF");
const TEMPLATE = path.join(ROOT, "apps", "template-project");
const SKILLS = path.join(ROOT, ".agents", "skills");
const NORMATIVOS = path.join(ROOT, "docs", "01_normativos");
const DOCS_04 = path.join(ROOT, "docs", "04_modules");

// Arquivos avulsos a copiar: [origem, destino]
const AVULSOS = [
    [".cursorrules", ".cursorrules"],
    [".env.example", ".env.example"],
    ["docker-compose.yml", "docker-compose.yml"],
    [".gitignore", ".gitignore"],
];

// 5. Limpar easyCF/
log("Limpando easyCF/...");
cleanDir(EASY_CF);
ok("easyCF/ limpa");

// 6. Copiar template-project → easyCF/
log("Copiando apps/template-project/ → easyCF/...");
copyDir(TEMPLATE, EASY_CF);
ok("template-project copiado");

// 7. Copiar skills → easyCF/.agents/skills/
log("Copiando .agents/skills/ → easyCF/.agents/skills/...");
copyDir(SKILLS, path.join(EASY_CF, ".agents", "skills"));
ok("skills copiadas");

// 8. Copiar normativos → easyCF/docs/01_normativos/
log("Copiando docs/01_normativos/ → easyCF/docs/01_normativos/...");
copyDir(NORMATIVOS, path.join(EASY_CF, "docs", "01_normativos"));
ok("normativos copiados");

// 9. Copiar estrutura 04_modules (apenas esqueleto de pastas/templates, sem módulos gerados)
const TEMPLATES_04 = path.join(DOCS_04, "user-stories", "templates");
if (fs.existsSync(TEMPLATES_04)) {
    log("Copiando templates de user-stories → easyCF/docs/04_modules/user-stories/templates/...");
    copyDir(TEMPLATES_04, path.join(EASY_CF, "docs", "04_modules", "user-stories", "templates"));
    ok("templates de user-story copiados");
}

// 10. Copiar arquivos avulsos
log("Copiando arquivos de configuração raiz...");
for (const [srcRel, destRel] of AVULSOS) {
    const srcFull = path.join(ROOT, srcRel);
    const destFull = path.join(EASY_CF, destRel);
    if (fs.existsSync(srcFull)) {
        fs.mkdirSync(path.dirname(destFull), { recursive: true });
        fs.copyFileSync(srcFull, destFull);
        ok(`${srcRel} copiado`);
    } else {
        warn(`${srcRel} não encontrado, pulando`);
    }
}

// 11. Gravar um RELEASE.md simples dentro do easyCF/
const releaseNotes = `# EasyCodeFramework — ${tag}

Versão: **${newVersion}**  
Data de release: ${new Date().toISOString().split("T")[0]}

## Como usar

\`\`\`bash
npx degit sulivanti/EasyCodeFramework/easyCF meu-app
cd meu-app
\`\`\`

Após baixar, abra a pasta no seu editor com suporte a agentes e use o prompt de ignição
descrito no README.md principal para configurar o projeto.

## Histórico
- Consulte o repositório para o CHANGELOG completo.
`;
fs.writeFileSync(path.join(EASY_CF, "RELEASE.md"), releaseNotes, "utf-8");
ok("RELEASE.md gerado em easyCF/");

// 12. Git commit + tag
console.log();
log("Criando commit e tag Git...");
try {
    execSync(`git add -A`, { cwd: ROOT, stdio: "pipe" });
    execSync(`git commit -m "release: ${tag}"`, { cwd: ROOT, stdio: "pipe" });
    ok(`Commit criado: "release: ${tag}"`);
} catch (e) {
    // Pode não ter mudanças para commitar
    warn("Nenhuma mudança nova para commitar (ou commit já existente). Continuando...");
}

try {
    execSync(`git tag ${tag}`, { cwd: ROOT, stdio: "pipe" });
    ok(`Tag criada: ${tag}`);
} catch (e) {
    warn(`Tag ${tag} já existe. Para recriar: git tag -d ${tag} && node scripts/release.mjs`);
}

// 13. Resumo final
console.log();
console.log("─".repeat(60));
console.log(`\x1b[32m 🚀 Release ${tag} pronto!\x1b[0m`);
console.log("─".repeat(60));
console.log();
console.log(" Para publicar, execute:");
console.log(`\x1b[33m   git push && git push --tags\x1b[0m`);
console.log();
console.log(" Para testar localmente antes do push:");
console.log(`\x1b[33m   npx degit sulivanti/EasyCodeFramework/easyCF#${tag} ../teste-${tag}\x1b[0m`);
console.log();
console.log(" O usuário instalará com:");
console.log(`\x1b[36m   npx degit sulivanti/EasyCodeFramework/easyCF meu-app\x1b[0m`);
console.log(`\x1b[36m   npx degit sulivanti/EasyCodeFramework/easyCF#${tag} meu-app\x1b[0m`);
console.log();
