> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.10.0 | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → IMPLEMENTADA — known limitation v1 documentada em BR-004 v0.2.0 |
>
| 0.9.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-003 → IMPLEMENTADA — Opção A (ADR-002 v0.2.0, copy.ts structure) |
| 0.8.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-003 → DECIDIDA (Opção A) |
| 0.7.0  | 2026-03-18 | usuário     | PENDENTE-002 decidida — Opção A (cooldown client-side, known limitation v1) |
| 0.6.0  | 2026-03-18 | usuário     | PENDENTE-001 implementada — endpoint adicionado diretamente em FR-000 §FR-006 (DRAFT) |
| 0.5.0  | 2026-03-18 | usuário     | PENDENTE-001 decidida — Opção A (amendment MOD-000-F05) |
| 0.4.0  | 2026-03-17 | AGN-DEV-10  | Batch 4 — adicionadas PENDENTE-002 (cooldown cross-tab) e PENDENTE-003 (copy centralizada) |
> | 0.3.0  | 2026-03-17 | AGN-DEV-11  | Renomeação pen-002-pendente.md, H1 corrigido, sla_data e dependencias adicionados |
> | 0.2.0  | 2026-03-17 | AGN-DEV-11  | Migração para formato enriquecido (TEMPLATE-PENDENTE §4) |
> | 0.1.0  | 2026-03-17 | AGN-DEV-10  | Criação — pendência de amendment no MOD-000-F05 |

# PEN-002 — Questões Abertas do MOD-002 (Gestão de Usuários)

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-18
- **rastreia_para:** US-MOD-002, US-MOD-002-F03, FR-003, INT-001, DATA-003, SEC-002, UX-001, MOD-000, US-MOD-000-F05, BR-004, ADR-002
- **referencias_exemplos:** EX-CI-007
- **evidencias:** Pendência documentada em US-MOD-002-F03 §1, épico §10, FR-003 (seção Amendment Obrigatório). Migrada para formato enriquecido por AGN-DEV-11. Batch 4 (AGN-DEV-10): 2 novas pendências adicionadas — cooldown cross-tab e copy centralizada.

---

## Painel de Controle

| # | Status | Sev. | Domínio | Questão (resumo) | Responsável | SLA |
|---|---|---|---|---|---|---|
| PENDENTE-001 | ✅ IMPLEMENTADA | 🔴 BLOQUEANTE | ARC | ~~Amendment `users_invite_resend` no MOD-000-F05~~ | — | Antes do scaffolding F03 |
| PENDENTE-002 | ✅ IMPLEMENTADA | 🟡 MÉDIA | ARC | ~~Cooldown anti-spam cross-tab: known limitation v1~~ | Marcos Sulivan | Antes do scaffolding F03 |
| PENDENTE-003 | ✅ IMPLEMENTADA | 🟢 BAIXA | UX | ~~Estrutura de copy centralizada (`domain/copy.ts`)~~ | Marcos Sulivan | Durante scaffolding |

---

## PENDENTE-001 — Amendment `users_invite_resend` no MOD-000-F05

- **status:** IMPLEMENTADA
- **severidade:** BLOQUEANTE
- **domínio:** ARC
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** A
- **justificativa_decisao:** Criar amendment no MOD-000-F05 é a abordagem definitiva; contrato já especificado em US-MOD-002-F03 §1
- **modulo:** MOD-002
- **rastreia_para:** [US-MOD-002, US-MOD-002-F03, FR-003, INT-001, DATA-003, SEC-002, UX-001, MOD-000, US-MOD-000-F05]
- **tags:** [amendment, cross-module, wave-1, users-api]
- **sla_data:** —
- **dependencias:** []

### Questão

O endpoint `POST /api/v1/users/:id/invite/resend` (operationId: `users_invite_resend`) **não existe** no MOD-000-F05 atual. A feature F03 (UX-USR-003 — Fluxo de Convite e Ativação) depende deste endpoint para funcionar.

### Impacto

- **Bloqueio de DoD:** F03 não pode ser scaffoldada nem testada sem este endpoint
- **Artefatos impactados:** FR-003, INT-001, DATA-003 (`user.invite_resent`), SEC-002, UX-001 (Jornada 3)
- **Não bloqueia:** F01 e F02 podem ser scaffoldadas independentemente

