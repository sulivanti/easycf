# Levantamento de Skills Prioritárias (Domínio)

**Versão:** 2.2
**Data:** 2026-03-13
**Base:** DOC-PADRAO-002, DOC-GNP-00, DOC-GPA-001, estado real do diretório `.agents/skills`

Com base na análise das especificações e padrões arquiteturais do ecossistema (`DOC-PADRAO-002`, `DOC-GNP-00` e `DOC-GPA-001`), o núcleo do produto baseia-se em **Node.js, TypeScript, Drizzle ORM, Fastify, Zod e Redis**.

Este documento cataloga o **estado atual** das Skills, separando as **já implementadas** das **pendentes críticas**, e orienta os Agentes do Pacote COD e DEV sobre quais capacidades estão disponíveis para uso imediato.

---

## Catálogo Atual de Skills (`.agents/skills`)

### Skills de Processo / Workflow

| Skill | Tipo | Uso Principal | Agente(s) |
| --- | --- | --- | --- |
| `forge-module` | Customizada ✅ | Forja estrutural do módulo (Paradigma XP) | Agente / Dev |
| `create-amendment` | Customizada ✅ | Criar emenda governada em spec com status READY | PKG-DEV-001 |
| `create-specification` | Comunidade+ | Gerar novo arquivo de especificação técnica | PKG-DEV-001 |
| `update-specification` | Comunidade+ | Atualizar spec existente após mudança de regras | PKG-DEV-001 |
| `delete-module` | Customizada ✅ | Excluir pasta de módulo e atualizar índice global | Agente / Dev |
| `rollback-module` | Customizada ✅ | Desfazer forge de módulo e retornar US ao pipeline | Agente / Dev |
| `prompt-builder` | Comunidade+ | Estruturar prompts para GitHub Copilot | PKG-DEV-001 / PKG-COD-001 |
| `skill-creator` | Comunidade+ | Criar, modificar e avaliar novas skills | PKG-DEV-001 / PKG-COD-001 |

### Skills de Documentação / Artefatos

| Skill | Tipo | Uso Principal | Agente(s) |
| --- | --- | --- | --- |
| `create-oo-component-documentation` | Comunidade+ | Documentar componentes OO com padrão industrial | PKG-COD-001 |
| `readme-blueprint-generator` | Comunidade+ | Gerar `README.md` a partir de estrutura existente | PKG-COD-001 |
| `theme-factory` | Comunidade | Aplicar temas visuais a artefatos (slides, HTML, docs) | PKG-DEV-001 |
| `update-markdown-file-index` | Comunidade+ | Atualizar índice de arquivos em seção Markdown | PKG-DEV-001 |

### Skills Técnicas (ORM, API, Banco)

| Skill | Tipo | Uso Principal | Agente(s) |
| --- | --- | --- | --- |
| `validate-drizzle-schemas` | **Customizada ✅** | Validar schemas Drizzle contra regras de multitenancy, anti-patterns e integração Zod | PKG-COD-001 (AGN-COD-DB) |
| `validate-fastify-endpoint` | **Customizada ✅** | Validar handler Fastify: RBAC, Correlation-ID, RFC 9457, schema OpenAPI | PKG-COD-001 (AGN-COD-API) |
| `validate-openapi-contract` | **Customizada ✅** | Auditar contrato OpenAPI (EX-OAS-001..004), lint Spectral e marcador `@contract` | PKG-COD-001 (AGN-COD-API) |
| `validate-screen-manifest` | **Customizada ✅** | Validar Screen Manifests YAML contra schema v1, DOC-UX-010, DOC-ARC-003, DOC-UX-012 | PKG-DEV-001 (AGN-DEV-07) |
| `drizzle-orm` | Comunidade | Referência técnica de padrões Drizzle ORM (quick-start, queries, migrations) | PKG-COD-001 (AGN-COD-DB) |

> **Legenda:** "Comunidade+" = skill genérica adaptada/enriquecida com regras do domínio. "Customizada" = skill criada exclusivamente para as regras arquiteturais deste projeto.

---

## 1. Operações Críticas — ORM e Banco de Dados (Drizzle)

**Status:** ✅ Skill implementada — `validate-drizzle-schemas`

A skill `validate-drizzle-schemas` cobre as validações mais críticas do domínio de banco de dados.

> 📄 **Para o conjunto completo e atualizado de regras**, consulte diretamente a skill: `../../.agents/skills/validate-drizzle-schemas/SKILL.md`.

**Skill complementar:** `drizzle-orm` (genérica) fornece referência de padrões de queries, migrations e schemas quando o agente precisar de exemplos técnicos do ORM.

---

## 2. Operações Críticas — API e Endpoints (Fastify + TypeScript)

A segurança perimetral exige que endpoints Fastify sigam padrões inegociáveis. Os agentes devem observar:

