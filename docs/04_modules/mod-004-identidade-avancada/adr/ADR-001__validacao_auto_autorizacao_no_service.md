> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-09  | Criação (enrich-agent) |

# ADR-001 — Validação de Auto-Autorização no Service (Não via CHECK Constraint)

## Contexto

O modelo `access_shares` possui campos `grantor_id` e `authorized_by`. A regra original (v1.0.0 do épico) exigia `authorized_by ≠ grantor_id` como regra absoluta, implementada via CHECK constraint no banco.

Em 2026-03-15, durante a revisão do épico US-MOD-004 (v1.1.0), foi decidido que a segregação deveria ser **condicional** ao scope `identity:share:authorize`:

- **Com scope:** auto-autorização permitida (grantor = authorized_by)
- **Sem scope:** segregação mantida (grantor ≠ authorized_by)

Um CHECK constraint no banco não consegue avaliar o token JWT do caller (scopes). A validação precisa acontecer na camada de aplicação.

## Decisão

**Validar `authorized_by ≠ grantor_id` exclusivamente no service (use case), sem CHECK constraint no banco.**

O service verifica:

1. Se `grantor_id == authorized_by`: consulta se o caller possui scope `identity:share:authorize`
2. Se possui → permite (201)
3. Se não possui → rejeita (422: "Sem scope 'identity:share:authorize', o autorizador deve ser diferente do solicitante.")

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **A) CHECK constraint no banco** (`authorized_by != grantor_id`) | Enforcement forte no DB; impossível bypass | Não permite auto-autorização com scope; regra inflexível |
| **B) CHECK + flag `self_authorized`** | DB enforcement + flexibilidade | Complexidade adicional; flag pode ser setada incorretamente |
| **C) Validação no service (escolhida)** | Flexível; avalia scopes do JWT; lógica centralizada no use case | Sem enforcement no DB; requer testes rigorosos |

## Consequências

- **Positivas:**
  - Regra de auto-autorização é flexível e extensível
  - Lógica centralizada no service, testável com mocks
  - Alinhada com padrão Nível 2 (domínio decide, não o banco)

- **Negativas:**
  - Sem safety net no banco — um bug no service poderia permitir auto-autorização indevida
  - Requer testes específicos: (a) com scope → permite, (b) sem scope → bloqueia
  - Requer documentação explícita (esta ADR + BR-001.7)

- **Mitigações:**
  - Testes unitários obrigatórios no use case `CreateAccessShareUseCase`
  - Cenários Gherkin no BR-001.7 e FR-001.2
  - Auditoria via domain event `identity.share_created` registra `authorized_by`

## Status

**ACEITA** — Decisão técnica 2026-03-15 (US-MOD-004 v1.1.0, Marcos Sulivan)

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-004, BR-001.7, FR-001.2, DATA-001, SEC-001
- **referencias_exemplos:** N/A
- **evidencias:** US-MOD-004 CHANGELOG v1.1.0 (2026-03-16)
