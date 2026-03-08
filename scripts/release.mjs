#!/usr/bin/env node
/**
 * EasyCodeFramework — Script de Release Automático (Multi-Repo)
 *
 * Este script orquestra a distribuição do framework:
 * 1. Faz bump da versão no monorepo PRIVADO.
 * 2. Prepara o template consolidado.
 * 3. Faz o deploy automático para o repositório PÚBLICO (easycf-template).
 *
 * Uso:
 *   node scripts/release.mjs          → bump de PATCH  (0.1.0 → 0.1.1)
 *   node scripts/release.mjs minor    → bump de MINOR  (0.1.0 → 0.2.0)
 *   node scripts/release.mjs major    → bump de MAJOR  (0.1.0 → 1.0.0)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// ─── Configuração ────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_REPO = "https://github.com/sulivanti/easycf.git";
const DIST_DIR = path.join(ROOT, "dist", "easycf");

const log = (msg) => console.log(`\x1b[36m[ECF Release]\x1b[0m ${msg}`);
const ok = (msg) => console.log(`\x1b[32m  ✔\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m  ⚠\x1b[0m ${msg}`);
const err = (msg) => { console.error(`\x1b[31m  ✖\x1b[0m ${msg}`); process.exit(1); };

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function cleanDirExceptGit(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    log(`Limpando conteúdo de ${path.relative(ROOT, dirPath)}...`);
    for (const entry of fs.readdirSync(dirPath)) {
        if (entry === ".git") {
            log("  -> Mantendo .git");
            continue;
        }
        const full = path.join(dirPath, entry);
        log(`  -> Removendo ${entry}`);
        fs.rmSync(full, { recursive: true, force: true });
    }
}

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

function run(cmd, cwd = ROOT) {
    try {
        return execSync(cmd, { cwd, stdio: "pipe", encoding: "utf-8" });
    } catch (e) {
        err(`Falha ao executar comando: ${cmd}\n${e.stderr || e.message}`);
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const bumpType = (process.argv[2] || "patch").toLowerCase();
if (!["patch", "minor", "major"].includes(bumpType)) {
    err(`Tipo de bump inválido: "${bumpType}". Use: patch | minor | major`);
}

// 1. Ler versão atual
log("Lendo versão atual...");
const pkgPath = path.join(ROOT, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const oldVersion = pkg.version;
const newVersion = bumpVersion(oldVersion, bumpType);
const tag = `v${newVersion}`;

log(`Iniciando release: ${oldVersion} → ${newVersion} (${bumpType})`);

// 2. Preparar pasta de distribuição (clone do repo público)
if (fs.existsSync(path.join(ROOT, "dist"))) {
    fs.rmSync(path.join(ROOT, "dist"), { recursive: true, force: true });
}
fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });

log(`Clonando repositório de distribuição: ${DIST_REPO}`);
run(`git clone ${DIST_REPO} easycf`, path.join(ROOT, "dist"));

if (fs.existsSync(DIST_DIR)) {
    log(`Conteúdo de ${DIST_DIR} após clone: ${fs.readdirSync(DIST_DIR).join(", ")}`);
} else {
    err(`Erro: Pasta ${DIST_DIR} não existe após o clone.`);
}

log("Limpando template antigo...");
cleanDirExceptGit(DIST_DIR);

// 3. Popular o template
log("Copiando arquivos do monorepo para o template...");

const TEMPLATE_SRC = path.join(ROOT, "apps", "template-project");
const SKILLS_SRC = path.join(ROOT, ".agents", "skills");
const NORMATIVOS_SRC = path.join(ROOT, "docs", "01_normativos");
const USER_STORIES_SRC = path.join(ROOT, "docs", "04_modules", "user-stories");
const PACOTES_AGENTES_SRC = path.join(ROOT, "docs", "02_pacotes_agentes");
const SPECS_TEMPLATE_SRC = path.join(ROOT, "docs", "03_especificacoes", "template");
const MANIFESTS_SRC = path.join(ROOT, "docs", "05_manifests");
const DOCS_ROOT = path.join(ROOT, "docs");

// Copiar bases
copyDir(TEMPLATE_SRC, DIST_DIR);
copyDir(SKILLS_SRC, path.join(DIST_DIR, ".agents", "skills"));
copyDir(NORMATIVOS_SRC, path.join(DIST_DIR, "docs", "01_normativos"));
if (fs.existsSync(USER_STORIES_SRC)) {
    copyDir(USER_STORIES_SRC, path.join(DIST_DIR, "docs", "04_modules", "user-stories"));
}
if (fs.existsSync(PACOTES_AGENTES_SRC)) {
    copyDir(PACOTES_AGENTES_SRC, path.join(DIST_DIR, "docs", "02_pacotes_agentes"));
}
if (fs.existsSync(SPECS_TEMPLATE_SRC)) {
    copyDir(SPECS_TEMPLATE_SRC, path.join(DIST_DIR, "docs", "03_especificacoes", "template"));
}
if (fs.existsSync(MANIFESTS_SRC)) {
    copyDir(MANIFESTS_SRC, path.join(DIST_DIR, "docs", "05_manifests"));
}

// Arquivos avulsos
const AVULSOS = [".cursorrules", ".env.example", "docker-compose.yml", ".gitignore"];
AVULSOS.forEach(file => {
    const src = path.join(ROOT, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST_DIR, file));
});

// Arquivos avulsos do docs/
const DOCS_AVULSOS = ["INDEX.md", "getting-started.md", "MANIFEST.json"];
DOCS_AVULSOS.forEach(file => {
    const src = path.join(DOCS_ROOT, file);
    if (fs.existsSync(src)) {
        fs.mkdirSync(path.join(DIST_DIR, "docs"), { recursive: true });
        fs.copyFileSync(src, path.join(DIST_DIR, "docs", file));
    }
});

// 4. Gerar RELEASE.md no template
const releaseNotes = `# EasyCodeFramework Template — ${tag}
Versão: **${newVersion}**
Release Date: ${new Date().toISOString().split("T")[0]}

Este é o repositório de distribuição do EasyCodeFramework.
Use \`npx degit sulivanti/easycf-template\` para iniciar seu projeto.
`;
fs.writeFileSync(path.join(DIST_DIR, "RELEASE.md"), releaseNotes);

// 5. Commit e Tag no repositório de distribuição
log(`Criando commit e tag no repositório público: ${tag}`);

if (!fs.existsSync(path.join(DIST_DIR, ".git"))) {
    err(`Erro crítico: O repositório de distribuição em ${DIST_DIR} não contém uma pasta .git. O clone falhou ou foi corrompido.`);
}

run(`git add -A`, DIST_DIR);
try {
    run(`git commit -m "release: ${tag}"`, DIST_DIR);
} catch (e) {
    warn("Nenhuma mudança detectada no template.");
}
run(`git tag ${tag}`, DIST_DIR);

// 6. Atualizar versão no monorepo (Privado)
log("Atualizando versão no monorepo privado...");
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + "\n");
run(`git add package.json`);
run(`git commit -m "chore: bump version to ${newVersion}"`);

// 7. Finalização e instruções
console.log();
console.log("─".repeat(60));
console.log(`\x1b[32m 🚀 Release ${tag} preparado com sucesso!\x1b[0m`);
console.log("─".repeat(60));
console.log();
console.log(` O repositório PUBLICO (easycf) foi atualizado localmente em dist/.`);
console.log(" Para efetivar a distribuição pública, você deve:");
console.log();
console.log(` 1. \x1b[33mcd dist/easycf\x1b[0m`);
console.log(` 2. \x1b[33mgit push\x1b[0m`);
console.log(` 3. \x1b[33mgit push --tags\x1b[0m`);
console.log(` 4. \x1b[33mcd ../..\x1b[0m`);
console.log();
console.log(" Para o seu repositório PRIVADO (EasyCodeFramework):");
console.log(` 1. \x1b[33mgit push\x1b[0m`);
console.log();
console.log("─".repeat(60));
