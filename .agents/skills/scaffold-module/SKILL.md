---
description: Gera a estrutura completa de um novo módulo (MOD-XXX) através da leitura e obediência estrita às regras dinâmicas do DOC-DEV-001 normativo. Triggers: "scaffold module", "criar módulo", "novo módulo", "iniciar MOD".
---

# Skill: scaffold-module

## Objetivo

Gerar a estrutura de pastas e os arquivos iniciais para um novo módulo (`MOD-XXX`), servindo como boilerplate arquitetural governado.

1. O conteúdo dos arquivos gerados (metadados obrigatórios, tabelas de controle de versão, formato Gherkin, dependências, etc) NÃO deve ser inferido e NÃO está descrito rígido neste arquivo. Ele deve ser extraído em tempo de execução da fonte da verdade (Single Source of Truth) da arquitetura de especificação do projeto.
2. **ZERO ALUCINAÇÃO:** É expressamente PROIBIDO gerar, inventar ou deduzir qualquer informação, campo, estrutura, fluxo ou regra que não esteja clara e explicitamente contida no contexto do diretório `docs/01_normativos`. As amarrações (rastreabilidade cruzada) devem se limitar aos pilares regulados na norma. Nada fora do escopo normativo pode nascer no artefato.

---

## 1. Gatilhos de Ativação

O agente deve invocar mentalmente esta skill se o usuário solicitar:

- "scaffold module"
- "criar novo módulo MOD-XXX"
- "iniciar spec do módulo de [nome]"
- "gerar estrutura MOD"

## 2. Parâmetro Obrigatório da Execução (A User Story)

Se o usuário não a fornecer no prompt de origem, você **deve questioná-lo antes de criar os arquivos**:

- **Caminho da User Story**: O caminho para o arquivo Markdown localizado em `docs/04_modules/user-stories/US-MOD-XXX.md`.

**REGRA DE BLOQUEIO (GATE DE APROVAÇÃO) — COMPARAÇÃO EXATA DE STRING:**

Leia o arquivo da User Story. Encontre a linha que começa com `**Status:**` e extraia o valor entre crases `` ` ``.

**Tabela de decisão — sem exceção:**

| Valor exato encontrado no campo `Status:` | Ação permitida |
|---|---|
| `` `aprovada` `` | ✅ PROSSEGUIR com o scaffold |
| `` `em desenvolvimento` `` | 🚫 BLOQUEAR |
| `` `em revisao` `` | 🚫 BLOQUEAR |
| `` `para aprovação` `` | 🚫 BLOQUEAR |
| `` `em aprovação` `` | 🚫 BLOQUEAR |
| `` `reprovada` `` | 🚫 BLOQUEAR |
| Qualquer outro valor não listado acima | 🚫 BLOQUEAR |

> ⚠️ **ATENÇÃO CRÍTICA:** Valores como `para aprovação`, `em aprovação`, `aguardando aprovação` **NÃO SÃO** equivalentes a `aprovada`. São estados de transição e **devem bloquear a execução**. A única string que autoriza o scaffold é a palavra exata: **`aprovada`** — sem variações, sem inferências.

**REGRA ANTI-ENCADEAMENTO (HUMAN-IN-THE-LOOP):**
Se VOCÊ MESMO (agente de IA) acabou de terminar de escrever e salvar o arquivo da US na mesma interação (comportamento "agent chaining"), você **ESTÁ PROIBIDO** de realizar o Scaffold ou trocar o status para "aprovada" no meio do caminho. O processo deve parar após gerar a US e ficar aguardando nova validação estrita do Usuário Humano.

---

## 3. PASSO 1: Ingestão de Contexto Normativo (Obrigatório)

**PARE O QUE ESTÁ FAZENDO.** Antes de gerar pastas ou criar qualquer arquivo, você é estritamente **obrigado** a ler via ferramentas do sistema o documento normativo de especificações executáveis em:

`docs/01_normativos/DOC-DEV-001_especificacao_executavel.md`

Leia este documento por inteiro buscando descobrir:

- Qual é o *template* (tabela inicial de Warning de Automação/CI, metadados finais de rastreabilidade, owner, revision date).
- Como estruturar as seções (Regra, Exceção, Gherkin, Dependências, Gatilhos ADR, Campos de Banco de Dados, Transações, Eventos do Domínio).
- Quais são as nomenclaturas corretas.

---

## 4. PASSO 2: Criação da Estrutura Estratégica

Você deve criar um diretório em `docs/04_modules/mod-{ID}-{nome}/` simulando a árvore abaixo. **Atenção à nomenclatura dos itens base (terminados em `{ID}.md` e não em `{ID}01.md`)**.

```text
docs/04_modules/mod-{ID}-{nome}/
├── mod.md                          ← Índice e overview descritivo do módulo
├── CHANGELOG.md                    ← Tabela inicial (Versão | Data | Responsável | Descrição)
├── requirements/
│   ├── br/
│   │   └── BR-{ID}.md              ← Regra de Negócio base
│   ├── fr/
│   │   └── FR-{ID}.md              ← Requisito Funcional base
│   ├── data/
│   │   └── DATA-{ID}.md            ← Modelo de dados base
│   ├── int/
│   │   └── INT-{ID}.md             ← Integrações (se houver)
│   ├── sec/
│   │   └── SEC-{ID}.md             ← Segurança e compliance
│   ├── ux/
│   │   └── UX-{ID}.md              ← UX e jornadas
│   └── nfr/
│       └── NFR-{ID}.md             ← Requisitos não-funcionais
└── adr/
    └── ADR-{ID}.md                 ← Placeholder de Decisão (opcional/base)
