---
description: Gera ou atualiza o `docker-compose.yml` do projeto executando o script `generate.mjs`, que parseia o DOC-PADRAO-001 como fonte de verdade. Triggers: "gerar docker-compose", "regenerar docker-compose", "atualizar docker-compose", "sincronizar docker-compose".
---

# Skill: generate-docker-compose

## Objetivo

Manter o `docker-compose.yml` sincronizado com os padrões do projeto, rodando um script que **lê** o `DOC-PADRAO-001` e **escreve** o arquivo deterministicamente — sem intervenção manual ou inferência do agente.

---

## Estrutura da Skill

```
.agents/skills/generate-docker-compose/
├── SKILL.md                  ← este arquivo
└── scripts/
    └── generate.mjs          ← script Node.js que gera o docker-compose.yml
```

---

## 1. Gatilhos de Ativação

- `"gerar docker-compose"`
- `"regenerar docker-compose"`
- `"atualizar docker-compose"`
- `"sincronizar docker-compose"`

---

## 2. Fonte de Verdade

Toda configuração do `docker-compose.yml` vem **exclusivamente** de:

```
docs/01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md
```

Para alterar qualquer serviço, versão de imagem, porta ou variável, **edite o normativo primeiro** e depois execute o script.

---

## 3. Execução

### PASSO 1 — Rodar o script

Execute na raiz do projeto:

```powershell
node .agents/skills/generate-docker-compose/scripts/generate.mjs
```

O script vai:

1. Ler o `DOC-PADRAO-001`
2. Extrair automaticamente via regex:
   - Versão do PostgreSQL (linha `Imagem: \`postgres:X-alpine\``)
   - Versão do Redis (linha `Imagem: \`redis:X-alpine\``)
   - Versão do Node.js (linha `\`node:X-alpine\``)
   - Portas expostas de cada serviço
   - Default do `PROJECT_NAME`
   - Default do `API_PORT`
   - Comandos de start da `api` (`pnpm dev`) e do `worker` (`pnpm dev:worker`)
3. Gerar o `docker-compose.yml` na raiz com cabeçalho de rastreabilidade

### PASSO 2 — Verificar o output

O script imprime no terminal um relatório dos valores extraídos antes de gravar o arquivo:

```
📋 Valores extraídos do DOC-PADRAO-001:
   PostgreSQL  : postgres:17-alpine  (porta 5432)
   Redis       : redis:7-alpine      (porta 6379)
   Node.js     : node:20-alpine
   PROJECT_NAME default: easya1
   API_PORT    default : 3000
   Cmd api     : pnpm dev
   Cmd worker  : pnpm dev:worker

✅ docker-compose.yml atualizado em: .../docker-compose.yml

📌 Comandos de uso:
   docker compose up -d                    # apenas infraestrutura (postgres + redis)
   docker compose --profile full up -d     # infraestrutura + api + worker
```

Se algum valor **não for encontrado** no normativo, o script imprime `[ERRO]` e encerra com código `1` — sem gerar arquivo parcial.

---

## 4. Estrutura do arquivo gerado

O `docker-compose.yml` gerado segue sempre esta estrutura:

```yaml
# ============================================================
# docker-compose.yml
# Gerado automaticamente em: <timestamp ISO 8601>
# Fonte de verdade: docs/01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md
#
# Para atualizar este arquivo:
#   1. Edite o DOC-PADRAO-001 com os novos valores
#   2. Execute: node .agents/skills/generate-docker-compose/scripts/generate.mjs
# ============================================================

services:
  postgres:
    image: postgres:<VER>-alpine
    container_name: ${PROJECT_NAME:-<default>}-postgres
    ports:
      - "<PORT>:<PORT>"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-admin}
      POSTGRES_DB: ${POSTGRES_DB:-<default>}
    volumes:
      - pg-data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:<VER>-alpine
    container_name: ${PROJECT_NAME:-<default>}-redis
    ports:
      - "<PORT>:<PORT>"
    restart: unless-stopped

  api:                        # profile: full
    image: node:<VER>-alpine
    container_name: ${PROJECT_NAME:-<default>}-api
    working_dir: /usr/src/app
    volumes:
      - .:/usr/src/app
    ports:
      - "${API_PORT:-<default>}:<default>"
    command: <cmd_api>
    depends_on: [postgres, redis]
    profiles: [full]

  worker:                     # profile: full
    image: node:<VER>-alpine
    container_name: ${PROJECT_NAME:-<default>}-worker
    working_dir: /usr/src/app
    volumes:
      - .:/usr/src/app
    command: <cmd_worker>
    depends_on: [postgres, redis]
    profiles: [full]

volumes:
  pg-data:
    driver: local
```

---

## 5. Regras para manutenção do script

Se o normativo mudar a forma de escrever um valor (ex: mudar `→` para `->`), atualize o regex correspondente em `generate.mjs`. Os patterns estão documentados em comentários dentro do script.

Se um novo serviço for adicionado ao normativo, adicione:

1. A nova seção no `DOC-PADRAO-001` (§3.3)
2. O bloco de extração e o bloco YAML correspondentes no `generate.mjs`
