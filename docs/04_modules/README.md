# 04_modules — Documentação Modular do EasyA2

> **Para agentes GenAI:** Este diretório é a **fonte de verdade técnica por módulo** do sistema EasyA2.
> Antes de gerar qualquer código, leia o manifesto do módulo (`<dirname>.md`) relevante e os documentos `requirements/` correspondentes.
> Jamais referencie arquivos de outros diretórios de documentação como autoridade maior — aqui é onde os requisitos são detalhados.

---

## 1. Propósito

A pasta `04_modules` organiza a **especificação técnica detalhada** de cada módulo de negócio do EasyA2. Enquanto o `DOC-DEV-001` em `docs/01_normativos/` define as regras e o template global, este diretório contém o **conteúdo completo**: regras de negócio, requisitos funcionais, contratos de dados, integrações, segurança, UX e decisões arquiteturais.

A pasta segue o princípio de **rastreabilidade**: qualquer mudança de especificação deve ter um rastro de ID, data, autor e status — nunca se edita o passado; sempre se cria um delta.

---

## 2. Estrutura de Diretórios

```text
04_modules/
├── README.md                  ← este arquivo (visão geral da pasta)
│
├── mod-000-foundation/        ← Módulo Nível 0 (núcleo/alicerce)
│   ├── mod-000-foundation.md   ← manifesto do módulo (mesmo nome do diretório)
│   ├── README.md              ← visão geral e links rápidos
│   ├── CHANGELOG.md           ← histórico auditável de mudanças (amendments integrados)
│   ├── CONVENTIONS.md         ← convenções específicas do módulo (nomenclatura, padrões)
│   ├── permissions.yaml       ← escopos expostos
│   ├── requirements/          ← especificações canônicas por tipo
│   │   ├── br/                ← Regras de Negócio
│   │   ├── fr/                ← Requisitos Funcionais
│   │   ├── data/              ← Dados / Entidades
│   │   ├── int/               ← Integrações e Contratos
│   │   ├── sec/               ← Segurança e Compliance
│   │   ├── ux/                ← UX / Jornadas
│   │   ├── nfr/               ← Requisitos Não-Funcionais
│   │   ├── imp/               ← Decisões de Implementação e Anti-Patterns
│   │   └── tst/               ← Especificação de Testes
│   ├── amendments/            ← Deltas (melhorias, revisões, correções)
│   │   ├── br/
│   │   ├── fr/
│   │   ├── data/
│   │   ├── int/
│   │   ├── sec/
│   │   ├── ux/
│   │   ├── nfr/
│   │   ├── imp/
│   │   └── tst/
│   ├── adr/                   ← Decisões arquiteturais do módulo local
│   ├── diagrams/              ← Diagramas Mermaid, C4, de Sequência
│   └── snippets/              ← Trechos de código úteis, configs parciais
│
├── mod-001-backoffice-admin/  ← Módulo Nível 1 (exemplo)
│   ├── mod-001-backoffice-admin.md  ← manifesto do módulo (mesmo nome do diretório)
│   ├── README.md              ← mesma estrutura canônica completa do mod-000...
│   └── ...                    
│
├── TESTING-STRATEGY.md        ← Estratégia global de testes (ferramentas, cobertura, pirâmide)
│
└── mod-NNN-nome/              ← padrão para módulos futuros (estrutura completa)
```

### Convenção de nomenclatura de pastas

| Padrão         | Exemplo              | Descrição                             |
|----------------|----------------------|---------------------------------------|
| `mod-NNN-nome` | `mod-000-foundation` | Módulo com número de 3 dígitos e slug |

---

## 3. Tipos de Documentos (IDs)

Cada arquivo dentro de `requirements/` recebe um **ID canônico** no formato `<TIPO>-<NNN>`, onde `NNN` é o número do módulo.

| Pasta   | ID Padrão  | Tipo de Documento       | Conteúdo esperado                                                              |
|---------|------------|-------------------------|--------------------------------------------------------------------------------|
| `br/`   | `BR-NNN`   | Regras de Negócio       | Restrições, validações e invariantes de negócio                                |
| `fr/`   | `FR-NNN`   | Requisitos Funcionais   | O que o sistema deve fazer (cenários / Gherkin)                                |
| `data/` | `DATA-NNN` | Dados / Entidades       | Schemas de tabelas, contratos de persistência, enums                           |
| `int/`  | `INT-NNN`  | Integrações             | Contratos externos, operationIds de API, webhooks                              |
| `sec/`  | `SEC-NNN`  | Segurança               | Políticas de acesso, escopos, eventos de segurança                             |
| `ux/`   | `UX-NNN`   | UX / UI                 | Jornadas de usuário, mensagens de erro, fluxos                                 |
| `nfr/`  | `NFR-NNN`  | Não-Funcionais          | Performance, disponibilidade, escalabilidade                                   |
| `imp/`  | `IMP-NNN`  | Implementação           | Anti-patterns, decisões técnicas, lições aprendidas                            |
| `tst/`  | `TST-NNN`  | Especificação de Testes | Casos obrigatórios, cobertura mínima, fixtures, categorias (HP/EA/IT/EC/EV/NF) |
| `adr/`  | `ADR-NNN`  | Decisão Arquitetural    | Decisões formais com contexto, alternativas e consequências                    |

