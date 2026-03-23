# Procedimento — Plano de Acao MOD-000 Foundation

> **Versao:** 1.3.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.10.0) | **Epico:** READY (v0.9.0) | **Features:** 17/17 READY
>
> Fases 0-3 concluidas. Todas as 12 pendencias IMPLEMENTADA (incluindo 008-012 da Fase 3, resolvidas em 2026-03-22). Validate-all re-executado: 29/29 manifests PASS, 0 violacoes. Proximo passo: executar `/promote-module` para selar MOD-000 como READY.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-000 | READY (v0.9.0) | DoR completo, 17 features vinculadas |
| Features F01-F17 | 17/17 READY | Todas seladas — F01 (Auth), F02 (MFA), F03 (SSO), F04 (Forgot), F05 (Users), F06 (RBAC), F07 (Tenants), F08 (Profile), F09 (Tenant-User), F10 (Change-Pwd), F11 (GET /info), F12 (Scopes CRUD), F13 (Telemetria UI), F14 (Correlation E2E), F15 (CI Gates), F16 (Storage), F17 (Apple SSO) |
| Scaffold (forge-module) | CONCLUIDO | mod-000-foundation/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Todos os 11 agentes executados, v0.10.0 atingida |
| PENDENTEs | 0 abertas | 12 total: 12/12 IMPLEMENTADA (008-012 resolvidas 2026-03-22) |
| ADRs | 4 aceitas (2 arquivos) | Nivel 2 requer minimo 3 — atendido (ADR-001/002/003 em ADR-001.md + ADR-004.md) |
| Amendments | 5 criados | DOC-PADRAO-005-C01, DOC-FND-000-M01, M02, M03, M04 |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.10.0 | Ultima entrada 2026-03-19 (Etapa 4 pipeline) |
| Screen Manifests | 5 proprios MOD-000 | ux-auth-001, ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 (PENDENTE-012 IMPLEMENTADA) |
| Dependencias | 0 upstream | MOD-000 e raiz — camada topologica 0 (11 dependentes) |
| Bloqueios | 0 pendencias bloqueantes | BLK-001 (MOD-002 → amendment F05) resolvido pos-enriquecimento. 0 pendencias ABERTA. |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-000 define a governanca de documentos normativos para o framework de geracao automatica de codigo. Com 17 features mapeadas cobrindo auth, RBAC, multi-tenant, SSO, MFA, storage, telemetria e CI gates, o epico foi promovido a READY em v0.9.0 com DoR completo.

```
1    (manual)              Revisar e finalizar epico US-MOD-000:             CONCLUIDO
                           - Escopo fechado (17 features)                   status_agil = READY
                           - Gherkin validado nos Criterios de Aceite       v0.9.0
                           - DoR completo (owner, dependencias, impacto)
                           - 14 documentos normativos cobertos como
                             fonte de verdade (DOC-DEV-001 a DOC-UX-012)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-000.md

2    (manual)              Revisar e finalizar features F01-F17:             CONCLUIDO
                           - Gherkin detalhado validado                     17/17 READY
                           - nivel_arquitetura e wave_entrega confirmados
                           - manifests_vinculados preenchidos
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-000-F{01..17}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo scaffoldado do sistema. Como Foundation, nao possui dependencias upstream — todos os demais modulos (MOD-001 a MOD-011) dependem dele.

```
3    /forge-module MOD-000  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-15)
                           (br/, fr/, data/, int/, sec/, ux/, nfr/),
                           adr/, amendments/
                           Pasta: docs/04_modules/mod-000-foundation/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-000 foi completo — todos os 11 agentes rodaram em 8 fases de execucao. Durante o processo, 7 pendencias (PENDENTE-001 a 007) foram identificadas, decididas e implementadas. O modulo atingiu v0.10.0.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-000
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-000
> ```

```
4    /enrich docs/04_modules/mod-000-foundation/
                           11 agentes executados sobre mod-000:              CONCLUIDO
                           Fase exec 1: AGN-DEV-01 (MOD — Nivel 2)         v0.10.0 (2026-03-18)
                           Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
                           Fase exec 3: AGN-DEV-04 (DATA + eventos)
                           Fase exec 4: AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
                           Fase exec 5: AGN-DEV-06 (SEC + EventMatrix)
                           Fase exec 6: AGN-DEV-07 (UX — manifests)
                           Fase exec 7: AGN-DEV-09 (ADR — 4 aceitas), AGN-DEV-10 (PEN — 7 implementadas)
                           Fase exec 8: AGN-DEV-11 (VAL — validacao cruzada)
