# Skill: codegen-agent

Executa um único agente de geração de código PKG-COD-001 sobre um módulo, assumindo a persona do agente especialista. Opera em duas fases: Plan (file tree) → Emit (1 arquivo por vez).

> **Caminhos:** `.agents/paths.json` | **Registro:** `.agents/codegen-registry.json` | **Contexto normativo:** `.agents/context-map.json` → `codegen-agent`

## Argumento

$ARGUMENTS deve conter dois parâmetros separados por espaço:

1. **Caminho do módulo** (ex: `docs/04_modules/mod-000-foundation/`)
2. **ID do agente** (ex: `AGN-COD-DB`)

Se não fornecido, pergunte ao usuário.

Agentes válidos: `AGN-COD-DB`, `AGN-COD-CORE`, `AGN-COD-APP`, `AGN-COD-API`, `AGN-COD-WEB`, `AGN-COD-VAL`.

---

## PASSO 1: Carregar Configuração do Agente

Leia `.agents/codegen-registry.json` e extraia a entrada do agente solicitado:
- `name`, `layer`, `allowed_prefixes`, `pkg_section`, `required_docs`, `required_specs`, `depends_on`, `post_validation`

Se o ID não existir no registro, aborte com mensagem de erro.

## PASSO 2: Gate de Governança

Leia o manifesto do módulo (arquivo `<dirname>.md`, ex: `mod-000-foundation.md`).

### 2.1 Existência do módulo

- Se o módulo **não existir**, aborte: `"Módulo não encontrado. Execute /forge-module primeiro."`

### 2.2 Estado READY obrigatório

- Se `estado_item` do módulo **NÃO** for `READY`, aborte: `"Módulo não está READY. O codegen requer especificações seladas (READY). Execute /promote-module primeiro."`

> **Gate invertido vs enriquecimento:** Enriquecimento requer DRAFT; codegen requer READY (spec selada).

### 2.3 Resolução do slug do módulo

Extraia o slug a partir de `module_paths` do manifesto:
1. Se existe `API (código)` → extraia slug de `apps/api/src/modules/{slug}/`
2. Senão, se existe `Web` → extraia slug de `apps/web/src/modules/{slug}/`
3. Se não encontrar nenhum path de código, aborte: `"module_paths não contém caminhos de código. Verifique o manifesto."`

Armazene o slug para substituição em `allowed_prefixes` (ex: `{slug}` → `foundation`).

### 2.4 Auto-filter por nível arquitetural

Extraia o nível do módulo da seção "Nível de Arquitetura":
- **Nível 0** → apenas `AGN-COD-WEB` e `AGN-COD-VAL` são permitidos
- **Nível 1** → sem `AGN-COD-CORE` (pular camada Domain)
- **Nível 2** → todas as camadas permitidas

Consulte `level_filter` no registro para validar. Se o agente solicitado **não** é permitido para o nível do módulo:
- Emita aviso: `"⚠️ Agente {agent_id} ({layer}) não é aplicável para módulos Nível {N}. Skipping."`
- **Encerre sem erro** (exit graceful, não é falha)

### 2.5 Verificar scaffold existe

- Se o agente opera em `apps/api/` → verifique se `apps/api/package.json` existe
- Se o agente opera em `apps/web/` → verifique se `apps/web/package.json` existe
- Se não existe, aborte: `"Scaffold não encontrado. Execute /app-scaffold primeiro."`

## PASSO 3: Ingestão de Contexto Mínimo

**PARE.** Antes de gerar qualquer conteúdo, leia **obrigatoriamente** e **apenas**:

1. `docs/02_pacotes_agentes/PKG-COD-001_Pacote_Agentes_Geracao_Codigo.md`:
   - Seção `§0` (contrato de execução — envelope, regras, anti-patterns)
   - Seção do agente atual (conforme `pkg_section` do registro)