- **Verificação Obrigatória de RBAC:** Toda rota autenticada deve invocar o Guard `@RequireScope('module:resource:act')`. O agente não pode criar decoders JWT customizados no fluxo.
- **Propagação de Cabeçalhos Transversais:** Endpoints de mutação (POST, PUT, PATCH) devem validar `X-Correlation-ID` e `Idempotency-Key`.
- **Formatação de Exceções:** Rejeições devem usar RFC 9457 Problem Details (`{ type, title, status, detail, instance }`).

> **✅ Implementado:** A skill `validate-fastify-endpoint` cobre validação estática do handler (RBAC, Correlation-ID, RFC 9457, schema OpenAPI). A skill `validate-openapi-contract` cobre auditoria do contrato YAML publicado (EX-OAS-001..004).

---

## 3. Contratos OpenAPI e Rastreabilidade

**Status:** ✅ Skill implementada — `validate-openapi-contract`

O normativo `DOC-GNP-00` exige conformidade com Spectral, Swagger UI e amarração de IDs. A skill `validate-openapi-contract` cobre:

- Validação do `apps/api/openapi/v{X}.yaml` (**EX-OAS-001**).
- Lint via `apps/api/openapi/spectral.yaml` (**EX-OAS-002**).
- Verificação de infraestrutura do Swagger UI local (**EX-OAS-003**) e testes de contrato (**EX-OAS-004**).
- Verificação do marcador `// @contract EX-OAS-{ID}` nos artefatos TypeScript.

---

## 4. Auditoria Imutável (Eventos Transversais)

**Status:** ⚠️ Skill pendente — `validate-audit-hooks`

O módulo IAM exige trilhas de auditoria em operações críticas. Cobertura necessária:

- Injeção de registros *append-only* na tabela `audit_logs` para Update/Delete de entidades críticas.
- Validação de *Soft Delete* (campo `deleted_at` obrigatório — LGPD).

> **Nota:** A skill `validate-drizzle-schemas` já cobre parcialmente este ponto (regra 4 — Audit Trail). A skill `validate-audit-hooks` deve ampliar para cobrir a camada de Application (Use Cases), não só o schema de banco.

---

## 5. Lacunas Identificadas vs. Documentação Anterior

A versão anterior deste documento (v1.0) não documentava as skills genéricas que chegaram ao projeto. A atualização abaixo reflete o estado real:

| Item | Status Anterior | Status Atual |
| --- | --- | --- |
| `validate-drizzle-schemas` | "Futura / A criar" | ✅ Implementada e ativa |
| `drizzle-orm` | Não documentada | ✅ Instalada (genérica, referência técnica) |
| `postman-collection-generator` | Não documentada | ❌ Removida — não alinhada com o stack/contratos do projeto |
| `theme-factory` | Não documentada | ✅ Instalada (utilitária para artefatos) |
| `update-markdown-file-index` | Não documentada | ✅ Instalada (manutenção de índices docs) |

| `validate-openapi-contract` | "Futura / A criar" | ✅ Implementada |
| `validate-fastify-endpoint` | Não documentada | ✅ Implementada |
| `create-amendment` | Não documentada | ✅ Implementada |
| `delete-module` | Não documentada | ✅ Implementada |
| `rollback-module` | Não documentada | ✅ Implementada |
| `validate-audit-hooks` | "Futura / A criar" | ⚠️ Pendente — prioridade média |

---

## Próximos Passos

Usar a skill `skill-creator` para materializar as skills customizadas restantes, na seguinte ordem de prioridade:

1. **`validate-audit-hooks`** — Amplia cobertura de auditoria para a camada de Application (Use Cases), complementando o que `validate-drizzle-schemas` cobre no schema de banco. Média criticidade.

---

## Changelog

- v2.2 (2026-03-13): Implementação de `validate-openapi-contract` (EX-OAS-001..004, lint Spectral, `@contract`). Skills `validate-fastify-endpoint`, `create-amendment`, `delete-module`, `rollback-module` documentadas no catálogo. Tabela de lacunas (Seção 5) atualizada. Path do diretório de skills atualizado para `.agents/skills`.
- v2.1 (2026-03-05): Removida skill `postman-collection-generator` — não alinhada com contratos do projeto (sem suporte a `X-Correlation-ID`, `X-Tenant-ID`, RBAC). Lacuna marcada como ativa até entrega de `validate-openapi-contract`.
- v2.0 (2026-03-04): Revisão completa. Adição do catálogo de skills existentes (tabelas), marcação de `validate-drizzle-schemas` como implementada, documentação das skills genéricas recentemente instaladas (`drizzle-orm`, `theme-factory`, `update-markdown-file-index`), tabela de lacunas encontradas (Seção 5).
- v1.0 (data original): Levantamento inicial das operações críticas sem distinção de estado de implementação.