```

#### Rastreio de Agentes — MOD-000

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod.md | CONCLUIDO | CHANGELOG v0.2.0-0.2.1 (2026-03-17) |
| 2 | AGN-DEV-02 | BR | BR-000.md | CONCLUIDO | 14 regras enriquecidas |
| 3 | AGN-DEV-03 | FR | FR-000.md | CONCLUIDO | 19 requisitos funcionais |
| 4 | AGN-DEV-04 | DATA | DATA-000.md, DATA-003.md | CONCLUIDO | 8 entidades, 34 domain events |
| 5 | AGN-DEV-05 | INT | INT-000.md | CONCLUIDO | 6 integracoes |
| 6 | AGN-DEV-06 | SEC | SEC-000.md, SEC-002.md | CONCLUIDO | CHANGELOG v0.8.0 (2026-03-18) — refresh rotation, SSO linking |
| 7 | AGN-DEV-07 | UX | UX-000.md | CONCLUIDO | 8 telas/jornadas mapeadas |
| 8 | AGN-DEV-08 | NFR | NFR-000.md | CONCLUIDO | SLOs, observabilidade, DR |
| 9 | AGN-DEV-09 | ADR | ADR-001.md, ADR-004.md | CONCLUIDO | 4 ADRs aceitas |
| 10 | AGN-DEV-10 | PEN | pen-000-pendente.md | CONCLUIDO | 7 pendencias (001-007) criadas e resolvidas |
| 11 | AGN-DEV-11 | VAL | validacao cruzada | CONCLUIDO | Findings geraram PENDENTE-005/006/007 |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 7 pendencias abaixo foram identificadas durante o enriquecimento (AGN-DEV-10/AGN-DEV-11) e todas foram decididas e implementadas em 2026-03-18. Registradas aqui para rastreabilidade das decisoes arquiteturais tomadas.

---

##### ~~PENDENTE-001 — Estrategia de SSO User Provisioning quando e-mail ja existe com senha nativa~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **rastreia_para:** US-MOD-000-F03, FR-000, SEC-000
- **tags:** SSO, account-linking, seguranca
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** B

**Questao:**
Quando um usuario faz login via SSO (Google/Microsoft) e o e-mail ja esta cadastrado com senha nativa, qual o comportamento? Vincular automaticamente? Exigir confirmacao? Bloquear?

**Impacto:**
Seguranca (account takeover risk), UX (experiencia de primeiro login SSO)

**Opcao A — Vinculacao automatica:**
Vincular automaticamente se o e-mail do SSO provider bater.

- Pros: UX fluida, zero friccao
- Contras: Risco de account takeover se provider for comprometido

**Opcao B — Confirmacao via senha nativa:**
Exigir que o usuario confirme via senha nativa antes de vincular SSO.

- Pros: Seguro contra account takeover, prova posse da conta existente
- Contras: Pior UX (exige passo extra no primeiro login SSO)

**Opcao C — Conta separada + merge admin:**
Criar conta separada com flag SSO e deixar admin mesclar.

- Pros: Nenhum risco automatico
- Contras: Complexidade operacional alta, duplicacao de dados

**Recomendacao:** Opcao B (confirmacao via senha) — equilibrio entre seguranca e UX. Registrar decisao em ADR.

**Resolucao:**

> **Decisao:** Opcao B — Confirmacao via senha nativa
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Prioriza seguranca contra account takeover sem eliminar a funcionalidade SSO. O passo extra de confirmar senha nativa e aceitavel na primeira vinculacao — fluxo: SSO detecta e-mail existente → pede senha nativa → valida → vincula provider. Alinhado com boas praticas de identity linking (OWASP).
> **Artefato de saida:** ADR-004, FR-000 v0.7.0 (FR-016 atualizado)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-002 — Politica de expiracao de refresh tokens com remember_me~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **rastreia_para:** US-MOD-000-F01, FR-001, FR-003, BR-002, SEC-000
- **tags:** refresh-token, rotacao, OAuth2-BCP, seguranca
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** B

**Questao:**
O refresh token com `remember_me=true` tem TTL de 30 dias. Deve haver rotacao de refresh token a cada uso (sliding window) ou TTL fixo desde a criacao?

**Impacto:**
Seguranca (janela de risco se token vazado), UX (frequencia de re-login)

**Opcao A — TTL fixo:**
TTL fixo de 30 dias desde criacao.

- Pros: Mais simples de implementar, comportamento previsivel
- Contras: Janela de risco fixa — token vazado permanece valido por ate 30 dias

**Opcao B — Rotacao a cada refresh:**
Novo refresh_token emitido a cada uso, antigo invalidado imediatamente.

- Pros: Seguro — token vazado e detectado na proxima rotacao (reuse detection), alinhado com OAuth2 BCP (RFC 6749 / draft-ietf-oauth-security-topics)
- Contras: Complexidade de implementacao (token families, reuse detection, race conditions em multiplas abas)

**Opcao C — Sliding window:**
Renova TTL a cada uso com maximo absoluto de 90 dias.

- Pros: Melhor UX (usuario ativo nunca e deslogado), janela de risco reduzida
- Contras: Mais complexo, max absoluto ainda permite janelas longas

**Recomendacao:** Opcao B (rotacao) — padrao de seguranca recomendado por OAuth2 BCP.

**Resolucao:**

> **Decisao:** Opcao B — Rotacao a cada refresh (refresh token rotation)
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Padrao OAuth2 BCP. A cada POST /auth/refresh, o servidor emite novo refresh_token e invalida o anterior. Se o token antigo for reutilizado (reuse detection), toda a familia de tokens e invalidada (kill-switch automatico de sessao comprometida). Race conditions em multiplas abas mitigadas com grace period de 10s para o token antigo.
> **Artefato de saida:** FR-000 v0.8.0 (FR-003 atualizado), SEC-000 v0.4.0, DATA-003 v0.8.0, SEC-002 v0.6.0
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-003 — Granularidade do campo codigo em tenant_users~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** DATA
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **rastreia_para:** US-MOD-000-F09, DATA-000, INT-000
- **tags:** tenant_users, codigo, chave-amigavel, integracoes
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** A

**Questao:**
O pivot `tenant_users` (PK composta userId+tenantId) nao tem campo `codigo` proprio (conforme US-MOD-000-F09 §4.8). Se APIs externas precisarem referenciar um vinculo, qual chave amigavel expor?

**Impacto:**
Integracoes, APIs externas, importacao/exportacao

**Opcao A — Expor `userId+tenantCode` concatenado:**
Sem mudanca no schema. A chave amigavel e derivada em runtime.

- Pros: Zero mudanca em DDL, simplicidade, sem migracao
- Contras: Chave composta pode ser menos ergonomica para integracoes

**Opcao B — Adicionar campo `codigo` ao pivot:**
Consistencia com padrao de codigo amigavel das demais entidades.

- Pros: Consistencia com padrao do projeto, chave unica simples
- Contras: Complexidade em PK composta, migracao necessaria, overhead de unicidade

**Opcao C — Sem codigo amigavel:**
Integracoes usam UUIDs diretamente.

- Pros: Nenhuma mudanca, UUIDs ja sao unicos
- Contras: UUIDs nao sao human-readable, dificulta importacao/exportacao manual

**Recomendacao:** Opcao A — manter simplicidade, adicionar campo `codigo` apenas se demanda concreta surgir.

**Resolucao:**

> **Decisao:** Opcao A — Expor `userId+tenantCode` concatenado
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** O pivot `tenant_users` e uma relacao N:N com PK composta — adicionar campo `codigo` proprio (opcao B) traz complexidade de unicidade desnecessaria. UUIDs puros (opcao C) sao impraticaveis para importacao/exportacao. A concatenacao `userId+tenantCode` e derivavel sem mudanca no schema, mantem simplicidade e pode ser evoluida para campo proprio no futuro se demanda concreta surgir.
> **Artefato de saida:** DATA-000 v0.5.0 (nota chave amigavel §7 tenant_users)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-004 — Storage: limite de arquivos por entidade~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **rastreia_para:** US-MOD-000-F16, FR-000, DATA-000, DOC-PADRAO-005
- **tags:** storage, limites, entity_type, configuracao
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** C

**Questao:**
Deve haver um limite de arquivos (attachments) por entidade? Se sim, configuravel por entity_type?

**Impacto:**
Performance (queries), custos de storage, UX

**Opcao A — Sem limite explicito:**
Confianca na paginacao e purge.

- Pros: Simplicidade, nenhuma restricao artificial
- Contras: Risco de abuso, queries lentas com muitos anexos por entidade

**Opcao B — Limite global (ex: 50 anexos por entidade):**
Limite unico aplicado a todas as entidades.

- Pros: Simples de implementar
- Contras: Pode ser restritivo demais para alguns tipos e permissivo demais para outros

**Opcao C — Limite configuravel por entity_type em DOC-PADRAO-005:**
Cada entity_type define seu proprio limite maximo de anexos.

- Pros: Flexivel — avatar pode ter limite 1, contratos podem ter 50. Governanca por padrao normativo
- Contras: Mais complexo, requer manutencao do catalogo de limites

**Recomendacao:** Opcao C — permite avatar ter limite 1, enquanto contratos podem ter 50.

**Acao sugerida:**

| Skill | Proposito | Quando executar |
|---|---|---|
| Edicao direta DOC-PADRAO-005 | Adicionar secao de limites de anexos por entity_type | Imediato (DRAFT) |

**Resolucao:**

> **Decisao:** Opcao C — Limite configuravel por entity_type em DOC-PADRAO-005
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Cada entity_type tem necessidades distintas de storage (avatar=1, contratos=50, documentos=20). Limite configuravel evita tanto o risco de abuso (opcao A) quanto a rigidez de um limite global (opcao B). O catalogo de limites em DOC-PADRAO-005 garante governanca centralizada e auditavel.
> **Artefato de saida:** DOC-PADRAO-005-C01 (amendment: limites max_attachments por entity_type, CON-005, Gate STR-6)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-005 — Status code divergente para token de reset expirado (BR-013 vs FR-017)~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** CONTRADICAO
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-013, FR-017, FR-000
- **tags:** status-code, token-reset, 422, api-contract
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
BR-013 define retorno `401` para token de reset expirado/usado, enquanto FR-017 define `422` com mensagem "Link expirado". Qual status code prevalece?

**Impacto:**
Contrato da API (codigo de status), consistencia de especificacao, testes de aceitacao.

**Opcao A — `422 Unprocessable Entity`:**
Semanticamente correto (a entidade "token" nao e processavel porque expirou). Consistente com a regra de que 401 e reservado para falha de autenticacao real (JWT/sessao). Alinhado com RFC 9457 §16.11.

- Pros: Semantica precisa; 401 reservado para falha de sessao/JWT; FR-017 ja define 422; alinhado com RFC 9457
- Contras: Nenhum relevante

**Opcao B — `401 Unauthorized`:**
Indica que o token nao e mais uma credencial valida.

- Pros: Simples; indica credencial invalida
- Contras: Confunde com falha de sessao/JWT; semanticamente impreciso (token de reset nao e credencial de autenticacao)

**Opcao C — `410 Gone`:**
O recurso (token) existiu mas nao existe mais.

- Pros: Semantica precisa
- Contras: Pouco convencional para APIs REST modernas; pode confundir clientes

**Recomendacao:** Opcao A (`422`) — manter o que FR-017 ja define. Atualizar BR-013 para `422` e alinhar Gherkin.

**Acao sugerida:**

| Skill | Proposito | Quando executar |
|---|---|---|
| `/create-amendment BR-013 tipo=C` | Alterar 401→422 nos cenarios de token expirado e token usado | Imediato (DRAFT) |

**Resolucao:**

> **Decisao:** Opcao A — `422 Unprocessable Entity` para token de reset expirado/usado
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** 422 e semanticamente correto — o token nao e processavel porque expirou, nao e falha de autenticacao. O codigo 401 deve ser reservado exclusivamente para falha de sessao/JWT real, evitando ambiguidade no contrato da API. FR-017 ja define 422, portanto BR-013 deve ser corrigido para alinhar. Alinhado com RFC 9457 §16.11.
> **Artefato de saida:** BR-000 v0.6.0 (BR-013: regra, exemplo e Gherkin atualizados — 401→422 com problem types `/problems/token-expired` e `/problems/token-used`)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-006 — Migracao de scopes 2-segmentos → 3-segmentos em SEC-000, SEC-002 e DATA-000~~

- **status:** IMPLEMENTADA
- **dominio:** SEC/DATA
- **tipo:** CONTRADICAO
- **origem:** ENRICH (AGN-DEV-11 findings E2, E3, E4)
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** SEC-000 §2, SEC-002, DATA-000
- **tags:** scopes, 3-segmentos, migracao, consistencia
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** A

**Questao:**
DOC-FND-000 v1.2.0 (2026-03-17) migrou o formato canonico de scopes para 3 segmentos (`dominio:entidade:acao`). DATA-003 e BR-005 ja foram alinhados, mas SEC-000 §2, SEC-002 (emit_perm) e DATA-000 (CHECK constraint de role_permissions) ainda usam formato antigo de 2 segmentos.

**Impacto:**
Consistencia cruzada entre artefatos, validacao de IDs no CI (EX-CI-007), testes de integracao.

**Opcao A — Atualizar em cascata para 3-seg:**
Atualizar SEC-000, SEC-002 e DATA-000 em cascata para 3-seg — consistencia total, requer re-execucao de AGN-DEV-04 e AGN-DEV-06.

- Pros: Consistencia total com DOC-FND-000 v1.2.0, padrao canonico unico
- Contras: Requer re-execucao de 2 agentes

**Opcao B — Manter retrocompatibilidade:**
Regex aceita 2 ou 3 seg (`{1,2}`) e considerar ambos validos durante transicao.

- Pros: Zero mudanca imediata
- Contras: Divergencia permanente, complexidade de validacao, debt tecnico

**Recomendacao:** Opcao A — atualizar em cascata. BR-005 ja define o regex com `{1,2}` para aceitar ambos, mas o padrao canonico e 3-seg.

**Resolucao:**

> **Decisao:** Opcao A — Atualizar SEC-000, SEC-002 e DATA-000 em cascata para formato 3-segmentos
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Consistencia total com DOC-FND-000 v1.2.0. O padrao canonico e 3-seg; manter retrocompatibilidade apenas adicionaria complexidade desnecessaria. DATA-003 e BR-005 ja estao alinhados.
> **Artefato de saida:** SEC-000 v0.3.0, SEC-002 v0.4.0, DATA-000 v0.4.0
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-007 — Scopes de Storage nao registrados em DOC-FND-000 §2.2~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** LACUNA
- **origem:** VALIDATE (AGN-DEV-11)
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-11
- **rastreia_para:** DOC-FND-000, SEC-000
- **tags:** scopes, storage, 3-segmentos, catalogo
- **dependencias:** [PENDENTE-006]
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** A

**Questao:**
SEC-000 §2 lista scopes `storage:upload` e `storage:read` no catalogo do Foundation, mas estes scopes **nao existem** no catalogo canonico DOC-FND-000 §2.2 (que e a fonte de verdade). Devem ser registrados formalmente ou removidos?

**Impacto:**
Gate 3 (DOC-ARC-003B) — CI DEVE falhar se encontrar scope nao registrado. Screen manifests que referenciarem estes scopes serao rejeitados.

**Opcao A — Registrar como scopes fundacionais 3-seg:**
Registrar `storage:upload` e `storage:read` em DOC-FND-000 §2.2 como scopes fundacionais (formato 3-seg: `storage:file:upload`, `storage:file:read`).

- Pros: Consistencia total com padrao 3-seg, storage tratado como dominio proprio
- Contras: Requer atualizar DOC-FND-000 e SEC-000

**Opcao B — Remover e derivar do scope da entidade:**
Remover de SEC-000 e tratar upload como operacao derivada do scope da entidade proprietaria (ex: `users:user:write` permite upload de avatar).

- Pros: Menos scopes no catalogo
- Contras: Perde granularidade, dificuldade de auditoria de operacoes de storage

**Opcao C — Registrar como scopes genericos 2-seg:**
Registrar como scopes genericos 2-seg (`storage:upload`, `storage:read`).

- Pros: Mais simples
- Contras: Diverge do padrao 3-seg ja adotado

**Recomendacao:** Opcao A — registrar com formato 3-seg. Storage e funcionalidade transversal do Foundation e merece scopes dedicados no catalogo canonico.

**Acao sugerida:**

| Skill | Proposito | Quando executar |
|---|---|---|
| Edicao direta DOC-FND-000 §2.2 | Adicionar `storage:file:upload` e `storage:file:read` ao catalogo canonico | Imediato (DRAFT) |
| `/create-amendment SEC-000 tipo=C` | Alinhar scopes storage para formato 3-seg no catalogo do modulo | Apos edicao DOC-FND-000 |

**Resolucao:**

> **Decisao:** Opcao A — Registrar `storage:file:upload` e `storage:file:read` em DOC-FND-000 §2.2 como scopes fundacionais 3-seg
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Storage e funcionalidade transversal do Foundation. Scopes dedicados no formato canonico 3-seg garantem consistencia com PENDENTE-006 (migracao 3-seg ja implementada) e passam Gate 3 (DOC-ARC-003B). Opcao B perde granularidade; Opcao C diverge do padrao.
> **Artefato de saida:** DOC-FND-000 v1.3.0 (§2.2 — `storage:file:upload`, `storage:file:read`)
> **Implementado em:** 2026-03-18

---

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-20 e identificou 5 pendencias (PENDENTE-008 a 012) no dominio UX (screen manifests). Todas foram resolvidas em 2026-03-22: manifests reescritos para schema v1, module corrigido, Screen IDs padronizados, 4 novos manifests criados. O `/validate-all` foi re-executado em 2026-03-22 com resultado PASS: 29/29 manifests validos, 5/5 manifests proprios MOD-000 aprovados em todos os 5 pilares (EX-UX-001..005). Fase 3 CONCLUIDA.

> **Decision tree de validacao:**
>
> ```
> Quero validar tudo de uma vez?
> ├── SIM → /validate-all (orquestra todos, pula os que nao tem artefato)
> └── NAO → Qual pilar?
>     ├── Sintaxe/links/metadados → /qa
>     ├── Screen manifests       → /validate-manifest
>     ├── Contratos OpenAPI      → /validate-openapi
>     ├── Schemas Drizzle        → /validate-drizzle
>     └── Endpoints Fastify      → /validate-endpoint
> ```

#### Pendentes da Fase 3 — Resolvidas (2026-03-22)

> 5 pendencias UX identificadas pelo `/validate-all` (2026-03-20/22). Todas resolvidas em 2026-03-22. Detalhes completos em `pen-000-pendente.md`.

| # | ID | Severidade | Decisao | Artefato |
|---|---|---|---|---|
| 1 | PENDENTE-008 | CRITICA | Opcao A — Reescrita schema v1 | ux-usr-001/002/003 v2.0.0 |
| 2 | PENDENTE-009 | ALTA | Opcao A — Corrigir MOD-001→MOD-000 | ux-auth-001 v1.1.0 |
| 3 | PENDENTE-010 | MEDIA | Opcao A — Padronizar UX-USR- | UX-000 v0.3.0 |
| 4 | PENDENTE-011 | MEDIA | Opcao A — Manter unificado + MFA | UX-000 v0.3.0, ux-auth-001 v1.1.0 |
| 5 | PENDENTE-012 | ALTA | Opcao A — Criar 4 manifests | ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 v1.0.0 |

#### Re-executar validacao apos resolucao das pendencias

```
5    /validate-all docs/04_modules/mod-000-foundation/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos Spectral — se existirem)
                             4. /validate-drizzle (schemas Drizzle — se existirem)
                             5. /validate-endpoint (handlers Fastify — se existirem)
                           Skills 3-5 sao executadas condicionalmente: se os
                           artefatos de codigo ainda nao existem, /validate-all
                           pula o validador e reporta "N/A — artefato ausente".
                           Pre-condicao: PENDENTE-008 a 012 resolvidas
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais quando quiser focar em um pilar:

