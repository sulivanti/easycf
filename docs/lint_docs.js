const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../docs');
let hasErrors = false;

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

console.log('--- Inciando linting de documentação ---');

walkDir(DOCS_DIR, (filePath) => {
    if (!filePath.endsWith('.md')) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const lineNum = index + 1;

        // 1. Checagem de aspas tipográficas (opcional mas recomendado)
        if (/[“”]/.test(line)) {
            console.error(`[Aviso] Aspas tipográficas encontradas em ${filePath}:${lineNum}`);
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

            if (linkPath === '') continue; // Link era apenas local #hash

            // Resolve o caminho baseado no diretório do arquivo atual
            const targetPath = path.resolve(path.dirname(filePath), linkPath);

            if (!fs.existsSync(targetPath)) {
                console.error(`[Erro] Referência de arquivo quebrada: '${linkPath}' em ${filePath}:${lineNum}`);
                hasErrors = true;
            }
        }
    });
});

if (hasErrors) {
    console.error('--- Lint falhou: links quebrados encontrados ---');
    process.exit(1);
} else {
    console.log('--- Lint concluído com sucesso ---');
}
