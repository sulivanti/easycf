> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-09  | Baseline — formaliza separação de telemetria pré/pós-auth |

# ADR-002 — Separação de Telemetria Pré/Pós-Autenticação via UIActionEnvelope

---

## Contexto

O MOD-001 opera em dois contextos de segurança distintos: **pré-autenticação** (tela de login, forgot-password, reset-password) e **pós-autenticação** (Shell, Dashboard). A telemetria de UI via `UIActionEnvelope` (DOC-ARC-003 §2) precisa rastrear ações em ambos os contextos, mas o `tenant_id` só está disponível após login bem-sucedido.

A decisão central é: como tratar a presença/ausência de `tenant_id` no envelope de telemetria sem comprometer privacidade (anti-enumeração) nem rastreabilidade (observabilidade).

## Decisão

Adotar **separação explícita por fase de autenticação** no UIActionEnvelope:

- **Pré-auth (UX-AUTH-001):** `tenant_id` AUSENTE (null/omitido). Ações: `submit_login`, `submit_forgot_password`, `submit_reset_password`, `navigate_to_forgot`, `navigate_to_login`.
- **Pós-auth (UX-SHELL-001, UX-DASH-001):** `tenant_id` PRESENTE (extraído do JWT). Ações: `load_current_user`, `submit_logout`, `navigate_sidebar`, `navigate_breadcrumb`, `load_dashboard_profile`, `dashboard_skeleton_timeout`, `dashboard_retry`.

O `X-Correlation-ID` é propagado em **toda** requisição HTTP (não-client_only), permitindo correlação com domain events do MOD-000 independentemente da fase.

## Alternativas

- **(A) tenant_id sempre presente (inferir do domínio do e-mail):** Rejeitada — revela informações sobre a existência de tenants e e-mails (viola anti-enumeração BR-001, BR-002).
- **(B) Dois tipos de envelope distintos (PreAuthEnvelope e PostAuthEnvelope):** Rejeitada — complexidade desnecessária. O campo condicional `tenant_id` no mesmo envelope é mais simples e o schema já suporta campos opcionais.
- **(C) Não rastrear ações pré-auth:** Rejeitada — perde observabilidade de tentativas de login falhadas e ataques de brute-force.

## Consequências

- **Positivas:**
  - Privacidade: ações pré-auth não vinculam a nenhum tenant (anti-enumeração reforçada)
  - Rastreabilidade: X-Correlation-ID permite correlação end-to-end sem depender de tenant_id
  - Simplicidade: um único schema UIActionEnvelope com campo condicional
  - Segurança: eventos `auth.login_failed` no backend (MOD-000) são correlacionáveis via X-Correlation-ID sem expor PII na telemetria do frontend
- **Negativas:**
  - UIActionEnvelopes pré-auth não são indexáveis por tenant — análise cross-tenant de tentativas de login requer consulta ao backend (domain_events do MOD-000)
  - Equipe precisa lembrar da regra condicional ao adicionar novas ações

## Status

**ACEITA** — decisão implementada em BR-006, DATA-003, SEC-001 §5, SEC-002.

## Validade

Permanente — enquanto o MOD-001 operar com contextos pré e pós-autenticação.

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-001-F02, BR-006, DATA-003, SEC-001, SEC-002, DOC-ARC-003
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