```
5a   /qa docs/04_modules/mod-000-foundation/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-auth-001.login.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-auth-001.login.yaml (corrigido PENDENTE-009)
                           - ux-usr-001.users-list.yaml (reescrito PENDENTE-008)
                           - ux-usr-002.user-form.yaml (reescrito PENDENTE-008)
                           - ux-usr-003.user-invite.yaml (reescrito PENDENTE-008)
                           - ux-dash-001.main.yaml
                           - ux-shell-001.app-shell.yaml
                           - ux-auth-003.sessions.yaml (novo PENDENTE-012)
                           - ux-role-001.roles-list.yaml (novo PENDENTE-012)
                           - ux-tenant-001.tenants-list.yaml (novo PENDENTE-012)
                           - ux-tenant-002.tenant-users.yaml (novo PENDENTE-012)
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions vs DOC-FND-000 §2

5c   /validate-openapi apps/api/openapi/v1.yaml
                           Validar contratos OpenAPI referenciados:           FUTURO (pos-codigo)

5d   /validate-drizzle apps/api/src/modules/foundation/schema.ts
                           Validar schemas Drizzle:                          FUTURO (pos-codigo)

5e   /validate-endpoint apps/api/src/modules/foundation/routes/auth.route.ts
                           Validar endpoints Fastify:                        FUTURO (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (manifests existem) | SIM — CONCLUIDO | ux-auth-001, ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 (MOD-000) + ux-usr-001/002/003 (MOD-002) |
| 3 | `/validate-openapi` | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | apps/api/openapi/v1.yaml (nao existe) |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | apps/api/src/modules/foundation/schema.ts (nao existe) |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | apps/api/src/modules/foundation/routes/ (nao existe) |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-000-foundation/
                           Selar mod-000 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (12/12 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all 2026-03-22 PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (5/5 manifests PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.10.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios recebidos)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover epico DRAFT→READY (ja READY)
                             Step 3: Promover features em lotes (ja READY)
                             Step 4: /qa (pos-check)
                             Step 5: /update-index
                             Step 6: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

#### Bloqueadores para Promocao

Todos os bloqueadores foram resolvidos em 2026-03-22:

1. ~~**PENDENTE-008 (CRITICA):**~~ IMPLEMENTADA — manifests ux-usr-001/002/003 reescritos para schema v1 (v2.0.0).
2. ~~**PENDENTE-009 (ALTA):**~~ IMPLEMENTADA — ux-auth-001 module corrigido para MOD-000.
3. ~~**PENDENTE-010 (MEDIA):**~~ IMPLEMENTADA — Screen IDs padronizados UX-USR em UX-000.
4. ~~**PENDENTE-011 (MEDIA):**~~ IMPLEMENTADA — Login+Forgot unificados em UX-AUTH-001.
5. ~~**PENDENTE-012 (ALTA):**~~ IMPLEMENTADA — 4 manifests criados (ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002). Cobertura: 5/5 telas com manifest.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-000-foundation/requirements/fr/FR-000.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-000 melhoria "adicionar endpoint restore"
                           Criar amendment formal:                           SOB DEMANDA
                           Ex: BR-000-M01.md (melhoria)
                           Ex: SEC-000-C01.md (correcao)
                           Preserva documento base intacto
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md

13   /merge-amendment docs/04_modules/mod-000-foundation/amendments/sec/DOC-FND-000-M04.md
                           Aplicar amendment no documento base:              SOB DEMANDA
                           Gate 1: Amendment APPROVED ou DRAFT (com confirmacao)
                           Gate 2: Documento base existe
                           Gate 3: Dependencias cross-modulo (DEPENDENCY-GRAPH.md §3)
                           Gate 4: Stale detection (versao do base mudou?)
                           Gate 5: Amendments concorrentes para mesmo base
                           Pos-condicao: Base bumped, amendment MERGED, CHANGELOG atualizado
```

