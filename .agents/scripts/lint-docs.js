const fs = require('fs');
const path = require('path');

// --- Configuração centralizada de paths (Ponto 4.2) ---
const pathsConfigPath = path.resolve(__dirname, '../paths.json');
const pathsConfig = JSON.parse(fs.readFileSync(pathsConfigPath, 'utf8'));
const DOCS_DIR = path.resolve(__dirname, '..', '..', pathsConfig.paths.docs);
const NORMATIVOS_DIR = path.resolve(__dirname, '..', '..', pathsConfig.paths.normativos);

let errors = [];

// Arquivos excluídos do lint de referências EX-* e §N (relatórios, não artefatos normativos)
const LINT_EXCLUDE_PATTERNS = [
    /AUDITORIA[^/\\]*\.md$/i,
    /CHANGELOG\.md$/i,
];

// Diretórios excluídos da travessia recursiva (CR-1: previne FPs de node_modules)
const WALK_EXCLUDE_DIRS = new Set(['node_modules', '.git', '.astro', '.turbo', 'dist', '.next']);

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (WALK_EXCLUDE_DIRS.has(f)) continue;
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    }
}

console.log('--- Iniciando linting de documentação ---');

// ============================================================
// PASS ORIGINAL: Validação de links, US metadata, rastreabilidade
// ============================================================

