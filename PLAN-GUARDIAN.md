# Plano: Guardian — Sistema de Enforcement de Regras em Tempo Real

## Contexto

As regras do CLAUDE.md (proibição de mock data, idioma pt-BR, obrigatoriedade de amendments) são violadas esporadicamente durante conversas longas, especialmente após compactação de contexto. O projeto já possui 34 skills de governança e validação, mas falta **enforcement em tempo real** — os skills existentes são reativos (validam depois), não preventivos.

O Guardian usa **hooks do Claude Code** para interceptar ações ANTES e DEPOIS da execução, bloqueando violações automaticamente e injetando lembretes contextuais.

## Arquitetura

```
Camada 1 — UserPromptSubmit    → Lembrete contextual de regras (quando relevante)
Camada 2 — PreToolUse(Edit|Write) → Bloqueia edição direta de código sem amendment
Camada 3 — PostToolUse(Edit|Write) → Detecta mock/dummy data em código de produção
Camada 4 — Skill /guardian      → Checkpoint auto-invocável para ações complexas
```

Todos os hooks são do tipo `command` (Node.js), sem LLM — latência < 100ms cada.

## Arquivos a Criar

```
.agents/scripts/guardian/
├── guard-utils.js              ← Utilitários: classificação de arquivos, mapeamento módulo
├── guard-production-edit.js    ← PreToolUse: bloqueia edição sem amendment
├── guard-mock-data.js          ← PostToolUse: detecta mock data em produção
└── guard-session-reminder.js   ← UserPromptSubmit: injeta lembretes

.claude/commands/guardian.md    ← Skill auto-invocável: checkpoint antes de ações críticas
.claude/settings.json           ← Novo arquivo com hooks Guardian (compartilhável via git)
```

## Detalhamento

### 1. `guard-utils.js` — Utilitários Compartilhados

Funções:
- **`readStdin()`** — lê JSON do stdin (padrão de todos os hooks)
- **`classifyFile(filePath)`** — retorna `{ protected: bool, exempt: bool, reason: string }`
  - **Isentos** (não bloqueia): `*.test.ts`, `*.spec.ts`, `seed-*.ts`, `docs/**`, `.claude/**`, `.agents/**`, `*.md`, `*.json`, `*.yaml`, `*.yml`, `*.css`, configs (`drizzle.config.*`, `vite.config.*`, `tsconfig.*`, `package.json`)
  - **Protegidos** (requer amendment): `apps/api/src/**/*.ts`, `apps/web/src/**/*.{ts,tsx}`, `packages/**/*.{ts,tsx}`
- **`resolveModule(filePath)`** — mapeia path → MOD-NNN usando `paths.json`
- **`hasAmendmentContext(moduleId)`** — verifica se existe contexto normativo:
  1. Procura amendments DRAFT com mtime < 60min em `docs/04_modules/mod-NNN-*/amendments/`
  2. Verifica `execution-state/MOD-NNN.json` por codegen com status recente

Referências:
- `.agents/paths.json` — caminhos centralizados (já existe)
- `.agents/execution-state/MOD-NNN.json` — estado de codegen (já existe)
- `.agents/scripts/validate-module-specs.js:1-12` — padrão de leitura de paths.json

### 2. `guard-production-edit.js` — PreToolUse Hook

**Evento:** PreToolUse | **Matcher:** `Write|Edit` | **Timeout:** 5s

Fluxo:
1. Lê `tool_input.file_path` do stdin
2. `classifyFile()` → se isento, `exit 0` (permite)
3. Se protegido, `resolveModule()` para encontrar MOD-NNN
4. `hasAmendmentContext(moduleId)` → se tem contexto, `exit 0`
5. Se **sem contexto normativo**: emite JSON e `exit 2` (BLOQUEIA)

Saída de bloqueio:
```
GUARDIAN: Arquivo protegido ({path}) não pode ser editado diretamente.
Módulo: {moduleId}
Ação necessária: Execute /create-amendment primeiro, depois /codegen-agent.
Referência: CLAUDE.md §Alterações de código
```

**Fail-safe:** try/catch global com `exit 0` — se o script falhar, permite a ação (fail-open).

### 3. `guard-mock-data.js` — PostToolUse Hook

**Evento:** PostToolUse | **Matcher:** `Write|Edit` | **Timeout:** 5s