2. Os documentos listados em `required_docs` do agente no registro (resolver paths via `docs/01_normativos/`)
3. `docs/01_normativos/DOC-FND-000__Foundation.md` §2-§3 (anti-patterns Foundation — **sempre**)
4. Os artefatos de especificação do módulo conforme `required_specs`:
   - `DATA-*` → ler `requirements/data/` do módulo
   - `BR-*` → ler `requirements/br/` do módulo
   - `FR-*` → ler `requirements/fr/` do módulo
   - `SEC-*` → ler `requirements/sec/` do módulo
   - `UX-*` → ler `requirements/ux/` do módulo
   - `INT-*` → ler `requirements/int/` do módulo
   - `*` (AGN-COD-VAL) → ler todos os `requirements/` do módulo
5. Código já existente nas `allowed_prefixes` (se houver, para incrementar ao invés de sobrescrever)

**NÃO** leia documentos além dos listados acima. Economia de contexto é crítica.

## PASSO 4: Assumir Persona do Agente

Adote o **system prompt** definido em PKG-COD-001 §5 para este agente. Internalize:

- Você **é** o agente `{agent_id}` (`{agent_name}`)
- Seu propósito é gerar código para a camada `{layer}`
- Suas regras são as do contrato §0 + as específicas da sua seção
- **ZERO ALUCINAÇÃO:** não invente dependências ou fatos. Lacunas → registre em `missing_info`
- **Anti-patterns Foundation:** não recrie DDL/migrations de `users`, `tenants` ou guardiões genéricos de auth (AGN-COD-DB). Não recrie middlewares de JWT, autenticação ou parsing de token (AGN-COD-API). Utilize guards existentes (ex: `@RequireScope`).
- **Rastreabilidade:** incluir `@contract EX-...` em cabeçalhos/JSDoc de artefatos relevantes
- **Ownership:** você só pode escrever em `allowed_prefixes` (com `{slug}` substituído)

## PASSO 5: FASE A — PLAN

Gere o plano de arquivos (file tree) **sem gerar conteúdo**:

1. Analise as especificações ingeridas (PASSO 3)
2. Para cada arquivo que precisa ser criado/modificado, liste:
   - `path` (dentro de `allowed_prefixes`, com `{slug}` resolvido)
   - `purpose` (breve descrição do arquivo)
   - `contract_refs` (IDs EX-*, BR-*, FR-*, etc. que motivam o arquivo)
3. Valide ownership: **nenhum** arquivo pode estar fora de `allowed_prefixes`

### 5.1 Validação Estrutural do Plano (MUST)

Antes de apresentar ao usuário, valide a conformidade estrutural:

**Se AGN-COD-CORE:**
- [ ] Todos os arquivos `*error*` no plano DEVEM estar em `domain/errors/`
- [ ] O plano DEVE incluir import de `DomainError` do Foundation (conforme PKG-COD-001 §3.2 contratos)

**Se AGN-COD-WEB:**
- [ ] A estrutura de diretórios DEVE seguir **Pattern A**: `api/`, `components/`, `hooks/`, `pages/`, `types/`
- [ ] DEVE existir pelo menos 1 arquivo em `hooks/` que use `@tanstack/react-query`
- [ ] **NUNCA** usar Pattern B (`data/`, `domain/`, `ui/`) — se detectado, corrija antes de apresentar

Se qualquer check falhar, corrija o plano antes de apresentar ao usuário.

**Exemplo — AGN-COD-CORE: plano rejeitado e corrigido:**

```
⚠ Validação Estrutural 5.1 — 2 violações detectadas no plano:

1. ❌ resource-not-available.error.ts → plano não referencia import de DomainError
   Correção: adicionado import { DomainError } from '@modules/foundation/domain/errors/domain-errors'

2. ❌ Plano lista 'domain/errors/resource-not-available.error.ts' com extends Error
   Correção: alterado para extends DomainError + adicionado type + statusHint

Plano corrigido antes de apresentar ao usuário. ✅
```

**Exemplo — AGN-COD-WEB: plano rejeitado e corrigido:**