walkDir(DOCS_DIR, (filePath) => {
    if (!filePath.endsWith('.md')) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let isUS = path.basename(filePath).startsWith('US-');
    let status = null;
    let estadoItem = null;
    let refNormativas = [];
    let rastreiaPara = [];

    lines.forEach((line, index) => {
        const lineNum = index + 1;

        if (isUS) {
            // Extrai Status
            const matchStatus = line.match(/^\*\*Status:\*\*\s*`([^`]+)`/i);
            if (matchStatus) status = matchStatus[1].trim().toUpperCase();

            // Extrai estado_item
            const matchEstado = line.match(/^-\s*\*\*estado_item:\*\*\s*(.+)$/i);
            if (matchEstado) estadoItem = matchEstado[1].trim().toUpperCase();

            // Extrai Referências Normativas
            const matchRef = line.match(/^\*\*Referências Normativas:\*\*\s*(.+)$/i);
            if (matchRef) {
                refNormativas = matchRef[1]
                    .split('|')
                    .map(s => s.trim().split(' ')[0]) // Pega só o ID principal (ex: INT-000-01)
                    .filter(s => s.startsWith('DOC-') || s.startsWith('INT-') || s.startsWith('SEC-') || s.startsWith('RFC '));
            }

            // Extrai rastreia_para
            const matchRastreia = line.match(/^-\s*\*\*rastreia_para:\*\*\s*(.+)$/i);
            if (matchRastreia) {
                rastreiaPara = matchRastreia[1]
                    .split(',')
                    .map(s => s.trim());
            }

            // Verifica checkboxes no DoR marcados como concluídos
            const matchCheck = line.match(/^-\s*\[x\]\s*(.*(?:DOC-|INT-|SEC-).*)/i);
            if (matchCheck) {
                // Aqui seria idealmente feita uma busca física real. Para o lint estático,
                // pelo menos alertamos se há [x] em docs que podem não existir (Mock de validação).
                // Uma implementação mais robusta de FS pode ir aqui.
            }
        }

        // 1. Checagem de aspas tipográficas (opcional mas recomendado)
        if (/[\u201C\u201D]/.test(line)) {
            // console.error(`[Aviso] Aspas tipográficas encontradas em ${filePath}:${lineNum}`);
            // Não falha o lint
        }

        // 2. Checagem de referências de arquivo relativas
        // Captura links markdown como [texto](./caminho/arquivo.md)
        const linkRegex = /\]\(\s*([^http][^)]+)\s*\)/g;
        let match;
        while ((match = linkRegex.exec(line)) !== null) {
            let linkPath = match[1].trim();
            // Remove âncoras locais como #header
            linkPath = linkPath.split('#')[0];

            if (linkPath === '' || linkPath.startsWith('file:///')) continue;

            // Resolve o caminho baseado no diretório do arquivo atual
            const targetPath = path.resolve(path.dirname(filePath), linkPath);

            if (!fs.existsSync(targetPath)) {
                errors.push(`[Erro] Referência de arquivo quebrada: '${linkPath}' em ${filePath}:${lineNum}`);
            }
        }
    });

    // Pós-validações para User Stories
    if (isUS) {
        // Valida status vs estado_item
        if (status && estadoItem) {
            const allowedStatuses = ['DRAFT', 'READY', 'IN_PROGRESS', 'APPROVED', 'REJECTED'];

            if (!allowedStatuses.includes(status)) {
                errors.push(`[Erro] Status inválido '${status}' em ${filePath}. Valores permitidos: ${allowedStatuses.join(', ')}`);
            }
            if (!allowedStatuses.includes(estadoItem)) {
                errors.push(`[Erro] estado_item inválido '${estadoItem}' em ${filePath}. Valores permitidos: ${allowedStatuses.join(', ')}`);
            }

            if (status !== estadoItem) {
                errors.push(`[Erro] Divergência na US: Status ('${status}') vs estado_item ('${estadoItem}') não são idênticos em ${filePath}`);
            }
        }

        // Valida rastreabilidade
        if (refNormativas.length > 0) {
            for (const ref of refNormativas) {
                if (!rastreiaPara.includes(ref) && !ref.startsWith('RFC ')) {
                    errors.push(`[Erro] Referência Normativa faltante em rastreia_para: '${ref}' em ${filePath}`);
                }
            }
        }
    }
});

// ============================================================
// PASS A: Validação cruzada de IDs EX-* (Ponto 4.3)
// ============================================================

console.log('  [Pass A] Validando referências cruzadas de IDs EX-*...');

const exDefinitions = new Set();
const exReferences = []; // { id, file, line }

// 1) Coleta definições de EX-* em headings dos normativos
walkDir(NORMATIVOS_DIR, (filePath) => {
    if (!filePath.endsWith('.md')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line) => {
        // Definições: headings como "## EX-OAS-001" ou "### EX-OAS-001 —"
        const defMatch = line.match(/^#{2,4}\s+(EX-[A-Z]+-\d{3})/);
        if (defMatch) exDefinitions.add(defMatch[1]);

        // Definições em negrito no início da linha: "**EX-OAS-001**" ou "- **EX-OAS-001**"
        const boldDefMatch = line.match(/^\s*(?:-\s*)?\*\*(EX-[A-Z]+-\d{3})\*\*/);
        if (boldDefMatch) exDefinitions.add(boldDefMatch[1]);
    });
});

// 2) Coleta referências em todo docs/ (excluindo relatórios)
walkDir(DOCS_DIR, (filePath) => {
    if (!filePath.endsWith('.md')) return;
    if (LINT_EXCLUDE_PATTERNS.some(p => p.test(filePath))) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        // Ignora linhas de definição (headings)
        if (/^#{2,4}\s+EX-/.test(line)) return;
        // Ignora linhas de definição em negrito
        if (/^\s*(?:-\s*)?\*\*EX-[A-Z]+-\d{3}\*\*/.test(line)) return;

        const refs = [...line.matchAll(/EX-[A-Z]+-\d{3}/g)];
        for (const ref of refs) {
            exReferences.push({ id: ref[0], file: filePath, line: i + 1 });
        }
    });
});

for (const ref of exReferences) {
    if (!exDefinitions.has(ref.id)) {
        errors.push(`[Erro] ID '${ref.id}' referenciado mas não definido em nenhum normativo: ${ref.file}:${ref.line}`);
    }
}

console.log(`    ${exDefinitions.size} definições EX-*, ${exReferences.length} referências encontradas.`);

// ============================================================
// PASS B: Validação de referências de seção §N (Ponto 4.3)
// ============================================================

console.log('  [Pass B] Validando referências de seção (DOC-XXX §N)...');

// Coleta headings ## N por doc ID
const docSections = {}; // { "DOC-ARC-003": Set(["1","2","3",...]) }

walkDir(NORMATIVOS_DIR, (filePath) => {
    if (!filePath.endsWith('.md')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const idMatch = content.match(/\*\*id:\*\*\s*(DOC-[A-Z]+-\d+[A-Z]?)/i);
    if (!idMatch) return;
    const docId = idMatch[1];
    docSections[docId] = new Set();
    content.split('\n').forEach(line => {
        // Captura "## 1", "## 1.", "## 1)", "## 1 —"
        const secMatch = line.match(/^##\s+(\d+)/);
        if (secMatch) docSections[docId].add(secMatch[1]);
    });
});

// Busca referências DOC-XXX-NNN §N ou DOC-XXX-NNN (§N) (excluindo relatórios)
walkDir(DOCS_DIR, (filePath) => {
    if (!filePath.endsWith('.md')) return;
    if (LINT_EXCLUDE_PATTERNS.some(p => p.test(filePath))) return;
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach((line, i) => {
        const secRefs = [...line.matchAll(/(DOC-[A-Z]+-\d+[A-Z]?)\s*§(\d+)/gi)];
        for (const m of secRefs) {
            const [, docId, section] = m;
            if (docSections[docId] && !docSections[docId].has(section)) {
                errors.push(`[Erro] Seção §${section} referenciada em ${docId} não existe: ${filePath}:${i + 1}`);
            }
        }
    });
});

console.log(`    ${Object.keys(docSections).length} documentos mapeados com seções.`);

// ============================================================
// PASS C: Consistência ID-to-filename (Ponto 4.3)
// ============================================================

console.log('  [Pass C] Validando consistência ID vs filename...');

walkDir(NORMATIVOS_DIR, (filePath) => {
    if (!filePath.endsWith('.md')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const idMatch = content.match(/\*\*id:\*\*\s*(DOC-[A-Z]+-\d+[A-Z]?)/i);
    if (!idMatch) return;
    const declaredId = idMatch[1];
    const filename = path.basename(filePath);

    // Normaliza: DOC-GNP-00 → DOC-GNP-00, filename pode usar __ ou _
    const normalizedId = declaredId.replace(/-/g, '[-_]');
    const idRegex = new RegExp('^' + normalizedId, 'i');
    if (!idRegex.test(filename)) {
        errors.push(`[Erro] ID declarado '${declaredId}' não corresponde ao nome do arquivo: ${filename}`);
    }
});

// ============================================================
// PASS D: Validação do context-map.json (Ponto 4.1 + 4.3)
// ============================================================

console.log('  [Pass D] Validando context-map.json...');

const contextMapPath = path.resolve(__dirname, '../context-map.json');
if (fs.existsSync(contextMapPath)) {
    const contextMap = JSON.parse(fs.readFileSync(contextMapPath, 'utf8'));
    const existingDocIds = new Set();
    const PACOTES_DIR = path.resolve(__dirname, '..', '..', pathsConfig.paths.pacotes_agentes || 'docs/02_pacotes_agentes/');
    const MODULES_DIR_D = path.resolve(__dirname, '..', '..', pathsConfig.paths.modules || 'docs/04_modules/');
    const docSearchDirs = [NORMATIVOS_DIR, PACOTES_DIR, MODULES_DIR_D];
    for (const dir of docSearchDirs) {
        walkDir(dir, (fp) => {
            if (!fp.endsWith('.md')) return;
            const c = fs.readFileSync(fp, 'utf8');
            const m = c.match(/\*\*id:\*\*\s*([A-Z]+-[A-Z]+-\d+[A-Z]?)/i);
            if (m) existingDocIds.add(m[1]);
        });
    }

    for (const [skill, config] of Object.entries(contextMap.skills || {})) {
        for (const dep of (config.docs || [])) {
            if (!existingDocIds.has(dep.id)) {
                errors.push(`[Erro] context-map.json: skill '${skill}' referencia doc '${dep.id}' que não existe em normativos/ ou pacotes_agentes/`);
            }
            // CR-6: Validar que paths explícitos resolvem para arquivos existentes
            if (dep.path) {
                const resolvedPath = path.resolve(__dirname, '..', '..', dep.path);
                if (!fs.existsSync(resolvedPath)) {
                    errors.push(`[Erro] context-map.json: skill '${skill}' → doc '${dep.id}' aponta para path inexistente: '${dep.path}'`);
                }
            }
        }
    }
    console.log(`    ${Object.keys(contextMap.skills || {}).length} skills validadas contra ${existingDocIds.size} documentos.`);
} else {
    console.log('    context-map.json não encontrado, pulando validação.');
}

// ============================================================
// PASS E: Validação de dependências cross-módulo (ciclos)
// ============================================================

console.log('  [Pass E] Validando dependências cross-módulo (ciclos)...');

const MODULES_DIR = path.resolve(__dirname, '..', '..', pathsConfig.paths.modules || 'docs/04_modules/');
const depGraphPath = path.join(MODULES_DIR, 'DEPENDENCY-GRAPH.md');

if (fs.existsSync(depGraphPath)) {
    const depContent = fs.readFileSync(depGraphPath, 'utf8');

    // Extrai bloco YAML entre BEGIN:DEPENDENCY_GRAPH e END:DEPENDENCY_GRAPH
    const graphMatch = depContent.match(/<!-- BEGIN:DEPENDENCY_GRAPH -->\s*```yaml\s*([\s\S]*?)```\s*<!-- END:DEPENDENCY_GRAPH -->/);
    if (graphMatch) {
        const graphBlock = graphMatch[1];
        const graph = {}; // { "MOD-000": ["MOD-001", ...] }

        // Parse simples do YAML (não precisa de lib)
        for (const line of graphBlock.split('\n')) {
            const m = line.match(/^\s*(MOD-\d{3}):\s*\[(.*)\]/);
            if (m) {
                const modId = m[1];
                const deps = m[2]
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.startsWith('MOD-'));
                graph[modId] = deps;
            }
        }

        // DFS para detectar ciclos
        const visited = new Set();
        const inStack = new Set();
        const cyclePaths = [];

        function dfs(node, pathSoFar) {
            if (inStack.has(node)) {
                const cycleStart = pathSoFar.indexOf(node);
                cyclePaths.push(pathSoFar.slice(cycleStart).concat(node));
                return;
            }
            if (visited.has(node)) return;

            visited.add(node);
            inStack.add(node);
            for (const dep of (graph[node] || [])) {
                dfs(dep, [...pathSoFar, node]);
            }
            inStack.delete(node);
        }

        for (const modId of Object.keys(graph)) {
            dfs(modId, []);
        }

        if (cyclePaths.length > 0) {
            for (const cycle of cyclePaths) {
                errors.push(`[Erro] Ciclo de dependência detectado: ${cycle.join(' → ')}`);
            }
        }

        // Valida que cada manifesto do módulo §4 é consistente com o grafo central
        for (const [modId, expectedDeps] of Object.entries(graph)) {
            const modDirName = fs.readdirSync(MODULES_DIR).find(d => d.startsWith(modId.toLowerCase().replace('-', '-')));
            if (!modDirName) continue;
            // Convenção: manifesto do módulo tem mesmo nome do diretório (ex: mod-001-backoffice-admin.md)
            const modMdPath = path.join(MODULES_DIR, modDirName, modDirName + '.md');
            if (!fs.existsSync(modMdPath)) continue;

            const modContent = fs.readFileSync(modMdPath, 'utf8');
            // Extrai dependências de §4 (formato "**Depende de:**" ou tabela "| MOD-XXX |")
            const declaredDeps = new Set();
            // Localiza seção de dependências (## 4. Dependências ou ## N.N Dependências)
            const depSectionMatch = modContent.match(/## [\d.]+\s*Dependências([\s\S]*?)(?=\n## |\n---\s*\n## |$)/i);
            const depSection = depSectionMatch ? depSectionMatch[0] : '';
            // Formato 1: "**Depende de:** MOD-XXX"
            const depLines = depSection.match(/\*\*Depende de:\*\*\s*(.*)/g) || [];
            for (const line of depLines) {
                const refs = [...line.matchAll(/MOD-\d{3}/g)];
                for (const ref of refs) declaredDeps.add(ref[0]);
            }
            // Formato 2: tabela "| MOD-XXX | Relação | Detalhe |"
            const tableLines = depSection.match(/\|\s*MOD-\d{3}\s*\|/g) || [];
            for (const tl of tableLines) {
                const refs = [...tl.matchAll(/MOD-\d{3}/g)];
                for (const ref of refs) declaredDeps.add(ref[0]);
            }
            // Caso especial: MOD-000 não depende de ninguém
            if (modId === 'MOD-000' && declaredDeps.size === 0) continue;
            // Caso especial: "Nenhum módulo" = sem dependências
            if (depSection.match(/nenhum/i) && expectedDeps.length === 0) continue;

            for (const expected of expectedDeps) {
                if (!declaredDeps.has(expected)) {
                    errors.push(`[Aviso] ${modId}/${modDirName}.md §4 não declara dependência de ${expected} (presente no DEPENDENCY-GRAPH.md)`);
                }
            }
        }

        console.log(`    ${Object.keys(graph).length} módulos, ${cyclePaths.length} ciclos detectados.`);
    } else {
        console.log('    DEPENDENCY-GRAPH.md encontrado mas sem bloco YAML delimitado.');
    }
} else {
    console.log('    DEPENDENCY-GRAPH.md não encontrado, pulando validação de ciclos.');
}

// ============================================================
// RESULTADO FINAL
// ============================================================

if (errors.length > 0) {
    fs.writeFileSync('lint-errors.json', JSON.stringify(errors, null, 2));
    console.error(`--- Lint falhou: ${errors.length} erros encontrados (veja lint-errors.json) ---`);
    process.exit(1);
} else {
    console.log('--- Lint concluído com sucesso ---');
}