### Opções

**Opção A — Criar amendment no MOD-000-F05 (Recomendada):**
Usar `/create-amendment` no MOD-000-F05 para adicionar o endpoint. Contrato mínimo já documentado em US-MOD-002-F03 §1.

- Prós: resolve o bloqueio definitivamente; contrato já especificado (scope, status, outbox, idempotência); alinhado com padrão do Foundation
- Contras: depende de revisão/aprovação do owner do MOD-000

**Opção B — Stub temporário no frontend:**
Implementar F03 com endpoint mockado e feature flag. Habilitar quando o amendment for criado.

- Prós: permite iniciar o scaffolding de F03 imediatamente
- Contras: complexidade adicional de feature flag sem benefício real; risco de divergência entre mock e contrato final; trabalho descartável

### Recomendação

**Opção A** — Criar o amendment no MOD-000-F05 **antes** de iniciar o scaffolding da F03. F01 e F02 podem ser scaffoldadas em paralelo sem bloqueio.

**Sequência sugerida:**

```
1. Scaffoldar F01 (Listagem) → sem dependência
2. Scaffoldar F02 (Formulário) → sem dependência
3. Criar amendment users_invite_resend no MOD-000-F05
4. Scaffoldar F03 (Convite) → após amendment aprovado
```

### Ação Sugerida

| Skill | Propósito | Quando executar |
|---|---|---|
| `/create-amendment MOD-000 FR-005` | Adicionar o endpoint `users_invite_resend` ao MOD-000-F05 | Antes do scaffolding da F03 |
| `/validate-all docs/04_modules/mod-000-foundation/` | Confirmar que o amendment foi integrado corretamente | Após amendment aplicado |
| `/validate-all docs/04_modules/mod-002-gestao-usuarios/` | Verificar que INT-001 e FR-003 reconhecem o novo endpoint | Após amendment aprovado |

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — Criar amendment no MOD-000-F05
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Resolve o bloqueio definitivamente; contrato mínimo já documentado em US-MOD-002-F03 §1 (scope, status, outbox, idempotência); alinhado com padrão do Foundation. Stub temporário (Opção B) adicionaria complexidade descartável sem benefício real.
> **Artefato de saída:** FR-000 §FR-006 (MOD-000) v0.5.0 — endpoint `users_invite_resend` adicionado diretamente (DRAFT)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-002~~ — ✅ IMPLEMENTADA: Cooldown Anti-Spam Cross-Tab (Known Limitation v1)

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** A
- **justificativa_decisao:** Cooldown client-side é suficiente para backoffice interno com usuários confiáveis; rate limiting genérico do gateway cobre cenário de abuso sistemático; documentar como known limitation v1
- **modulo:** MOD-002
- **rastreia_para:** [US-MOD-002-F03, FR-003, BR-004, SEC-001, NFR-001]
- **tags:** [cooldown, anti-spam, cross-tab, ux-behavior]
- **sla_data:** —
- **dependencias:** []

### Questão

BR-004 define cooldown de 60s client-side no botão "Reenviar convite". **O que acontece quando o admin abre a mesma tela de convite em múltiplas abas?** Cada aba teria seu próprio timer independente, permitindo burlar o cooldown abrindo nova aba. O backend (MOD-000-F05) possui rate limiting genérico (SEC-001 §8), mas não está especificado se existe rate limiting específico por `user_id + invite_resend`.

### Impacto

- **Sem rate limiting backend específico:** Admin pode enviar convites ilimitados abrindo novas abas, gerando spam de e-mail.
- **Artefatos impactados:** BR-004 (regra incompleta), FR-003 (cenários de edge case), NFR-001 (resiliência), INT-001 (contrato com backend).

### Opções

**Opção A — Aceitar cooldown apenas client-side (Recomendada para v1):**
O cooldown client-side é suficiente para o caso de uso nominal (admin bem-intencionado). O rate limiting genérico do gateway protege contra abuso sistemático. Documentar a limitação como "known limitation v1".

- Pros: zero complexidade adicional; rate limiting do gateway cobre cenário de abuso
- Contras: admin pode contornar cooldown via múltiplas abas (cenário improvável em backoffice interno)

**Opção B — Sincronizar cooldown via BroadcastChannel API:**
Usar `BroadcastChannel` para sincronizar timer entre abas do mesmo origin.