```

---

## 5. PASSO 3: Geração Fiel dos Arquivos (Single Source of Truth Protocol)

Para a escrita de CADA UM dos arquivos que estão dentro das sub-pastas `/requirements/`, `/adr/` ou até mesmo o `mod.md` raiz:

**MUITO IMPORTANTE:** Os arquivos de requisitos (BR, FR, DATA, etc.) **NÃO** devem ser jogados soltos na raiz da pasta `requirements/`. Você **TEM A OBRIGAÇÃO** de criar e respeitar as sub-pastas exatas mostradas no Passo 2 (`requirements/br/`, `requirements/fr/`, `requirements/data/`, etc.) e salvar cada tipo de documento dentro de sua respectiva sub-pasta.

1. Vá até a seção específica dele dentro da leitura do `DOC-DEV-001` que você executou.
2. Extraia o "esqueleto / template" ditado lá. Preste atenção aos itens que a norma diz que são **Obrigatórios**. **Correção Vital:** Para o documento `DATA`, certifique-se de incluir a tag `# DATA-{ID} — {Nome}` no topo, logo abaixo da tabela de automação.
3. **REGRA DE FUSÃO DE CAMPOS (CRÍTICA — A User Story NÃO é a fonte completa):** Ao preencher o `DATA-{ID}.md` (modelo de dados), você DEVE incluir **obrigatoriamente** os seguintes campos definidos em `DOC-DEV-001 § DATA-XXX`, **independentemente** de a User Story citá-los ou não:
   - `id`: `uuid` (tipo nativo PostgreSQL, NOT NULL, PRIMARY KEY)
   - `codigo`: `varchar(100)`, NOT NULL, UNIQUE (identificador amigável para o negócio)
   - `status`: `text (enum)`, NOT NULL (valores do negócio; ex: `active | inactive | ...`)
   - `tenant_id`: `uuid`, NOT NULL, FK com `ON DELETE RESTRICT` — **NUNCA CASCADE**
   - `created_at`: `timestamptz UTC`, NOT NULL, `default=now()`
   - `updated_at`: `timestamptz UTC`, NOT NULL, `default=now()`
   - `deleted_at`: `timestamptz`, NULL (Soft-Delete — campo ausente = hard delete proibido)

   Os campos da **User Story** (ex: `email`, `mfa_secret`, `nome_fantasia`) são os campos **de negócio** que complementam esses campos constitucionais. Você deve fundir os dois conjuntos. **NUNCA gere um schema de banco de dados apenas com o que a US descreve.**

4. **OBRIGATÓRIO — AVISO DE AUTOMAÇÃO (PRIMEIRA LINHA DO ARQUIVO):** A **primeira linha de conteúdo** de cada arquivo gerado (antes de qualquer outra seção ou heading) DEVE ser exatamente:

   ```markdown
   > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
   ```

   Isso não é delegado à leitura do `DOC-DEV-001` — é uma regra de execução desta skill. Nenhum arquivo gerado pelo scaffold pode nascer sem esse aviso. Essa tag é o contrato de rastreabilidade e proteção do arquivo desde o nascimento (conforme `DOC-DEV-001`).