### Tipos especiais (na raiz de `requirements/`)

| ID             | Tipo             | Quando usar                               |
|----------------|------------------|-------------------------------------------|
| `FIX-NNN`      | Correção de bug  | Bugs identificados pós-especificação      |
| `PENDENTE-NNN` | Pendência aberta | Decisão em aberto com impacto documentado |

---

## 4. Sistema de Amendments (Deltas)

Para **nunca editar o passado**, toda mudança em um documento canônico é feita via **amendment**, um arquivo delta rastreável.

### Nomenclatura dos Amendments

```text
<BASE-ID>-<TIPO><NN>.md
```

| Sufixo | Tipo         | Quando usar                                            |
|--------|--------------|--------------------------------------------------------|
| `-Mxx` | **Melhoria** | Adiciona ou altera comportamento, amplia capacidade    |
| `-Rxx` | **Revisão**  | Clareza ou reorganização; **não altera comportamento** |
| `-Cxx` | **Correção** | Conserta erro ou ambiguidade no spec original          |

### Exemplos de amendments

```text
FR-001-M01.md   → Melhoria 01 em FR-001 (novo filtro avançado)
BR-001-R01.md   → Revisão 01 em BR-001 (texto mais claro)
SEC-001-C01.md  → Correção 01 em SEC-001 (obrigatoriedade de log)
```

### Caminho do arquivo de amendment

```text
amendments/<tipo>/<BASE-ID>/<BASE-ID>-<SUFIXO>.md
```

Exemplo real:

```text
mod-001-backoffice-admin/
└── amendments/
    ├── fr/
    │   └── FR-001/
    │       └── FR-001-M01.md
    ├── br/
    │   └── BR-001/
    │       └── BR-001-R01.md
    └── sec/
        └── SEC-001/
            └── SEC-001-C01.md
```

### Ciclo de vida de um Amendment

```text
PROPOSTA → APROVADA → INTEGRADA
                    ↘ REJEITADA
                    ↘ SUPERADA
```

1. **PROPOSTA**: Amendment criado e em discussão.
2. **APROVADA**: Aceita como direção, aguardando implementação.
3. **INTEGRADA**: Conteúdo absorvido pelo documento canônico; evidência (PR/issue) registrada.
4. **REJEITADA** / **SUPERADA**: Descartada ou substituída por outro delta.

> Ao integrar: atualize o canônico (`requirements/.../BASE-ID.md`) e marque o amendment como `INTEGRADA` com link para o PR.

---

## 5. Manifesto do Módulo (`<dirname>.md`)

Todo módulo **obrigatoriamente** possui um arquivo manifesto com o **mesmo nome do diretório** (ex: `mod-001-backoffice-admin/mod-001-backoffice-admin.md`) com as seguintes seções:

```markdown
# MOD-NNN — Nome do Módulo

## Objetivo
Descreve o propósito central do módulo.

## Escopo
O que inclui e o que NÃO inclui (Fases 1, 2, 3...).

## Limites e Dependências
Quais outros módulos ou entidades este módulo depende.

## Documentos do módulo
Lista de todos os canônicos e ADRs com caminhos relativos.

## Metadados
- estado_item: DRAFT | READY
- owner: arquitetura
- data_ultima_revisao: YYYY-MM-DD
- arch_level: N0 | N1 | N2
- rastreia_para: IDs relacionados
- evidencias: (PR/issue quando houver)
```

---

## 6. Metadados Obrigatórios

Todo documento (canônico **ou** amendment) deve conter ao final:

```markdown
## Metadados
- estado_item: DRAFT | READY | ACEITA (ADR)
- owner: arquitetura
- data_ultima_revisao: YYYY-MM-DD
- rastreia_para: IDs impactados/relacionados
- evidencias: (PR/issue/decisão, quando houver)
```

---

## 7. Arquivo `permissions.yaml`

Declara os **escopos de permissão** expostos pelo módulo, seguindo o padrão `recurso:ação`.

```yaml
# mod-000-foundation/permissions.yaml
permissions:
  - users:read
  - users:write
  - users:import
  - users:export
  - jobs:write
```

Estes escopos são referenciados nos documentos `SEC-NNN` e utilizados pelo Motor de IAM da Foundation (MOD-000).

---

## 8. CHANGELOG.md

Cada módulo mantém um `CHANGELOG.md` que é o **índice humano** de todas as mudanças, com status e evidências.