- Pros: cooldown consistente cross-tab; sem round-trip ao backend
- Contras: complexidade adicional; `BroadcastChannel` requer polyfill em Safari < 15.4; benefício marginal para backoffice interno

**Opção C — Rate limiting específico no backend (MOD-000-F05):**
Solicitar amendment no MOD-000-F05 para rate limiting por `user_id + invite_resend` (ex: 1 reenvio a cada 60s por user).

- Pros: proteção server-side real; independente do frontend
- Contras: requer amendment adicional no MOD-000; complexidade de implementação no backend; já existe rate limiting genérico no gateway

### Recomendação

**Opção A** para v1. Cooldown client-side é suficiente para backoffice interno com usuários confiáveis. Documentar como "known limitation" e reavalisar se telemetria indicar abuso.

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — Aceitar cooldown apenas client-side (known limitation v1)
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Cooldown client-side é suficiente para backoffice interno com usuários confiáveis. O rate limiting genérico do gateway (SEC-001 §8) protege contra abuso sistemático. BroadcastChannel (Opção B) adiciona complexidade marginal e requer polyfill. Rate limiting backend específico (Opção C) requer amendment adicional no MOD-000 sem benefício proporcional. Documentar como known limitation v1 e reavaliar se telemetria indicar abuso.
> **Artefato de saída:** BR-004 v0.2.0 (seção "Known Limitation v1" adicionada com descrição, justificativa e critério de reavaliação)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-003~~ — ✅ IMPLEMENTADA: Estrutura de Copy Centralizada (`domain/copy.ts`)

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **domínio:** UX
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Object map com plain strings é simples, type-safe, auditável via grep e sem dependência de lib de i18n. Suficiente para backoffice pt-BR only. Migração para i18n futura é trivial.
- **modulo:** MOD-002
- **rastreia_para:** [US-MOD-002, ADR-002, BR-002, BR-006, UX-001, SEC-001]
- **tags:** [copy, i18n, lgpd, pii-safe]
- **sla_data:** —
- **dependencias:** []

### Questão

O ADR-002 (PII-Safe UI Pattern) determina que todas as mensagens de feedback (toasts, modais, erros inline) devem ser definidas como constantes centralizadas em `domain/copy.ts` para facilitar auditoria LGPD. **Qual a estrutura interna desse arquivo?** As mensagens devem ser plain strings, template functions com parâmetros seguros, ou um sistema de i18n?

### Impacto

- **Sem definição:** Cada desenvolvedor cria strings inline nos componentes, dificultando auditoria LGPD e violando ADR-002.
- **Artefatos impactados:** ADR-002 (consequência 1), BR-002 (enforcement), BR-006 (copy de erros), UX-001 (copy section).

### Opções

**Opção A — Object map com plain strings (Recomendada):**
Objeto TypeScript com chaves semânticas e valores string. Parâmetros seguros via template function quando necessário (ex: `deactivateModal: (name: string) => \`O usuário ${name} perderá acesso imediatamente.\``).

- Pros: simples; type-safe; auditável via grep; sem dependência de lib de i18n
- Contras: sem suporte nativo a pluralização ou locales múltiplos (aceitável — backoffice apenas pt-BR)

**Opção B — Lib de i18n (react-intl, i18next):**
Usar biblioteca de internacionalização com arquivos de mensagens.

- Pros: suporte a pluralização, formatação de datas, múltiplos locales futuramente
- Contras: over-engineering para backoffice pt-BR only; dependência adicional; complexidade de setup

### Recomendação

**Opção A** — Object map simples em `domain/copy.ts`. Suficiente para backoffice pt-BR. Se i18n for necessário no futuro, migração é trivial (extrair strings para arquivo JSON de locale).

### Resolução

> **Decisão:** Opção A — Object map com plain strings em `domain/copy.ts`
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Object map com plain strings é simples, type-safe, auditável via grep e sem dependência de lib de i18n. Suficiente para backoffice pt-BR only. Migração para i18n futura é trivial (extrair strings para arquivo JSON de locale).
> **Artefato de saída:** ADR-002 v0.2.0 (§Estrutura de `domain/copy.ts` adicionada)
> **Implementado em:** 2026-03-18
