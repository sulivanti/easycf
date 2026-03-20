> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-09  | Baseline — formaliza princípio Zero-Blank-Screen com skeleton timeout |

# ADR-003 — Princípio Zero-Blank-Screen com Skeleton Timeout de 3 Segundos

---

## Contexto

O Dashboard executivo (UX-DASH-001) depende de `GET /auth/me` para renderizar WelcomeWidget e ModuleShortcuts. Se a API estiver lenta ou indisponível, o usuário veria uma tela em branco indefinidamente — experiência inaceitável para um painel administrativo. A decisão envolve: (a) quanto tempo esperar antes de mostrar erro, (b) como tratar erros 5xx vs 401, (c) se o erro desconecta o usuário.

## Decisão

Adotar o **princípio Zero-Blank-Screen** com as seguintes regras:

1. **Skeleton timeout fixo de 3 segundos:** Se `GET /auth/me` não retornar em 3s, o skeleton é substituído por estado de erro parcial (nunca tela branca) com Toast contendo correlationId e botão "Tentar novamente".
2. **Distinção 401 vs 5xx:** Apenas o 401 desconecta o usuário (redirect /login). Erros 5xx e timeouts mantêm o usuário autenticado no Shell, permitindo retry manual.
3. **Retry com novo correlation_id:** Cada retry gera novo `X-Correlation-ID` UUID v4 e novo UIActionEnvelope (`dashboard_retry`), garantindo rastreabilidade independente de cada tentativa.
4. **Aplicação universal:** O princípio Zero-Blank-Screen se aplica a todas as telas do MOD-001, não apenas ao Dashboard.

## Alternativas

- **(A) Timeout infinito (sem skeleton timeout):** Rejeitada — risco de tela branca indefinida se API lenta. UX inaceitável.
- **(B) Timeout com desconexão automática:** Rejeitada — desconectar em timeout ou 5xx é excessivo. O problema pode ser intermitente e o usuário perderia sessão sem necessidade.
- **(C) Timeout adaptativo (baseado em histórico de latência):** Rejeitada — complexidade desproporcional para MOD-001 (módulo UX-First Nível 1). Valor fixo de 3s é simples, previsível e alinhado ao SLO de latência p95 para auth_me (300ms).
- **(D) Fallback com dados em cache (localStorage):** Rejeitada — viola BR-008 (auth_me como fonte única) e introduz risco de dados stale. Exceto se React Query/SWR for adotado (PENDENTE-001).

## Consequências

- **Positivas:**
  - UX consistente: usuário sempre vê feedback visual (skeleton ou erro), nunca tela branca
  - Resiliência: erros 5xx e timeouts não interrompem a sessão do usuário
  - Rastreabilidade: cada tentativa (original e retries) é rastreável individualmente via correlation_id
  - Simplicidade: timeout fixo de 3s é determinístico e fácil de testar
- **Negativas:**
  - 3s pode ser curto para redes lentas (mitigado pelo botão retry)
  - Estado de erro parcial pode gerar chamados de suporte se frequente (mitigado por correlationId visível ao usuário)

## Status

**ACEITA** — decisão implementada em BR-009, BR-010, FR-005, NFR-001 §5, UX-001 (UX-003), DATA-003, SEC-001 §6.

## Validade

Permanente — princípio de UX do módulo. O valor de 3s pode ser revisado via PENDENTE se métricas de produção indicarem necessidade.

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-001-F03, BR-009, BR-010, FR-005, NFR-001, UX-001, DATA-003, SEC-001
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