```markdown
# CHANGELOG — MOD-001 Backoffice (Admin)

## Status de mudança
- PROPOSTA | APROVADA | INTEGRADA | REJEITADA | SUPERADA

## 2026-02-27
### Mudanças iniciais (bootstrap do módulo)
- MOD-001 (canônico): criado manifesto do módulo e estrutura por tipo

### Deltas
- FR-001-M01 — MELHORIA (PROPOSTA): "Filtro avançado + paginação por cursor"
- BR-001-R01 — REVISÃO (INTEGRADA): "Clarificação de precedência de negação" — PR #42
- SEC-001-C01 — CORREÇÃO (APROVADA): "Obrigatoriedade de log para ações críticas"
```

---

## 9. ADR — Decisões Arquiteturais

Arquivos em `adr/` usam o padrão `ADR-NNN__slug-descritivo.md` e documentam **decisões irreversíveis ou de alto impacto**.

Estrutura obrigatória de um ADR:

```markdown
# ADR-NNN — Título da Decisão

## Contexto
Por que esta decisão foi necessária.

## Decisão
O que foi decidido e como deve ser implementado.

## Alternativas Consideradas
| Alternativa | Motivo da Rejeição |
|---|---|

## Consequências
### Positivas
### Negativas / Trade-offs

## Documentos Relacionados
Lista de IDs impactados.

## Metadados
- estado_item: ACEITA
- owner: arquitetura
- data_ultima_revisao: YYYY-MM-DD
- rastreia_para: DATA-NNN, SEC-NNN, ...
```

**Exemplo real:** `mod-000-foundation/adr/ADR-000__domain_events_state_pattern.md`
Documenta a decisão de adotar *State-stored + Domain Events + Inbox/Outbox* para todas as entidades core do sistema.

---

## 10. Módulos Existentes

| Módulo                                            | Status   | Descrição                                            | Nível Arch      |
|---------------------------------------------------|----------|------------------------------------------------------|-----------------|
| mod-000-foundation *(pendente forge-module)* | READY    | Identidade, IAM, Auditoria, Core Components          | N0 — Núcleo     |
| mod-001-backoffice-admin                          | DRAFT    | Shell de Auth, App Shell, Dashboard Admin (UX-First) | N1 — Clean Leve |

---

## 11. Criando um Novo Módulo (Guia para Agentes)

> **🚀 Automação Disponível:** Use a skill **`forge-module`** para automatizar todo o processo abaixo. Ela garante que todos os arquivos sejam criados no local correto e com os metadados normativos pré-preenchidos.

Ao criar um novo módulo `mod-NNN-nome` manualmente, siga este checklist obrigatório:

```text
[ ] 1. Criar pasta: docs/04_modules/mod-NNN-nome/
[ ] 2. Criar manifesto do módulo (mod-NNN-nome.md) com objetivo, escopo e dependências
[ ] 3. Criar requirements/ com subpastas: br/ fr/ data/ int/ sec/ ux/ nfr/ tst/
[ ] 4. Criar arquivos canônicos: BR-NNN.md, FR-NNN.md, DATA-NNN.md, ...
[ ] 5. Criar TST-NNN.md com casos obrigatórios mapeados para FR-NNN e SEC-NNN
[ ] 6. Criar adr/ para decisões arquiteturais
[ ] 7. Criar CHANGELOG.md com entrada de "bootstrap do módulo"
[ ] 8. Criar CONVENTIONS.md copiando o padrão do MOD-001
[ ] 9. Criar permissions.yaml com os escopos do módulo
[ ] 10. Criar amendments/ com subpastas: br/ fr/ data/ int/ sec/ ux/ nfr/ tst/
[ ] 11. Adicionar stub no DOC-DEV-001 (docs/03_especificacoes/)
[ ] 12. Atualizar INDEX.md em docs/
```

> **Regra de herança obrigatória:** Todo módulo DEVE herdar entidades e contratos de `mod-000-foundation`.
> **Nunca recrie** tabelas de `users` ou `tenants`. Use FKs com UUID apontando para a Foundation.
> Leia `mod-000-foundation/requirements/imp/IMP-000.md` antes de codificar qualquer schema.

---

## 12. Regras de Operação (Resumo para Agentes)

1. **Stubs e Normas**: As regras de ouro de código e spec residem no `DOC-DEV-001` (`docs/01_normativos/`). Detalhes funcionais ficam aqui.
2. **Automação**: Priorize o uso da skill `forge-module` para novos MODs.
3. **Nunca edite** um documento canônico diretamente para adicionar funcionalidade → crie um amendment.
4. **Toda mudança** entra no `CHANGELOG.md` do módulo com status e evidência.
5. **Ao integrar** um amendment: atualize o canônico, marque o delta como `INTEGRADA`, inclua link para PR/issue.
6. **Anti-patterns da Foundation** (`IMP-000`) devem ser consultados antes de qualquer geração de schema ou endpoint.
7. **Metadados obrigatórios** em todo arquivo: `estado_item`, `owner`, `data_ultima_revisao`, `rastreia_para`, `evidencias`.
8. **Permissões** sempre declaradas em `permissions.yaml` no padrão `recurso:ação`.
9. **TST-NNN obrigatório** em cada módulo — casos de teste devem ser especificados antes ou junto com o FR. Leia `TESTING-STRATEGY.md` para os padrões globais.
