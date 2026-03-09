# Índice de Documentação (EasyA1)

> **Regra de manutenção:** Atualizar este índice sempre que um novo documento for criado ou renomeado. IDs de documentos são estáveis e não mudam após publicação.

---

## 01 — Documentos Normativos

| Documento | ID | Descrição |
|---|---|---|
| [DOC-GNP-00 + CEE + CHE Consolidado v2.0](01_normativos/DOC-GNP-00__DOC-CEE-00__DOC-CHE-00__Consolidado_v2.0.md) | DOC-GNP-00 | Guia normativo MUST/SHOULD, exemplos EX-OAS-001..004, Gates CI |
| [DOC-ESC-001 — Escala de Arquitetura N0/N1/N2](01_normativos/DOC-ESC-001__Escala_de_Arquitetura_Niveis_0_1_2.md) | DOC-ESC-001 | Critérios de adoção de nível arquitetural e checklists de PR |
| [DOC-GPA-001 — Guia Padrão de Agente](01_normativos/DOC-GPA-001_Guia_Padrao_Agente.md) | DOC-GPA-001 | Catálogo de 11 agentes DEV + 6 agentes COD, contratos JSON, runtime |
| [DOC-ARC-003 — Ponte de Rastreabilidade e Payloads](01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md) | DOC-ARC-003 | UIActionEnvelope, 6 dogmas, Gates CI, Screen Manifests |
| [DOC-UX-010 — Catálogo de Ações e Template UX](01_normativos/DOC-UX-010__Catalogo_Acoes_e_Template_UX.md) | DOC-UX-010 | Catálogo oficial de action_keys reutilizáveis para telas |
| [DOC-ARC-001 — Padrões OpenAPI/Swagger](01_normativos/DOC-ARC-001__Padroes_OpenAPI.md) | DOC-ARC-001 | Normativo global de contratos OpenAPI: organização, convenções, DoD por endpoint |
| [DOC-ARC-002 — Estratégia de Testes Automáticos](01_normativos/DOC-ARC-002__Estrategia_Testes.md) | DOC-ARC-002 | Normativo global de testes: unitários vs integração, Testcontainers, Gates CI |
| [DOC-PADRAO-001 — Infraestrutura e Execução](01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md) | DOC-PADRAO-001 | Infraestrutura, dependências, execução de API/WEB e DB |
| [DOC-PADRAO-002 — Dependências NodeJS](01_normativos/DOC-PADRAO-002_Dependencias_NodeJS.md) | DOC-PADRAO-002 | Gestão de bibliotecas autorizadas, Turbo Repo e pnpm |
| [DOC-PADRAO-004 — Variáveis de Ambiente](01_normativos/DOC-PADRAO-004_Variaveis_de_Ambiente.md) | DOC-PADRAO-004 | Convenções de nome, validação (Zod) e fail-fast para ambiente |

---

## 02 — Pacotes de Agentes

| Documento | ID | Descrição |
|---|---|---|
| [PKG-DEV-001 — Pacote Agentes Enriquecimento](02_pacotes_agentes/PKG-DEV-001_Pacote_Agentes_Enriquecimento.md) | PKG-DEV-001 | Pacote DEV para enriquecer DOC-DEV-001 |
| [PKG-COD-001 — Pacote Agentes Geração de Código](02_pacotes_agentes/PKG-COD-001_Pacote_Agentes_Geracao_Codigo.md) | PKG-COD-001 | Pacote COD para geração de código por camada |
| [Levantamento de Skills Prioritárias](02_pacotes_agentes/Levantamento_Skills_Prioritarias.md) | — | Análise de skills disponíveis vs. necessárias |
| [Plano de Implantação de Agentes e Skills](02_pacotes_agentes/Plano_Implantacao_Agentes_Skills.md) | — | Roadmap de implantação dos agentes |

---

## 03 — Especificações

### Módulo Foundation

| Documento | ID | Descrição |
|---|---|---|
| UX-000 — Tela de Login e Autenticação | UX-000 | Especificação UX completa da tela de login (campos, SSO, MFA, eventos) |
| UX-001 — App Shell e SDUI | UX-001 | App Shell pós-login, Dispatcher de ações, Shell Config, SDUI |

### Especificação Executável (Template)

| Documento | ID | Descrição |
|---|---|---|
| [DOC-DEV-001 — Template](03_especificacoes/template/DOC-DEV-001.template.md) | — | Template oficial para novos módulos |

---

## 04 — Módulos (`04_modules`)

Cada módulo possui raiz em `04_modules/` com `mod.md`, `requirements/`, `amendments/`, `adr/`.

| Módulo | Arquivo Raiz | Estado |
|---|---|---|
| MOD-000 — Framework de Automação / Geradores (Foundation) | [mod.md](04_modules/mod-000-foundation/mod.md) | READY |
| MOD-001 — Backoffice (Admin) | [mod.md](04_modules/mod-001-backoffice/mod.md) | READY |

> **Nota:** Novos módulos devem criar um subdiretório próprio em `04_modules/<mod-id>/` seguindo o padrão do MOD-001.

---

---

## Referências Cruzadas Obrigatórias

| Conceito | Definido em | Referenciado por |
|---|---|---|
| JWT + Sessions + Kill-Switch | Foundation `IMP-000` | UX-000, UX-001 |
| Multitenancy (Conceitos) | Foundation `mod.md` | DOC-BD-001 `tenants` |
| RBAC (`@RequireScope`) | Foundation `mod.md` | UX-001, todos os módulos |
| Audit Trail (`AuditService`) | Foundation `IMP-000` | UX-000 `SEC-EventMatrix` |
| UIActionEnvelope | DOC-ARC-003 §2 | UX-000 §8, DOC-UX-010 |
| action_keys UX | DOC-UX-010 | UX-000 §8, DOC-ARC-003 §9 |
| OpenAPI Gates | DOC-GNP-00 EX-OAS-001..004 | DOC-ESC-001, DOC-ARC-003 §8 |

---

## Observações Operacionais

- O **Gate EX-CI-007** aponta para os arquivos "de contrato" (Consolidado + DOC-DEV-001).
- Ao atualizar qualquer doc, **mantenha IDs estáveis** e rastreabilidade (`EX-*`, `SEC-EventMatrix`, `DATA-003`, `UX-010`) conforme o guia.
- **Pasta 05_manifests:** prevista na arquitetura; será povoada quando os Screen Manifests forem formalizados (Gate DOC-ARC-003 §8 item 3 exige catálogo de RBAC em `docs/04_modules/mod-000-foundation/permissions.yaml`).
