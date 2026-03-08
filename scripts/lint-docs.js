const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../docs');
let errors = [];

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
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
        if (/[“”]/.test(line)) {
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
            const allowedStatuses = ['DRAFT', 'REFINING', 'READY', 'IN_PROGRESS', 'APPROVED', 'REJECTED'];

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

if (errors.length > 0) {
    fs.writeFileSync('lint-errors.json', JSON.stringify(errors, null, 2));
    console.error(`--- Lint falhou: ${errors.length} erros encontrados (veja lint-errors.json) ---`);
    process.exit(1);
} else {
    console.log('--- Lint concluído com sucesso ---');
}