Fluxo:
1. Lê `tool_input` — extrai conteúdo (`content` para Write, `new_string` para Edit)
2. `classifyFile()` → se isento, `exit 0`
3. Escaneia com regex patterns de mock data:
   - `faker`, `mock[A-Z]`, `dummy`, `placeholder`, `hardcoded`
   - Arrays literais com nomes genéricos (John, Jane, Test, Lorem ipsum)
   - Emails fictícios (test@, example.com)
4. Se detecta: emite warning via stderr (PostToolUse não bloqueia, mas Claude vê o aviso)

```
⚠ GUARDIAN: Possível dado mock detectado em {file_path}:
- Padrão encontrado: {pattern}
- Regra: CLAUDE.md proíbe dados mock em código de produção.
- Ação: Substitua por dados reais da API.
```

### 4. `guard-session-reminder.js` — UserPromptSubmit Hook

**Evento:** UserPromptSubmit | **Timeout:** 3s

Fluxo:
1. Lê o prompt do usuário do stdin
2. Se contém keywords de edição (`editar|alterar|implementar|corrigir|fix|codegen|código`), emite lembrete
3. Caso contrário, sai silenciosamente

Saída (adicionada ao contexto do Claude):
```
[GUARDIAN] Regras ativas: (1) Código → /create-amendment primeiro (2) Mock data proibido em produção (3) Responder em pt-BR
```

### 5. Skill `/guardian` — Checkpoint Manual/Auto

**Arquivo:** `.claude/commands/guardian.md`

Skill auto-invocável (sem `disable-model-invocation`) que Claude pode chamar antes de ações críticas. Recebe `$ARGUMENTS` com o path ou intenção, e:

1. Identifica módulo afetado
2. Lê execution-state do módulo
3. Verifica amendments DRAFT existentes
4. Emite diagnóstico: OK, BLOQUEIO, ou AVISO

### 6. Configuração de Hooks

**Novo arquivo:** `.claude/settings.json` (committável, compartilhado)

Contém apenas a seção `hooks`. A seção `permissions` permanece em `settings.local.json`.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "node .agents/scripts/guardian/guard-production-edit.js",
          "timeout": 5,
          "statusMessage": "Guardian: verificando contexto normativo..."
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "node .agents/scripts/guardian/guard-mock-data.js",
          "timeout": 5,
          "statusMessage": "Guardian: verificando dados mock..."
        }]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [{
          "type": "command",
          "command": "node .agents/scripts/guardian/guard-session-reminder.js",
          "timeout": 3,
          "statusMessage": "Guardian: contexto de regras..."
        }]
      }
    ]
  }
}
```

O hook existente de markdownlint (pen-*-pendente.md) permanece em `settings.local.json`.

## Mapeamento Módulo ↔ Pasta de Código

Derivado de `paths.json` e execution-state:

| Slug no path | Módulo |
|---|---|
| `foundation` | MOD-000 |
| `backoffice-admin` | MOD-001 |
| `users` | MOD-002 |
| `org-units` | MOD-003 |
| `identity-advanced` | MOD-004 |
| `process-modeling` | MOD-005 |
| `case-execution` | MOD-006 |
| `contextual-params` | MOD-007 |
| `integration-protheus` | MOD-008 |
| `movement-approval` | MOD-009 |
| `mcp` | MOD-010 |
| `dashboard` / `smartgrid` | MOD-011 |

## Ordem de Implementação

1. **guard-utils.js** — base compartilhada
2. **guard-production-edit.js** — regra mais crítica (PreToolUse)
3. **guard-mock-data.js** — segunda regra mais violada
4. **guard-session-reminder.js** — reforço contextual
5. **guardian.md** — skill de checkpoint
6. **settings.json** — ativar os hooks
7. **Teste end-to-end** de cada hook

## Verificação

1. **Teste PreToolUse:** Tentar editar `apps/api/src/modules/org-units/domain/entities/org-unit.entity.ts` sem amendment → deve bloquear
2. **Teste PostToolUse:** Escrever `const mockUsers = [{name: "John"}]` em arquivo .ts de produção → deve emitir warning
3. **Teste UserPromptSubmit:** Enviar prompt com "implementar feature X" → deve ver lembrete de regras
4. **Teste isenção:** Editar arquivo em `docs/` ou `.agents/` → deve permitir sem bloqueio
5. **Teste fail-open:** Forçar erro no script (path inválido para paths.json) → deve permitir a ação (exit 0)