```
⚠ Validação Estrutural 5.1 — 1 violação detectada no plano:

1. ❌ Estrutura planejada usa Pattern B (data/, domain/, ui/)
   Esperado: Pattern A (api/, components/, hooks/, pages/, types/)
   Correção: reestruturado file_tree:
     - data/{slug}.api.ts     → api/{slug}.api.ts
     - domain/{slug}.types.ts → types/{slug}.types.ts
     - ui/ItemListPage.tsx    → pages/ItemListPage.tsx
     + hooks/use-items.ts (adicionado — useQuery wrapper)
     + components/ (diretório criado)

Plano corrigido antes de apresentar ao usuário. ✅
```

4. Apresente o plano ao usuário:

```
## Plano de Arquivos — {agent_id} ({agent_name})

**Módulo:** {caminho_modulo} (slug: {slug})
**Camada:** {layer}

### Arquivos a gerar ({N} total)
| # | Path | Propósito | Refs |
|---|------|-----------|------|
| 1 | apps/api/src/modules/{slug}/{layer}/... | ... | BR-001, EX-OAS-001 |
| ... | ... | ... | ... |

### Notas
- {observações, se houver}

Confirma a geração? (sim/não)
```

Aguarde confirmação do usuário. Se recusar, encerre.

## PASSO 6: FASE B — EMIT_FILES

Após confirmação, gere **1 arquivo por vez**, na ordem do plano:

1. Para cada arquivo na lista `ordered_files`:
   a. Anuncie: `### Emitindo: {path} ({M}/{total})`
   b. Gere o conteúdo TypeScript/YAML completo do arquivo
   c. Inclua header `@contract` com os EX-* e IDs de requisitos aplicáveis
   d. Escreva o arquivo no disco usando a ferramenta Write
   e. Emita progresso: `✅ {path} — {N} linhas`

2. Regras de conteúdo:
   - **TypeScript:** usar ESM imports, strict types, sem `any`
   - **Schemas Drizzle:** seguir DOC-GNP-00 + DOC-PADRAO-002
   - **OpenAPI:** seguir EX-OAS-001..004
   - **Testes:** colocar em `test/` ou `__tests__/` conforme convenção
   - **@contract:** todo artefato deve referenciar os IDs normativos que o motivam

3. Se o arquivo já existe:
   - **Leia** o conteúdo atual
   - **Incremente/atualize** ao invés de sobrescrever, preservando código existente
   - Informe no progresso: `🔄 {path} — atualizado ({N} linhas adicionadas)`

## PASSO 7: Validação Pós-Geração

### 7.1 Validação de Skills (se `post_validation` não vazio)

Se `post_validation` do agente contém skills:

1. Para cada skill em `post_validation`, invoque-a:
   - `validate-drizzle` → valida schemas Drizzle gerados
   - `validate-openapi` → valida contratos OpenAPI gerados
   - `validate-endpoint` → valida endpoints Fastify gerados
2. Registre resultados de cada validação

### 7.2 Validação Arquitetural por Agente (MUST — sempre executar)

Independentemente de `post_validation`, execute as checagens estruturais abaixo conforme o agente:

**AGN-COD-CORE — Domain Error Compliance:**
1. Verifique que **todas** as classes de erro geradas em `domain/errors/` estendem `DomainError` (não `Error`)
2. Verifique que **todas** possuem campo `readonly type: string` (formato `/problems/...`)
3. Verifique que **todas** possuem campo `readonly statusHint: number`
4. Verifique que o import de `DomainError` aponta para Foundation (`@modules/foundation/domain/errors/domain-errors`)
5. Se qualquer check falhar → **CORRIJA** o arquivo gerado antes de prosseguir e registre no relatório

**Exemplo — violação detectada e corrigida automaticamente:**