#### Amendments Existentes

| Amendment | Natureza | Contexto | Criado |
|-----------|----------|----------|--------|
| DOC-PADRAO-005-C01 | Correcao | Limites de anexos configuraveis por entity_type — resolve PENDENTE-004 (max_attachments, CON-005, Gate STR-6) | 2026-03-18 (pre-READY) |
| DOC-FND-000-M01 | Melhoria | 6 scopes `process:case:*` registrados em DOC-FND-000 §2.2 para MOD-006 | 2026-03-19 (pre-READY) |
| DOC-FND-000-M02 | Melhoria | 7o scope `process:case:reopen` em DOC-FND-000 §2.2 — complementa M01 | 2026-03-19 (pre-READY) |
| DOC-FND-000-M03 | Melhoria | 7 scopes `approval:*` para MOD-009 (Movimentos sob Aprovacao) em DOC-FND-000 §2.2 | 2026-03-19 (pre-READY) |
| DOC-FND-000-M04 | Melhoria | 6 scopes `mcp:*` para MOD-010 (MCP e Automacao Governada) em DOC-FND-000 §2.2 | 2026-03-19 (pre-READY) |

> Todos os 5 amendments foram criados **antes** da promocao (pre-READY) — sao melhorias e correcoes integradas ao ciclo de enriquecimento. Nenhum amendment pos-READY existe ainda.

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-000
> ├── Criar nova pendencia     → /manage-pendentes create PEN-000
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-000 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-000 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-000 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-000 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-000
> ```

```
16   /manage-pendentes list PEN-000
                           Ciclo de vida completo de pendencias:              SOB DEMANDA

                           Convencao de nomenclatura:
                             PEN-000       = arquivo container (pen-000-pendente.md)
                             PENDENTE-NNN  = item individual (## PENDENTE-001 — ...)

                           SLA de resolucao por severidade:
                             BLOQUEANTE = 7 dias  (impede promocao, escalar imediatamente)
                             ALTA       = 14 dias (escalar ao owner apos 7 dias sem progresso)
                             MEDIA      = 30 dias (revisar na proxima sessao de planejamento)
                             BAIXA      = 90 dias (pode ser adiada, reavaliar se relevante)

                           Ciclo de vida do item:
                             ABERTA → EM_ANALISE → DECIDIDA → IMPLEMENTADA
                               │         │            │
                               └─────────┴────────────┴── CANCELADA (com motivo)

                           Intencoes disponiveis:
                             list     — Exibe Painel de Controle com contagem por status
                             create   — Cria item com classificacao automatica (dominio, tipo, severidade)
                                        Gera minimo 2 opcoes com pros/contras e recomendacao
                             analyze  — Le artefatos em rastreia_para, busca ADRs similares,
                                        enriquece opcoes com trade-offs tecnicos
                             decide   — Registra decisao (opcao escolhida + justificativa)
                                        Move status para DECIDIDA
                             implement— Identifica mecanismo (edicao direta se DRAFT,
                                        /create-amendment se READY, ADR se decisao arquitetural)
                                        Move status para IMPLEMENTADA
                             cancel   — Registra motivo, move para CANCELADA
                             report   — Emite relatorio: total, por severidade, por dominio,
                                        conformidade de SLA (dentro/proximo/vencido)

                           Integracao com DoR (Gate 0 do /promote-module):
                             DoR-1 bloqueia promocao se houver itens ABERTA ou EM_ANALISE.
                             Todos devem estar IMPLEMENTADA, DECIDIDA ou CANCELADA.

                           Estado atual MOD-000:
                             PEN-000: 12 itens total
                               12 IMPLEMENTADA (001-012) ← DoR-1 atendido
                               0 ABERTA
                             Todas as pendencias resolvidas em 2026-03-22
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | ALTA | SEC | Opcao B — SSO linking com senha nativa | ADR-004, FR-000 v0.7.0 |
| PENDENTE-002 | IMPLEMENTADA | ALTA | SEC | Opcao B — refresh token rotation | FR-000, SEC-000, DATA-003, SEC-002 |
| PENDENTE-003 | IMPLEMENTADA | BAIXA | DATA | Opcao A — userId+tenantCode concatenado | DATA-000 v0.5.0 |
| PENDENTE-004 | IMPLEMENTADA | MEDIA | ARC | Opcao C — limite anexos configuravel | DOC-PADRAO-005-C01 |
| PENDENTE-005 | IMPLEMENTADA | MEDIA | ARC | Opcao A — 422 para token reset expirado | BR-000 v0.6.0 |
| PENDENTE-006 | IMPLEMENTADA | — | SEC/DATA | Opcao A — migracao scopes 3-seg | SEC-000, SEC-002, DATA-000 |
| PENDENTE-007 | IMPLEMENTADA | ALTA | SEC | Opcao A — scopes storage 3-seg | DOC-FND-000 v1.3.0 |
| PENDENTE-008 | IMPLEMENTADA | CRITICA | UX | Opcao A — manifests reescritos schema v1 | ux-usr-001/002/003 v2.0.0 |
| PENDENTE-009 | IMPLEMENTADA | ALTA | UX | Opcao A — module corrigido MOD-001→MOD-000 | ux-auth-001 atualizado |
| PENDENTE-010 | IMPLEMENTADA | MEDIA | UX | Opcao A — Screen IDs padronizados UX-USR | UX-000 atualizado |
| PENDENTE-011 | IMPLEMENTADA | MEDIA | UX | Opcao A — Login+Forgot unificados em UX-AUTH-001 | ux-auth-001 v1.0.0 |
| PENDENTE-012 | IMPLEMENTADA | ALTA | UX | Opcao A — 4 manifests criados | ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 |

> Detalhamento completo: resolvidas em [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo) | abertas em [Fase 3](#pendentes-da-fase-3--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-000): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-000

```
US-MOD-000 (READY v0.9.0)              ← Fase 0: CONCLUIDA
  │  17/17 features READY
  ▼
mod-000-foundation/ (stubs DRAFT)       ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-000 enriquecido (DRAFT v0.10.0)     ← Fase 2: CONCLUIDA (11 agentes, 7 PENDENTEs resolvidas)
  │
  ├── /validate-all executado 2026-03-20 → 5 PENDENTEs identificadas (008-012)
  │     ├── PENDENTE-008 a 012 IMPLEMENTADAS em 2026-03-22
  │     └── Manifests criados/reescritos: auth-001, auth-003, role-001, tenant-001, tenant-002
  │
  ├── /validate-all re-executado 2026-03-22 (pos-correcoes)
  │     ├── /qa .................. PASS (lint:docs OK, validate:manifests 29/29)
  │     ├── /validate-manifest ... PASS (5/5 manifests MOD-000 aprovados)
  │     ├── /validate-openapi .... FUTURO (pos-codigo)
  │     ├── /validate-drizzle .... FUTURO (pos-codigo)
  │     └── /validate-endpoint ... FUTURO (pos-codigo)
  │
  ├── 12/12 PENDENTEs IMPLEMENTADA — DoR-1 atendido
  │
  ▼
mod-000 validado (DRAFT)                ← Fase 3: CONCLUIDA (0 pendencias ABERTAS, 29/29 manifests PASS)
  │
  ├── ★ PROXIMO PASSO: executar /promote-module
  ├── Gate 0 (DoR): 7/7 atendidos
  │
  ▼
mod-000 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ├── /create-amendment ← se precisar alterar base READY
  ├── /merge-amendment  ← para aplicar amendment aprovado (Gates 4-5: stale + conflitos)
  │
  ▼
mod-000 + amendments/                   ← Fase 5: SOB DEMANDA (5 amendments pre-READY existem)

MOD-000 e pre-requisito de TODOS os demais modulos.
Promover MOD-000 desbloqueia a cadeia MOD-001..011 (camada topologica 0).
BLK-001: MOD-002 depende de amendment F05 (users_invite_resend) em MOD-000.
```

---

## Particularidades do MOD-000

| Aspecto | Detalhe |
|---------|---------|
| Modulo raiz (Foundation) | Nenhuma dependencia upstream. Todos os 11 modulos (MOD-001 a MOD-011) dependem diretamente de MOD-000. Promover MOD-000 e pre-requisito para desbloquear toda a cadeia de implementacao. |
| Nivel 2 — DDD-lite + Clean Completo | Score 6/6 nos gatilhos DOC-ESC-001 §4.2. Complexidade intrinseca alta: auth, RBAC multi-tenant, SSO, MFA, audit, domain events com sensitivity_level. Requer minimo 3 ADRs (tem 4). |
| Alto volume de amendments pre-READY | 5 amendments criados antes da promocao (DOC-FND-000-M01 a M04 + DOC-PADRAO-005-C01). Isso indica que o modulo e altamente iterado — outros modulos (MOD-006, MOD-009, MOD-010) ja demandam extensoes no catalogo de scopes do Foundation. |
| Bloqueador de MOD-002 (BLK-001) | MOD-002 depende do endpoint `users_invite_resend` (POST /api/v1/users/:id/invite/resend) que foi adicionado em FR-006 (CHANGELOG v0.3.0). O BLK-001 pode ser resolvido pos-promocao. |
| Pendencias Fase 3 resolvidas | As 5 pendencias de UX (008-012) foram todas IMPLEMENTADAS em 2026-03-22. Manifests reescritos, module corrigido, Screen IDs padronizados, 4 novos manifests criados. Nucleo de requisitos e pilares tecnicos limpos desde a Fase 2. |
| Screen manifests com cobertura completa | 5 manifests YAML proprios do MOD-000: ux-auth-001 (login), ux-auth-003 (sessions), ux-role-001 (roles), ux-tenant-001 (tenants), ux-tenant-002 (tenant-users). Os manifests ux-usr-* pertencem a MOD-002 e os manifests ux-dash-001/ux-shell-001 a MOD-001. |

---

## Checklist Rapido — O que Falta para READY

- [x] Decidir e implementar PENDENTE-008 (CRITICA) — manifests ux-usr-001/002/003 reescritos schema v1 ✅
- [x] Decidir e implementar PENDENTE-009 (ALTA) — module corrigido em ux-auth-001 (MOD-000) ✅
- [x] Decidir e implementar PENDENTE-010 (MEDIA) — Screen IDs padronizados UX-USR em UX-000 ✅
- [x] Decidir e implementar PENDENTE-011 (MEDIA) — Login+Forgot unificados em UX-AUTH-001 ✅
- [x] Decidir e implementar PENDENTE-012 (ALTA) — 4 manifests criados (auth-003, role-001, tenant-001, tenant-002) ✅
- [x] Re-executar `/validate-all` no modulo — 29/29 manifests PASS, 0 violacoes ✅
- [ ] Executar `/promote-module docs/04_modules/mod-000-foundation/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 12 pendencias estao IMPLEMENTADA. Os 10 artefatos de requisitos (BR, FR, DATA, INT, SEC, NFR, PEN) estao enriquecidos e validos. As 4 ADRs atendem o minimo para Nivel 2. 5 screen manifests proprios do MOD-000 validados. Promover MOD-000 desbloqueia MOD-001 a MOD-011.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.3.0 | 2026-03-22 | Atualizacao: PENDENTE-008 a 012 IMPLEMENTADAS. Fase 3 CONCLUIDA (validate-all re-executado: 29/29 manifests PASS). Screen Manifests agora 5 proprios MOD-000. Checklist 6/7 concluido — falta apenas /promote-module. Proximo passo: promocao |
| 1.2.0 | 2026-03-22 | Atualizacao: PENDENTE-012 adicionada (5 screen manifests YAML ausentes). PENDENTEs total agora 12 (7 IMPLEMENTADA, 5 ABERTA: 008-012). Screen Manifests corrigido para refletir 1 manifest proprio MOD-000 (ux-auth-001). Bloqueadores atualizados, checklist expandido |
| 1.1.0 | 2026-03-22 | Melhoria: detalhamento completo de TODAS as 11 pendencias inline — resolvidas (001-007) na Fase 2 e abertas (008-011) na Fase 3. Questao, opcoes com pros/contras, recomendacao, acao sugerida e resolucao para cada item |
