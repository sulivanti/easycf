# Skill: enrich-agent

Executa um único agente de enriquecimento PKG-DEV-001 sobre um módulo, assumindo a persona do agente especialista.

> **Caminhos:** `.agents/paths.json` | **Registro:** `.agents/enrichment-registry.json` | **Contexto normativo:** `.agents/context-map.json` → `enrich-agent`

## Argumento

$ARGUMENTS deve conter dois parâmetros separados por espaço:

1. **Caminho do módulo** (ex: `docs/04_modules/mod-001-pedidos/`)
2. **ID do agente** (ex: `AGN-DEV-02`)

Se não fornecido, pergunte ao usuário.

Agentes válidos: `AGN-DEV-01` a `AGN-DEV-11`.

---

## PASSO 1: Carregar Configuração do Agente

Leia `.agents/enrichment-registry.json` e extraia a entrada do agente solicitado:
- `entity`, `target_topic`, `target_path`, `pkg_section`, `required_docs`

Se o ID não existir no registro, aborte com mensagem de erro.

## PASSO 2: Gate de Governança

Leia o manifesto do módulo (arquivo `<dirname>.md`, ex: `mod-001-backoffice-admin.md`).

- Se o módulo **não existir**, aborte: `"Módulo não encontrado. Execute /project:forge-module primeiro."`
- Se `estado_item` do módulo for `READY`, aborte: `"Módulo selado como READY. Use /project:create-amendment para alterações."`

## PASSO 3: Ingestão de Contexto Normativo (Mínimo Necessário)

**PARE.** Antes de gerar qualquer conteúdo, leia **obrigatoriamente** e **apenas**:

1. `docs/02_pacotes_agentes/PKG-DEV-001_Pacote_Agentes_Enriquecimento.md`:
   - Seção `§0` (contrato de execução — envelope, regras, anti-patterns)
   - Seção do agente atual (conforme `pkg_section` do registro)
2. Os documentos listados em `required_docs` do agente no registro (resolver paths via `docs/01_normativos/`)
3. `docs/01_normativos/DOC-FND-000__Foundation.md` §2-§3 (anti-patterns Foundation — **sempre**)
4. Os arquivos atuais do módulo no `target_path`:
   - Se `target_path` for um diretório: leia todos os `.md` dentro dele
   - Se `target_path` for um arquivo específico: leia esse arquivo
   - Se `target_path` for `*` (AGN-DEV-11): leia todos os `requirements/` do módulo

**NÃO** leia documentos além dos listados acima. Economia de contexto é crítica.

## PASSO 4: Assumir Persona do Agente

Adote o **system prompt** definido em PKG-DEV-001 para este agente. Internalize:

- Você **é** o agente `{agent_id}` (`{agent_name}`)
- Seu propósito é enriquecer o pilar `{entity}` (Tópico `{target_topic}`)
- Suas regras são as do contrato §0 + as específicas da sua seção
- **ZERO ALUCINAÇÃO:** não invente dados. Lacunas → registre em `missing_info`
- **Anti-patterns Foundation:** não duplique entidades de DOC-FND-000 (users, tenants, auth base, RBAC primário)

## PASSO 5: Gerar Enriquecimento

Com base no contexto ingerido (PASSO 3) e na persona assumida (PASSO 4), gere o conteúdo do artefato **diretamente em Markdown**, seguindo a estrutura definida na seção `pkg_section` do agente em PKG-DEV-001.

O fluxo é:
1. Leia a seção do agente em PKG-DEV-001 para entender os campos esperados (schema `data`)
2. Preencha cada campo com dados derivados do manifesto do módulo, requisitos existentes e normativos
3. Para campos sem informação suficiente, registre em `missing_info` — **não invente dados**
4. Escreva o resultado como Markdown estruturado (não como JSON) no arquivo alvo

Checklist obrigatório antes de escrever:

- [ ] IDs no formato `{ENTITY}-\d{3}` (ex: `BR-001`, `FR-002`)
- [ ] `metadata.estado_item` = `DRAFT`
- [ ] `metadata.rastreia_para` aponta para IDs existentes (US, features, outros requisitos)
- [ ] `metadata.data_ultima_revisao` = data de hoje
- [ ] `contract_refs.ex_ids` preenchido com exemplos/checklists EX-* aplicados
- [ ] Nenhuma entidade Foundation duplicada

### Regra especial para AGN-DEV-04 (DATA)