```
🔍 Validação 7.2 — AGN-COD-CORE ({slug})

Verificando domain/errors/resource-not-available.error.ts...
  ❌ extends Error (esperado: extends DomainError)
  ❌ campo 'code' encontrado (esperado: 'type' com formato /problems/...)
  ❌ campo 'statusCode' encontrado (esperado: 'statusHint')

🔧 Correção automática aplicada:
  - import { DomainError } from '@modules/foundation/domain/errors/domain-errors';
  - extends Error → extends DomainError
  - code = 'RESOURCE_NOT_AVAILABLE' → type = '/problems/resource-not-available'
  - statusCode = 422 → statusHint = 422

Verificando domain/errors/dependency-pending.error.ts...
  ✅ extends DomainError
  ✅ type = '/problems/dependency-pending'
  ✅ statusHint = 409

Resultado: 7 arquivos verificados, 3 corrigidos, 4 ok. ✅
```

**AGN-COD-WEB — Structure & React Query Compliance:**
1. Verifique que a estrutura gerada segue **Pattern A** (`api/`, `components/`, `hooks/`, `pages/`, `types/`)
2. Verifique que hooks em `hooks/` utilizam `useQuery`/`useMutation` de `@tanstack/react-query`
3. Verifique que NÃO existe estrutura Pattern B (`data/`, `domain/`, `ui/`)
4. Se qualquer check falhar → **CORRIJA** antes de prosseguir

**Exemplo — violação detectada e corrigida automaticamente:**

```
🔍 Validação 7.2 — AGN-COD-WEB ({slug})

Verificando estrutura de diretórios...
  ❌ Pattern B detectado: data/, domain/, ui/
  Esperado Pattern A: api/, components/, hooks/, pages/, types/

🔧 Correção automática aplicada:
  - mv data/{slug}.api.ts → api/{slug}.api.ts
  - mv domain/{slug}.types.ts → types/{slug}.types.ts
  - mv ui/ItemListPage.tsx → pages/ItemListPage.tsx
  - mkdir components/
  + Criado hooks/use-items.ts com useQuery wrapper

Verificando React Query em hooks/...
  ✅ use-params.ts importa useQuery de @tanstack/react-query
  ✅ queryKey estruturado: ['contextual-params', 'params', filters]

Resultado: estrutura corrigida para Pattern A, React Query verificado. ✅
```

**AGN-COD-APP — Port Interface Compliance:**
1. Verifique que interfaces de porta (repositories) usam tipos do domínio, não tipos Drizzle
2. Verifique que use-cases retornam DTOs ou value objects, não entidades cruas

### 7.3 Para AGN-COD-VAL (Validador Global):

Não gera arquivos — apenas valida o output de todos os agentes anteriores:
- Formato de saída: `code_validation` (summary + findings + checks) conforme PKG-COD-001 §4.2
- Checagens mínimas: Problem Details RFC 9457, correlation_id, idempotency, layering_clean_arch, tests_present, openapi_present_and_linted, x_permissions_documented
- **Adicional:** execute as checagens §7.2 de TODOS os agentes como validação cruzada
- Invoque todas as skills de `post_validation` do registro

## PASSO 8: Relatório

Emita no chat um resumo estruturado:

```
## Relatório — {agent_id} ({agent_name})

**Módulo:** {caminho_modulo} (slug: {slug})
**Camada:** {layer}

### Arquivos gerados/atualizados
| # | Path | Linhas | Status |
|---|------|--------|--------|
| 1 | apps/api/src/modules/{slug}/... | 42 | ✅ criado |
| 2 | ... | ... | 🔄 atualizado |

### Missing Info
- {lista de lacunas, se houver — dados insuficientes nas specs para gerar código completo}

### Validações
- ✅ {validações passaram}
- ❌ {validações falharam, se houver}

### Contract Refs
- {EX-* e IDs de requisitos aplicados}
```

## PASSO 9: Registrar Execution State

Após o relatório, registre o estado de execução deste agente específico.

1. Leia `.agents/execution-state/MOD-{NNN}.json` (se existir) ou crie um novo
2. Atualize **apenas** a entrada do agente executado em `codegen.agents.{agent_id}`:

