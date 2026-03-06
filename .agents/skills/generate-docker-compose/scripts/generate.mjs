#!/usr/bin/env node
/**
 * generate.mjs
 * Lê o DOC-PADRAO-001 e gera o docker-compose.yml na raiz do projeto.
 *
 * Uso:
 *   node .agents/skills/generate-docker-compose/scripts/generate.mjs
 *
 * Fonte de verdade:
 *   docs/01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../../../');
const NORMATIVE = resolve(ROOT, 'docs/01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md');
const OUTPUT = resolve(ROOT, 'docker-compose.yml');

// ─────────────────────────────────────────────
// 1. Leitura do normativo
// ─────────────────────────────────────────────
if (!existsSync(NORMATIVE)) {
    console.error(`[ERRO] Normativo não encontrado: ${NORMATIVE}`);
    process.exit(1);
}

const doc = readFileSync(NORMATIVE, 'utf-8');

/**
 * Extrai o valor de uma linha do markdown no padrão:
 *   - Imagem: `postgres:17-alpine`
 *   - Porta Exposta: `5432`
 */
function extract(pattern, label) {
    const match = doc.match(pattern);
    if (!match) {
        console.error(`[ERRO] Não foi possível extrair: "${label}". Verifique o DOC-PADRAO-001.`);
        process.exit(1);
    }
    return match[1].trim();
}

// Extrai versão do postgres (ex: "17" de "postgres:17-alpine")
const pgImage = extract(/Imagem:\s*`postgres:([^-`]+)-alpine`/, 'Imagem do PostgreSQL');
// Extrai versão do redis (ex: "7" de "redis:7-alpine")
const redisVer = extract(/Imagem:\s*`redis:([^-`]+)-alpine`/, 'Imagem do Redis');
// Extrai versão do Node.js (ex: "20" de "node:20-alpine")
const nodeVer = extract(/`node:(\d+)-alpine`/, 'Versão do Node.js');

// Extrai porta do postgres
const pgPort = extract(/#### Banco de Dados[^#]+Porta Exposta:\s*`(\d+)`/, 'Porta do PostgreSQL');
// Extrai porta do redis
const redisPort = extract(/#### Cache[^#]+Porta Exposta:\s*`(\d+)`/, 'Porta do Redis');

// Extrai default do PROJECT_NAME (ex: "easya1" de "${PROJECT_NAME:-easya1}")
const projectDefault = extract(/\$\{PROJECT_NAME:-([^}]+)\}-postgres/, 'Default do PROJECT_NAME');

// Extrai porta default da API (ex: "3000" de "default: `3000`")
const apiPortDefault = extract(/API_PORT.*?default:\s*`(\d+)`/, 'Porta default da API');

// Extrai comando da api (ex: "pnpm dev")
const apiCmd = extract(/`api`\s*[→►]\s*`([^`]+)`/, 'Comando da api');
// Extrai comando do worker
const workerCmd = extract(/`worker`\s*[→►]\s*`([^`]+)`/, 'Comando do worker');

// ─────────────────────────────────────────────
// 2. Relatório do que foi extraído
// ─────────────────────────────────────────────
console.log('\n📋 Valores extraídos do DOC-PADRAO-001:');
console.log(`   PostgreSQL  : postgres:${pgImage}-alpine  (porta ${pgPort})`);
console.log(`   Redis       : redis:${redisVer}-alpine    (porta ${redisPort})`);
console.log(`   Node.js     : node:${nodeVer}-alpine`);
console.log(`   PROJECT_NAME default: ${projectDefault}`);
console.log(`   API_PORT    default : ${apiPortDefault}`);
console.log(`   Cmd api     : ${apiCmd}`);
console.log(`   Cmd worker  : ${workerCmd}`);
console.log('');

// ─────────────────────────────────────────────
// 3. Geração do docker-compose.yml
// ─────────────────────────────────────────────
const timestamp = new Date().toISOString();

const yaml = `# ============================================================
# docker-compose.yml
# Gerado automaticamente em: ${timestamp}
# Fonte de verdade: docs/01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md
#
# Para atualizar este arquivo:
#   1. Edite o DOC-PADRAO-001 com os novos valores
#   2. Execute: node .agents/skills/generate-docker-compose/scripts/generate.mjs
# ============================================================

services:
  # Banco de Dados
  postgres:
    image: postgres:${pgImage}-alpine
    container_name: \${PROJECT_NAME:-${projectDefault}}-postgres
    ports:
      - "${pgPort}:${pgPort}"
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-admin}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-admin}
      POSTGRES_DB: \${POSTGRES_DB:-${projectDefault}}
    volumes:
      - pg-data:/var/lib/postgresql/data
    restart: unless-stopped

  # Cache e Fila
  redis:
    image: redis:${redisVer}-alpine
    container_name: \${PROJECT_NAME:-${projectDefault}}-redis
    ports:
      - "${redisPort}:${redisPort}"
    restart: unless-stopped

  # API (profile: full)
  api:
    image: node:${nodeVer}-alpine
    container_name: \${PROJECT_NAME:-${projectDefault}}-api
    working_dir: /usr/src/app
    volumes:
      - .:/usr/src/app
    ports:
      - "\${API_PORT:-${apiPortDefault}}:${apiPortDefault}"
    command: ${apiCmd}
    depends_on:
      - postgres
      - redis
    profiles:
      - full

  # Worker (profile: full)
  worker:
    image: node:${nodeVer}-alpine
    container_name: \${PROJECT_NAME:-${projectDefault}}-worker
    working_dir: /usr/src/app
    volumes:
      - .:/usr/src/app
    command: ${workerCmd}
    depends_on:
      - postgres
      - redis
    profiles:
      - full

volumes:
  pg-data:
    driver: local
`;

// ─────────────────────────────────────────────
// 4. Escrita do arquivo
// ─────────────────────────────────────────────
const existed = existsSync(OUTPUT);
writeFileSync(OUTPUT, yaml, 'utf-8');

console.log(`✅ docker-compose.yml ${existed ? 'atualizado' : 'criado'} em: ${OUTPUT}`);
console.log('\n📌 Comandos de uso:');
console.log('   docker compose up -d                    # apenas infraestrutura (postgres + redis)');
console.log('   docker compose --profile full up -d     # infraestrutura + api + worker');