Se houver auditoria/timeline/notificações:
- **MUST** incluir catálogo DATA-003 com: `event_type`, `origin_command`, `emit_permission`, `view_rule`, `notify`, `sensitivity_level`, `maskable_fields`
- **MUST** referenciar SEC-002
- **MUST** usar o template base `docs/04_modules/_templates/DATA-003-template.md` como ponto de partida (DOC-DEV-001 §0.4). O boilerplate canônico (Princípios MUST, Campos mínimos, Índices padrão) é **imutável** — enriquecer **apenas** a seção "Catálogo de Domain Events" com os eventos específicos do módulo.

### Regra especial para AGN-DEV-06 (SEC)

Se houver domain_events/notifications:
- **MUST** incluir seção SEC-002 (Emit/View/Notify)
- **MUST** reforçar filtro `tenant_id` + ACL
- **MUST** usar o template base `docs/04_modules/_templates/SEC-002-template.md` como ponto de partida (DOC-DEV-001 §0.4). O boilerplate canônico (Princípios MUST, Glossário) é **imutável** — enriquecer **apenas** a seção "Matriz de Autorização" com os eventos específicos do módulo.

### Regra especial para AGN-DEV-07 (UX)

- **MUST** usar `action_id` do catálogo UX-010 (ex: `view_history`, `share_manage`, `approve`, `reject`)
- **SHOULD** mapear para endpoints e event_types
- **MUST** usar path relativo correto para manifests YAML. De `requirements/ux/UX-NNN.md`, a profundidade é **4 níveis** até `docs/`: `../../../../05_manifests/screens/<id>.yaml`. De `user-stories/features/US-*.md`, a profundidade é **3 níveis**: `../../../05_manifests/screens/<id>.yaml`. **NUNCA** usar 3 níveis a partir de `requirements/ux/`.

### Regra especial para AGN-DEV-11 (VAL)

- Não gera conteúdo — apenas valida consistência cruzada
- Formato de saída: `doc_dev_validation` (summary + findings + coverage)
- Checagens mínimas: formato IDs, metadados, rastreabilidade, DATA-003/SEC-002/UX-010

## PASSO 6: Aplicar ao Módulo

### Para agentes produtores (AGN-DEV-01 a AGN-DEV-10):

1. Localize o(s) arquivo(s) alvo no `target_path` do módulo
2. Se o arquivo DRAFT já existe:
   - **Preserve** o header de automação (`> ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO.`)
   - **Preserve** campos de metadata existentes
   - **Atualize** `data_ultima_revisao` para a data de hoje
   - **Enriqueça** o conteúdo com os dados gerados, convertendo o JSON `data` para markdown
3. Se o arquivo **não existe** e um novo ID é necessário:
   - Crie o arquivo `.md` no diretório correto seguindo o padrão do módulo
   - Inclua o header de automação obrigatório
   - Inclua metadata completa com `estado_item: DRAFT`
4. Se o arquivo está com `estado_item: READY`:
   - **NÃO EDITE.** Registre no relatório e sugira usar `/project:create-amendment`

### Para AGN-DEV-11 (validador):

- Não edite nenhum arquivo
- Emita o relatório de validação diretamente no chat

## PASSO 7: Atualizar Índice

Se novos arquivos foram criados no PASSO 6, invoque `/project:update-index` para atualizar o manifesto do módulo.

## PASSO 8: Relatório

Emita no chat um resumo estruturado:

```
## Relatório — {agent_id} ({agent_name})

**Módulo:** {caminho_modulo}
**Pilar:** {entity} (Tópico {target_topic})

### Items gerados/atualizados
- {ID}: {título} (estado: DRAFT)

### Missing Info
- {lista de lacunas, se houver}

### Checks
- ✅ {checks_passed}
- ❌ {checks_failed, se houver}

### Contract Refs
- {ex_ids aplicados}
```

## PASSO 9: Sincronizar Plano de Ação (apenas AGN-DEV-10)

Se o agente executado foi **AGN-DEV-10** (Pendências):

1. Verifique se o plano já existe: `docs/04_modules/user-stories/plano/PLANO-ACAO-MOD-{NNN}.md`
2. Se **existe** → invoque `/action-plan {caminho_modulo} --update`
3. Se **não existe** → invoque `/action-plan {caminho_modulo}` (criação completa)

> **Nota:** Apenas AGN-DEV-10 modifica `pen-{NNN}-pendente.md`.
> Os demais agentes (AGN-DEV-01 a AGN-DEV-09, AGN-DEV-11) **não** disparam este passo.
> Adicione ao relatório: `📋 Plano de ação atualizado: PLANO-ACAO-MOD-{NNN}.md`

Para os demais agentes, este passo é **no-op** (skip silencioso).