```json
{
  "module_id": "MOD-{NNN}",
  "module_path": "{caminho_modulo}",
  "last_updated": "{ISO_TIMESTAMP}",
  "codegen": {
    "started_at": "{PRESERVAR_OU_SETAR_AGORA}",
    "completed_at": null,
    "agents": {
      "{agent_id}": {
        "status": "done|error|skipped",
        "completed_at": "{ISO_TIMESTAMP}",
        "files_generated": {N},
        "files": ["{lista_de_paths_criados}"]
      }
    }
  }
}
```

- Se o agente foi skippado por nível (PASSO 2.4), use `"status": "skipped"`
- Se houve erro, use `"status": "error"` e adicione `"error": "{descrição}"`
- Preserve todas as outras entradas de agentes e seções (`scaffold`, `validations`, etc.) — faça merge
- Se `codegen.started_at` já existe, preserve; senão, defina com o timestamp atual
- Se **todos** os 6 agentes (ou todos os aplicáveis ao nível) estão `done` ou `skipped`, defina `codegen.completed_at`

### Validação Temporal (MUST)

Antes de escrever o JSON, valide:
1. `codegen.completed_at` (se definido) **DEVE** ser posterior a `codegen.started_at` — se não for, corrija `completed_at` para o timestamp atual
2. Cada `agents.{id}.completed_at` **DEVE** ser posterior a `codegen.started_at` — se não for, corrija
3. Todos os timestamps **DEVEM** usar ISO 8601 UTC (formato `YYYY-MM-DDTHH:mm:ssZ`)
4. Se detectar paradoxo temporal em dados existentes, corrija-os e registre no relatório: `"⚠ Timestamps corrigidos: completed_at era anterior a started_at"`

## PASSO 10: Registrar Pendências (apenas AGN-COD-VAL)

Se o agente executado foi **AGN-COD-VAL** (Validador Global) e o relatório de validação contém `missing_info` ou `checks_failed`:

1. Localize o arquivo de pendências do módulo: `requirements/pen-{NNN}-pendente.md`
2. Para cada item de `missing_info` ou `checks_failed` relevante:
   - Invoque `/manage-pendentes create PEN-{NNN}` com:
     - **severidade:** `ALTA` para `checks_failed`, `MEDIA` para `missing_info`
     - **origem:** `AGN-COD-VAL (codegen)`
     - **descrição:** descrição objetiva da lacuna ou falha detectada
3. Se não houver `missing_info` nem `checks_failed`, este passo é **no-op**

> **Nota:** Apenas AGN-COD-VAL dispara este passo.
> Os demais agentes (AGN-COD-DB a AGN-COD-WEB) registram `missing_info` no relatório mas **não** criam pendências formais — o VAL consolida e filtra duplicatas.
> Adicione ao relatório: `📋 Pendências registradas: {N} itens em pen-{NNN}-pendente.md`

Para os demais agentes, este passo é **no-op** (skip silencioso).

## PASSO 11: Sincronizar Plano de Ação (apenas AGN-COD-VAL)

Se o agente executado foi **AGN-COD-VAL** (Validador Global):

1. Verifique se o plano já existe: `docs/04_modules/user-stories/plano/PLANO-ACAO-MOD-{NNN}.md`
2. Se **existe** → invoque `/action-plan {caminho_modulo} --update`
3. Se **não existe** → invoque `/action-plan {caminho_modulo}` (criação completa)

> **Nota:** Apenas AGN-COD-VAL dispara este passo (é o último agente da cadeia).
> Os demais agentes (AGN-COD-DB a AGN-COD-WEB) **não** disparam este passo.
> O action-plan agora lê `.agents/execution-state/MOD-{NNN}.json` para dados precisos do checklist.
> Adicione ao relatório: `📋 Plano de ação atualizado: PLANO-ACAO-MOD-{NNN}.md`

Para os demais agentes, este passo é **no-op** (skip silencioso).