5. **INJEÇÃO ATIVA DOS DADOS (PROIBIDO PLACEHOLDERS):** É expressamente PROIBIDO gerar arquivos copiando os placeholders vazios do template (como `- Regra: ...`, `<Nome>`, `<titulo>`, `[ ] Sim [ ] Não`). Você DEVE ativamente aplicar as informações lidas da **User Story fornecida** e preencher os artefatos com conteúdo rico e deduzido. Para cada pilar, a US é a fonte dos dados de **negócio** — o `DOC-DEV-001` é a fonte dos **contratos arquiteturais** obrigatórios. Funda os dois:

   - No **BR-{ID}.md**: Inverta o texto genérico pela Regra de Negócio real da US. Inclua os Critérios de Aceite em Gherkin (`Dado/Quando/Então`) extraídos da US. Preencha obrigatoriamente: `estado_item`, `owner`, `rastreia_para` e `evidencias`.
   - No **FR-{ID}.md**: Detalhe os Endpoints REST ou telas que serão impactados (conforme US). Campo `Done funcional` é **OBRIGATÓRIO** e não pode ficar em branco. Declare `Prioridade`, `Efeito colateral (Sim/Não)` — se Sim, implementar Idempotência — e `Dependências (IDs)`.
   - No **DATA-{ID}.md**: **NUNCA gere campos com base apenas no que a US descreve.** Funda os campos de negócio da US com os **campos constitucionais obrigatórios do DOC-DEV-001** (já detalhados no item 3 acima). Descreva também os Eventos de Domínio requeridos pela feature.
   - No **SEC-{ID}.md**: Preencha políticas de auditoria, restrição de rotas ou rate-limits. O DOC-DEV-001 exige obrigatoriamente: Classificação dos Dados (Público/Interno/Confidencial/PII), LGPD (minimização/anonimização), `Autorização de Linha` (toda leitura em `domain_events` filtra por `tenant_id`). Não deixe nenhuma dessas seções em branco.
   - No **NFR-{ID}.md**: Se a US não citar explicitamente SLA ou resiliência, aplique os defaults normativos do projeto (ex: timeout padrão, retry policy). Nunca entregue um NFR vazio porque "a US não mencionou".
   - No **INT-{ID}.md**: Todo INT deve declarar `Timeout`, `Retry`, `Backoff/Jitter`, `DLQ (Sim/Não)` e `Idempotência` — conforme exigido pelo DOC-DEV-001, independentemente do que a US especifica. Use os defaults normativos se não houver instrução explícita.
   - No **UX-{ID}.md**: Referencie o catálogo `DOC-UX-010` para mensagens de erro e ações de UI padronizadas.

6. No campo `rastreia_para` presente no rodapé de cada arquivo (estipulado pelo DOC-DEV-001), amarre a todos os outros arquivos irmãos do mesmo nó e **inclua a referência à US de origem**.
7. No campo `referencias_exemplos`, preencha com o link relativo para a User Story de aprovação (ex: `[US-MOD-101](../../user-stories/US-MOD-101.md)`).
8. Conforme o `DOC-DEV-001` (fonte da verdade normativa), o estado inicial de todo arquivo gerado deve ser rigorosamente **DRAFT**. Os arquivos base **não devem ser editados diretamente** após a geração — qualquer evolução deve passar pela skill `create-amendment`.
9. Salve o arquivo em disco.

---

## 6. PASSO INTERMEDIÁRIO: Geração do Screen Manifest (validate-screen-manifest)

Após gerar o arquivo `UX-{ID}.md` do módulo, **invoque a skill `validate-screen-manifest`** no Modo Geração para criar o manifesto de tela correspondente:

- **O que fazer:** leia o `UX-{ID}.md` gerado para extrair `entity_type`, o `screen_id` (padrão: `UX-{MODULE_CODE}-001`) e as ações listadas na tela.
- **Onde salvar:** `docs/05_manifests/screens/ux-{module-slug}-001.{entity_type}-list.yaml`
- **Regra:** gere com `manifest_version: 1`, `name`, `routes`, `telemetry_defaults` (com `X-Correlation-ID`), `permissions`, `actions`, `ui_rules` e `error_mapping` preenchidos — sem placeholders.
- **Após gerar:** valide imediatamente contra as regras da skill `validate-screen-manifest`.

> ⚠️ Se o módulo não tiver tela UX definida na User Story, este passo é opcional — registre no sumário final que o manifesto foi omitido e indique que deve ser criado quando UX for especificado.

---

## 7. PASSO INTERMEDIÁRIO: Atualização dos Índices (update-markdown-file-index)

Antes de comunicar ao usuário, **invoque a skill `update-markdown-file-index`** duas vezes:

1. **Atualizar o `mod.md` do módulo recém-criado:**
   - Arquivo alvo: `docs/04_modules/mod-{ID}-{nome}/mod.md`
   - Pasta a indexar: `docs/04_modules/mod-{ID}-{nome}/requirements/`
   - Isso garante que o `mod.md` liste todos os arquivos de requisito gerados.

2. **Atualizar o `docs/INDEX.md` global:**
   - Arquivo alvo: `docs/INDEX.md`
   - Pasta a indexar: `docs/04_modules/`
   - Isso garante que o índice raiz reflita o novo módulo criado.

---

## 7. Passo Final: Comunicação

Após concluir, emita um sumário em markdown confirmando pro usuário:

1. Uma listagem com links da estrutura de pastas geradas em disco.
2. Afirme qual foi a baseline do `DOC-DEV-001` seguida em vigência.
3. Confirme que `mod.md` e `docs/INDEX.md` foram atualizados.
4. Sugira qual próximo arquivo primário o Desenvolvedor ou Product Manager deverá refinar primeiramente.
