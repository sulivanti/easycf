> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.36.0 | 2026-03-24 | usuário       | PENDENTE-018→DECIDIDA→IMPLEMENTADA (Opção A — correção incremental 3 fases: format + lint:fix + refatoração errors) |
> | 0.34.0 | 2026-03-24 | validate-all  | Adição PENDENTE-018 — erros de lint pré-existentes do codegen (55 errors + 91 warnings, 19 módulos) |
> | 0.33.0 | 2026-03-24 | usuário       | PENDENTE-017→DECIDIDA→IMPLEMENTADA (Opção A — 8 test suites Vitest, 97 testes, fix import path error-handler) |
> | 0.31.0 | 2026-03-24 | usuário       | PENDENTE-016→IMPLEMENTADA (v1.yaml v1.4.0: 12 response schemas + GET /tenants/{id}) |
> | 0.30.0 | 2026-03-24 | usuário       | PENDENTE-015→IMPLEMENTADA (v1.yaml: IdempotencyKey component + $ref em 13 endpoints POST/PUT/PATCH) |
> | 0.28.0 | 2026-03-24 | usuário       | PENDENTE-016→DECIDIDA (Opção A — schemas completos com $ref em components/schemas para 12 success responses) |
> | 0.27.0 | 2026-03-24 | usuário       | PENDENTE-015→DECIDIDA (Opção A — IdempotencyKey como component parameter no OpenAPI) |
> | 0.26.0 | 2026-03-24 | usuário       | PENDENTE-014→DECIDIDA→IMPLEMENTADA (Opção A — correlationId nos DELETE handlers) |
> | 0.24.0 | 2026-03-23 | usuário       | PENDENTE-013→DECIDIDA→IMPLEMENTADA (Opção A — EntityNotFoundError em users/roles GET) |
> | 0.23.0 | 2026-03-23 | AGN-COD-VAL   | Adição PENDENTE-013 a 017 — findings de validação cruzada codegen (5 erros) |
> | 0.20.0 | 2026-03-22 | validate-all  | Adição PENDENTE-012 — 5 screen manifests YAML ausentes (UX-AUTH-003, UX-ROLE-001, UX-TENANT-001, UX-TENANT-002) |
> | 0.21.0 | 2026-03-22 | arquitetura   | PENDENTE-008→IMPLEMENTADA (manifests reescritos), P-009→IMPLEMENTADA (módulo corrigido), P-010→IMPLEMENTADA (Screen IDs), P-011→IMPLEMENTADA (unificação auth+MFA) |
> | 0.22.0 | 2026-03-22 | arquitetura   | PENDENTE-012→IMPLEMENTADA — 4 manifests criados (ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002) |
> | 0.19.0 | 2026-03-20 | validate-all  | Adição PENDENTE-011 — decisão unificação Login+Recuperação em UX-AUTH-001 vs split UX-AUTH-002 |
> | 0.18.0 | 2026-03-20 | validate-all  | Adição PENDENTE-010 — divergência Screen IDs UX-000 (UX-USER-xxx) vs manifests (UX-USR-xxx) |
> | 0.17.0 | 2026-03-20 | validate-all  | Adição PENDENTE-009 — ux-auth-001 atribuição módulo errada (MOD-001→MOD-000) |
> | 0.16.0 | 2026-03-20 | validate-all  | Adição PENDENTE-008 — manifests ux-usr-001/002/003 incompatíveis com schema v1 (reescrita) |
> | 0.15.0 | 2026-03-18 | Marcos Sulivan | Implementação PENDENTE-005 — BR-013 v0.6.0 (401→422 nos cenários token expirado/usado) |
> | 0.14.0 | 2026-03-18 | Marcos Sulivan | Decisão PENDENTE-005 opção A — 422 Unprocessable Entity para token de reset expirado |
> | 0.13.0 | 2026-03-18 | usuário     | Implementação PENDENTE-003 — DATA-000 §7 nota chave amigável tenant_users |
> | 0.12.0 | 2026-03-18 | usuário     | Decisão PENDENTE-003 opção A — expor userId+tenantCode concatenado (sem mudança schema) |
> | 0.11.0 | 2026-03-18 | usuário     | Implementação PENDENTE-004 — amendment DOC-PADRAO-005-C01 (max_attachments, CON-005, Gate STR-6) |
> | 0.10.0 | 2026-03-18 | usuário     | Decisão PENDENTE-004 opção C — limite de anexos configurável por entity_type (DOC-PADRAO-005) |
> | 0.9.0  | 2026-03-18 | usuário     | Decisão PENDENTE-002 opção B — rotação refresh token a cada uso (OAuth2 BCP) |
> | 0.8.0  | 2026-03-18 | AGN-DEV-09  | Implementação PENDENTE-001 — ADR-004 + FR-016 atualizado com fluxo Identity Linking SSO |
> | 0.7.0  | 2026-03-18 | usuário     | Implementação PENDENTE-007 — DOC-FND-000 §2.2 atualizado com scopes storage 3-seg |
> | 0.6.0  | 2026-03-18 | usuário     | Decisão PENDENTE-007 opção A — registrar scopes storage 3-seg em DOC-FND-000 §2.2 |
> | 0.5.0  | 2026-03-18 | usuário     | Decisão PENDENTE-001 opção B — confirmação via senha nativa antes de vincular SSO |
> | 0.4.0  | 2026-03-18 | usuário     | Implementação PENDENTE-006 — SEC-000, SEC-002, DATA-000 corrigidos para 3-seg |
> | 0.3.0  | 2026-03-18 | usuário     | Decisão PENDENTE-006 opção A — migração scopes 3-segmentos em cascata |
> | 0.2.0  | 2026-03-17 | AGN-DEV-10  | Adição PENDENTE-005/006/007 — findings de validação AGN-DEV-11 + divergência BR-013/FR-017 |
> | 0.1.0  | 2026-03-15 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) |

# PEN-000 — Questões Abertas do Foundation

---

## ~~PENDENTE-001 — Estratégia de SSO User Provisioning quando e-mail já existe com senha nativa~~

- **status:** IMPLEMENTADA ✅
- **severidade:** ALTA
- **domínio:** SEC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-000
- **rastreia_para:** US-MOD-000-F03, FR-000, SEC-000
- **tags:** SSO, account-linking, segurança
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** B

### Questão

Quando um usuário faz login via SSO (Google/Microsoft) e o e-mail já está cadastrado com senha nativa, qual o comportamento? Vincular automaticamente? Exigir confirmação? Bloquear?

### Impacto

Segurança (account takeover risk), UX (experiência de primeiro login SSO)

### Opções

**Opção A — Vinculação automática:**
Vincular automaticamente se o e-mail do SSO provider bater.

- Prós: UX fluida, zero fricção
- Contras: Risco de account takeover se provider for comprometido

**Opção B — Confirmação via senha nativa:**
Exigir que o usuário confirme via senha nativa antes de vincular SSO.

- Prós: Seguro contra account takeover, prova posse da conta existente
- Contras: Pior UX (exige passo extra no primeiro login SSO)

**Opção C — Conta separada + merge admin:**
Criar conta separada com flag SSO e deixar admin mesclar.

- Prós: Nenhum risco automático
- Contras: Complexidade operacional alta, duplicação de dados

### Recomendação

Opção B (confirmação via senha) — equilíbrio entre segurança e UX. Registrar decisão em ADR.

### Resolução

> **Decisão:** Opção B — Confirmação via senha nativa
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Prioriza segurança contra account takeover sem eliminar a funcionalidade SSO. O passo extra de confirmar senha nativa é aceitável na primeira vinculação — fluxo: SSO detecta e-mail existente → pede senha nativa → valida → vincula provider. Alinhado com boas práticas de identity linking (OWASP).
> **Artefato de saída:** ADR-004, FR-000 v0.7.0 (FR-016 atualizado)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-002 — Política de expiração de refresh tokens com remember_me~~

- **status:** IMPLEMENTADA ✅
- **severidade:** ALTA
- **domínio:** SEC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-000
- **rastreia_para:** US-MOD-000-F01, FR-001, FR-003, BR-002, SEC-000
- **tags:** refresh-token, rotação, OAuth2-BCP, segurança
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** B

### Questão

O refresh token com `remember_me=true` tem TTL de 30 dias. Deve haver rotação de refresh token a cada uso (sliding window) ou TTL fixo desde a criação?

### Impacto

Segurança (janela de risco se token vazado), UX (frequência de re-login)

### Opções

**Opção A — TTL fixo:**
TTL fixo de 30 dias desde criação.

- Prós: Mais simples de implementar, comportamento previsível
- Contras: Janela de risco fixa — token vazado permanece válido por até 30 dias

**Opção B — Rotação a cada refresh:**
Novo refresh_token emitido a cada uso, antigo invalidado imediatamente.

- Prós: Seguro — token vazado é detectado na próxima rotação (reuse detection), alinhado com OAuth2 BCP (RFC 6749 / draft-ietf-oauth-security-topics)
- Contras: Complexidade de implementação (token families, reuse detection, race conditions em múltiplas abas)

**Opção C — Sliding window:**
Renova TTL a cada uso com máximo absoluto de 90 dias.

- Prós: Melhor UX (usuário ativo nunca é deslogado), janela de risco reduzida
- Contras: Mais complexo, max absoluto ainda permite janelas longas

### Recomendação

Opção B (rotação) — padrão de segurança recomendado por OAuth2 BCP.

### Resolução

> **Decisão:** Opção B — Rotação a cada refresh (refresh token rotation)
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Padrão OAuth2 BCP. A cada POST /auth/refresh, o servidor emite novo refresh_token e invalida o anterior. Se o token antigo for reutilizado (reuse detection), toda a família de tokens é invalidada (kill-switch automático de sessão comprometida). Race conditions em múltiplas abas mitigadas com grace period de 10s para o token antigo.
> **Artefato de saída:** FR-000 v0.8.0 (FR-003 atualizado), SEC-000 v0.4.0, DATA-003 v0.8.0, SEC-002 v0.6.0
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-003 — Granularidade do campo codigo em tenant_users~~

- **status:** IMPLEMENTADA ✅
- **severidade:** BAIXA
- **domínio:** DATA
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-000
- **rastreia_para:** US-MOD-000-F09, DATA-000, INT-000
- **tags:** tenant_users, codigo, chave-amigável, integrações
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** A

### Questão

O pivot `tenant_users` (PK composta userId+tenantId) não tem campo `codigo` próprio (conforme US-MOD-000-F09 §4.8). Se APIs externas precisarem referenciar um vínculo, qual chave amigável expor?

### Impacto

Integrações, APIs externas, importação/exportação

### Opções

**Opção A — Expor `userId+tenantCode` concatenado:**
Sem mudança no schema. A chave amigável é derivada em runtime.

- Prós: Zero mudança em DDL, simplicidade, sem migração
- Contras: Chave composta pode ser menos ergonômica para integrações

**Opção B — Adicionar campo `codigo` ao pivot:**
Consistência com padrão de código amigável das demais entidades.

- Prós: Consistência com padrão do projeto, chave única simples
- Contras: Complexidade em PK composta, migração necessária, overhead de unicidade

**Opção C — Sem código amigável:**
Integrações usam UUIDs diretamente.

- Prós: Nenhuma mudança, UUIDs já são únicos
- Contras: UUIDs não são human-readable, dificulta importação/exportação manual

### Recomendação

Opção A — manter simplicidade, adicionar campo `codigo` apenas se demanda concreta surgir.

### Resolução

> **Decisão:** Opção A — Expor `userId+tenantCode` concatenado
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** O pivot `tenant_users` é uma relação N:N com PK composta — adicionar campo `codigo` próprio (opção B) traz complexidade de unicidade desnecessária. UUIDs puros (opção C) são impraticáveis para importação/exportação. A concatenação `userId+tenantCode` é derivável sem mudança no schema, mantém simplicidade e pode ser evoluída para campo próprio no futuro se demanda concreta surgir.
> **Artefato de saída:** DATA-000 v0.5.0 (nota chave amigável §7 tenant_users)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-004 — Storage: limite de arquivos por entidade~~

- **status:** IMPLEMENTADA ✅
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-000
- **rastreia_para:** US-MOD-000-F16, FR-000, DATA-000, DOC-PADRAO-005
- **tags:** storage, limites, entity_type, configuração
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** C

### Questão

Deve haver um limite de arquivos (attachments) por entidade? Se sim, configurável por entity_type?

### Impacto

Performance (queries), custos de storage, UX

### Opções

**Opção A — Sem limite explícito:**
Confiança na paginação e purge.

- Prós: Simplicidade, nenhuma restrição artificial
- Contras: Risco de abuso, queries lentas com muitos anexos por entidade

**Opção B — Limite global (ex: 50 anexos por entidade):**
Limite único aplicado a todas as entidades.

- Prós: Simples de implementar
- Contras: Pode ser restritivo demais para alguns tipos e permissivo demais para outros

**Opção C — Limite configurável por entity_type em DOC-PADRAO-005:**
Cada entity_type define seu próprio limite máximo de anexos.

- Prós: Flexível — avatar pode ter limite 1, contratos podem ter 50. Governança por padrão normativo
- Contras: Mais complexo, requer manutenção do catálogo de limites

### Recomendação

Opção C — permite avatar ter limite 1, enquanto contratos podem ter 50.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta DOC-PADRAO-005 | Adicionar seção de limites de anexos por entity_type | Imediato (DRAFT) |

### Resolução

> **Decisão:** Opção C — Limite configurável por entity_type em DOC-PADRAO-005
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Cada entity_type tem necessidades distintas de storage (avatar=1, contratos=50, documentos=20). Limite configurável evita tanto o risco de abuso (opção A) quanto a rigidez de um limite global (opção B). O catálogo de limites em DOC-PADRAO-005 garante governança centralizada e auditável.
> **Artefato de saída:** DOC-PADRAO-005-C01 (amendment: limites max_attachments por entity_type, CON-005, Gate STR-6)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-005 — Status code divergente para token de reset expirado (BR-013 vs FR-017)~~

- **status:** IMPLEMENTADA ✅
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-000
- **rastreia_para:** BR-013, FR-017, FR-000
- **tags:** status-code, token-reset, 422, api-contract
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

### Questão

BR-013 define retorno `401` para token de reset expirado/usado, enquanto FR-017 define `422` com mensagem "Link expirado". Qual status code prevalece?

### Impacto

Contrato da API (código de status), consistência de especificação, testes de aceitação.

### Opções

**Opção A — `422 Unprocessable Entity`:**
Semanticamente correto (a entidade "token" não é processável porque expirou). Consistente com a regra de que 401 é reservado para falha de autenticação real (JWT/sessão). Alinhado com RFC 9457 §16.11.

- Prós: Semântica precisa; 401 reservado para falha de sessão/JWT; FR-017 já define 422; alinhado com RFC 9457
- Contras: Nenhum relevante

**Opção B — `401 Unauthorized`:**
Indica que o token não é mais uma credencial válida.

- Prós: Simples; indica credencial inválida
- Contras: Confunde com falha de sessão/JWT; semanticamente impreciso (token de reset não é credencial de autenticação)

**Opção C — `410 Gone`:**
O recurso (token) existiu mas não existe mais.

- Prós: Semântica precisa
- Contras: Pouco convencional para APIs REST modernas; pode confundir clientes

### Recomendação

Opção A (`422`) — manter o que FR-017 já define. Atualizar BR-013 para `422` e alinhar Gherkin.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/create-amendment BR-013 tipo=C` | Alterar 401→422 nos cenários de token expirado e token usado | Imediato (DRAFT) |

### Resolução

> **Decisão:** Opção A — `422 Unprocessable Entity` para token de reset expirado/usado
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** 422 é semanticamente correto — o token não é processável porque expirou, não é falha de autenticação. O código 401 deve ser reservado exclusivamente para falha de sessão/JWT real, evitando ambiguidade no contrato da API. FR-017 já define 422, portanto BR-013 deve ser corrigido para alinhar. Alinhado com RFC 9457 §16.11.
> **Artefato de saída:** BR-000 v0.6.0 (BR-013: regra, exemplo e Gherkin atualizados — 401→422 com problem types `/problems/token-expired` e `/problems/token-used`)
> **Implementado em:** 2026-03-18

---

## PENDENTE-006 — Migração de scopes 2-segmentos → 3-segmentos em SEC-000, SEC-002 e DATA-000

- **status:** IMPLEMENTADA ✅
- **Questão:** DOC-FND-000 v1.2.0 (2026-03-17) migrou o formato canônico de scopes para 3 segmentos (`dominio:entidade:acao`). DATA-003 e BR-005 já foram alinhados, mas SEC-000 §2, SEC-002 (emit_perm) e DATA-000 (CHECK constraint de role_permissions) ainda usam formato antigo de 2 segmentos.
- **Impacto:** Consistência cruzada entre artefatos, validação de IDs no CI (EX-CI-007), testes de integração
- **Opções:**
  - **Opção A:** Atualizar SEC-000, SEC-002 e DATA-000 em cascata para 3-seg — consistência total, requer re-execução de AGN-DEV-04 e AGN-DEV-06
  - **Opção B:** Manter retrocompatibilidade — regex aceita 2 ou 3 seg (`{1,2}`) e considerar ambos válidos durante transição
- **Recomendação:** Opção A — atualizar em cascata. BR-005 já define o regex com `{1,2}` para aceitar ambos, mas o padrão canônico é 3-seg. Re-executar AGN-DEV-04 (DATA-000 CHECK) e AGN-DEV-06 (SEC-000 + SEC-002) com instrução de alinhar com DOC-FND-000 v1.2.0.
- **Artefatos a corrigir:** SEC-000 §2 (catálogo), SEC-002 (emit_perm), DATA-000 entidade 6 (regex CHECK)
- **Finding de origem:** AGN-DEV-11 findings E2, E3, E4
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** A

### Resolução

> **Decisão:** Opção A — Atualizar SEC-000, SEC-002 e DATA-000 em cascata para formato 3-segmentos
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Consistência total com DOC-FND-000 v1.2.0. O padrão canônico é 3-seg; manter retrocompatibilidade apenas adicionaria complexidade desnecessária. DATA-003 e BR-005 já estão alinhados.
> **Artefato de saída:** SEC-000 v0.3.0, SEC-002 v0.4.0, DATA-000 v0.4.0
> **Implementado em:** 2026-03-18

---

## PENDENTE-007 — Scopes de Storage não registrados em DOC-FND-000 §2.2

- **status:** IMPLEMENTADA ✅
- **severidade:** ALTA
- **domínio:** SEC
- **tipo:** LACUNA
- **origem:** VALIDATE
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-11
- **modulo:** MOD-000
- **rastreia_para:** DOC-FND-000, SEC-000
- **tags:** scopes, storage, 3-segmentos, catálogo
- **sla_data:** —
- **dependencias:** [PENDENTE-006]
- **decidido_em:** 2026-03-18
- **decidido_por:** usuário
- **opcao_escolhida:** A

### Questão

SEC-000 §2 lista scopes `storage:upload` e `storage:read` no catálogo do Foundation, mas estes scopes **não existem** no catálogo canônico DOC-FND-000 §2.2 (que é a fonte de verdade). Devem ser registrados formalmente ou removidos?

### Impacto

Gate 3 (DOC-ARC-003B) — CI DEVE falhar se encontrar scope não registrado. Screen manifests que referenciarem estes scopes serão rejeitados.

### Opções

**Opção A — Registrar como scopes fundacionais 3-seg:**
Registrar `storage:upload` e `storage:read` em DOC-FND-000 §2.2 como scopes fundacionais (formato 3-seg: `storage:file:upload`, `storage:file:read`).

- Prós: Consistência total com padrão 3-seg, storage tratado como domínio próprio
- Contras: Requer atualizar DOC-FND-000 e SEC-000

**Opção B — Remover e derivar do scope da entidade:**
Remover de SEC-000 e tratar upload como operação derivada do scope da entidade proprietária (ex: `users:user:write` permite upload de avatar).

- Prós: Menos scopes no catálogo
- Contras: Perde granularidade, dificuldade de auditoria de operações de storage

**Opção C — Registrar como scopes genéricos 2-seg:**
Registrar como scopes genéricos 2-seg (`storage:upload`, `storage:read`).

- Prós: Mais simples
- Contras: Diverge do padrão 3-seg já adotado

### Recomendação

Opção A — registrar com formato 3-seg. Storage é funcionalidade transversal do Foundation e merece scopes dedicados no catálogo canônico.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta DOC-FND-000 §2.2 | Adicionar `storage:file:upload` e `storage:file:read` ao catálogo canônico | Imediato (DRAFT) |
| `/create-amendment SEC-000 tipo=C` | Alinhar scopes storage para formato 3-seg no catálogo do módulo | Após edição DOC-FND-000 |

### Resolução

> **Decisão:** Opção A — Registrar `storage:file:upload` e `storage:file:read` em DOC-FND-000 §2.2 como scopes fundacionais 3-seg
> **Decidido por:** usuário em 2026-03-18
> **Justificativa:** Storage é funcionalidade transversal do Foundation. Scopes dedicados no formato canônico 3-seg garantem consistência com PENDENTE-006 (migração 3-seg já implementada) e passam Gate 3 (DOC-ARC-003B). Opção B perde granularidade; Opção C diverge do padrão.
> **Artefato de saída:** DOC-FND-000 v1.3.0 (§2.2 — `storage:file:upload`, `storage:file:read`)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-008 — Screen manifests ux-usr-001/002/003 incompatíveis com schema v1~~

- **status:** IMPLEMENTADA
- **severidade:** CRÍTICA
- **domínio:** UX
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE-ALL (Fase 3)
- **criado_em:** 2026-03-20
- **criado_por:** validate-all
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-22
- **modulo:** MOD-000
- **rastreia_para:** UX-000, DOC-UX-010, screen-manifest.v1.schema.json
- **tags:** screen-manifest, schema-v1, migração, reescrita
- **sla_data:** —
- **dependencias:** []

### Questão

Os 3 screen manifests de gestão de usuários (`ux-usr-001.users-list.yaml`, `ux-usr-002.user-form.yaml`, `ux-usr-003.user-invite.yaml`) foram escritos contra uma versão anterior/informal do formato e **nunca foram migrados** para o schema JSON v1 (`screen-manifest.v1.schema.json`). A divergência é estrutural — não se trata de campos faltantes isolados:

| Problema | Detalhe |
|---|---|
| 4 campos obrigatórios ausentes | `type`, `module`, `route`, `auth_required` |
| 6 campos extras (additionalProperties: false) | `manifest_version`, `entity_type`, `routes`, `permissions`, `ui_rules`, `error_mapping` |
| Formato `actions` incompatível | Usam `action`/`client_only`/`operation_ids`/`permission` em vez de `id`/`label`/`type`/`operation_id`/`requires_scope` |
| Formato `telemetry_defaults` incompatível | Usam `event_name`/`required_fields`/`propagate_headers` em vez de `package`/`include_tenant_id`/`propagate_correlation_id`/`capture_duration_ms` |

### Impacto

- Gate CI (`validate:manifests`) falha para os 3 manifests — bloqueador de promoção
- Screen manifests não podem ser consumidos por pipelines de geração de código
- 33 violações críticas reportadas na validação Fase 3

### Opções

**Opção A — Reescrita completa no formato schema v1:**
Migrar os dados semânticos (action_ids, scopes, operations — que estão corretos) para a estrutura canônica do schema v1.

- Prós: Resolução definitiva, passa Gate CI, habilita geração de código
- Contras: Trabalho manual significativo (3 manifests)

**Opção B — Evoluir o schema v1 para aceitar campos legados:**
Adicionar campos opcionais ao schema para retrocompatibilidade.

- Prós: Zero reescrita de manifests existentes
- Contras: Polui o schema com campos legados, divergência com normativos, debt permanente

### Recomendação

Opção A — reescrita. Os dados semânticos estão corretos; apenas a estrutura precisa ser migrada.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta manifests | Reescrever ux-usr-001/002/003 no formato schema v1, migrando dados semânticos | Imediato (DRAFT) |
| `/validate-all` | Re-validar após reescrita | Após correção |

### Resolução

> **Decisão:** Opção A — Reescrita completa no formato schema v1
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** 3 manifests reescritos para schema v1 (v2.0.0): campos obrigatórios (type, module, route, auth_required), ações tipadas (id/label/type/operation_id/requires_scope), telemetry_defaults padronizado, componentes detalhados. 33 violações resolvidas.
> **Artefato de saída:** ux-usr-001.users-list.yaml v2.0.0, ux-usr-002.user-form.yaml v2.0.0, ux-usr-003.user-invite.yaml v2.0.0
> **Implementado em:** 2026-03-22

---

## ~~PENDENTE-009 — ux-auth-001 com atribuição de módulo errada (MOD-001 → MOD-000)~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** UX
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE-ALL (Fase 3)
- **criado_em:** 2026-03-20
- **criado_por:** validate-all
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-22
- **modulo:** MOD-000
- **rastreia_para:** UX-000 §UX-001, US-MOD-000-F01, US-MOD-000-F02
- **tags:** screen-manifest, module-attribution, ux-auth-001
- **sla_data:** —
- **dependencias:** []

### Questão

O manifest `ux-auth-001.login.yaml` declara `module: "MOD-001"` e `linked_stories: ["US-MOD-001", "US-MOD-001-F01", "US-MOD-001-F02"]`, porém o fluxo de autenticação (Login/Logout/MFA) pertence ao **MOD-000 (Foundation)** conforme UX-000 §UX-001 e §UX-002, que rastreiam para `US-MOD-000-F01` e `US-MOD-000-F02`.

### Impacto

- Rastreabilidade cruzada módulo ↔ manifest quebrada
- Queries de cobertura por módulo excluem este manifest do MOD-000
- Pode causar conflito se MOD-001 tiver seus próprios manifests de auth

### Opções

**Opção A — Corrigir referências para MOD-000:**
Alterar `module: "MOD-000"`, header comment para "MOD-000 (Foundation)", e `linked_stories` para `["US-MOD-000", "US-MOD-000-F01", "US-MOD-000-F02"]`.

- Prós: Alinha com UX-000, corrige rastreabilidade
- Contras: Nenhum relevante

**Opção B — Manter MOD-001 e atualizar UX-000:**
Se a autenticação foi intencionalmente movida para MOD-001.

- Prós: Nenhum — contradiz a arquitetura documentada
- Contras: Foundation sem auth não faz sentido

### Recomendação

Opção A — corrigir o manifest. A autenticação é inequivocamente Foundation (MOD-000).

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta ux-auth-001 | Corrigir `module`, header e `linked_stories` | Imediato |

### Resolução

> **Decisão:** Opção A — Corrigir referências para MOD-000
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** Autenticação pertence inequivocamente ao Foundation (MOD-000). Manifest corrigido: `module: "MOD-000"`, header "MOD-000 (Foundation)", `linked_stories: ["US-MOD-000", "US-MOD-000-F01", "US-MOD-000-F02"]`.
> **Artefato de saída:** ux-auth-001.login.yaml v1.1.0
> **Implementado em:** 2026-03-22

---

## ~~PENDENTE-010 — Divergência de Screen IDs entre UX-000 e manifests (UX-USER vs UX-USR)~~

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** UX
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE-ALL (Fase 3)
- **criado_em:** 2026-03-20
- **criado_por:** validate-all
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-22
- **modulo:** MOD-000
- **rastreia_para:** UX-000 §UX-004, UX-000 §UX-005
- **tags:** screen-id, nomenclatura, rastreabilidade
- **sla_data:** —
- **dependencias:** [PENDENTE-008]

### Questão

UX-000 define Screen IDs com prefixo `UX-USER-` (ex: `UX-USER-001` para Gestão de Usuários, `UX-USER-002` para Perfil), enquanto os manifests usam prefixo `UX-USR-` (ex: `UX-USR-001`, `UX-USR-002`, `UX-USR-003`). Além da divergência de nomenclatura, há conflito semântico: UX-000 define `UX-USER-002` como "Perfil do Usuário" mas o manifest `ux-usr-002` é um "Formulário de Cadastro".

### Impacto

- Rastreabilidade UX-000 ↔ manifests quebrada
- Ambiguidade sobre qual tela cada Screen ID representa
- Validações cruzadas falham por não encontrar correspondência

### Opções

**Opção A — Padronizar em UX-USR- (curto):**
Atualizar UX-000 para usar `UX-USR-001/002/003` e ajustar a semântica (001=list, 002=form, 003=invite).

- Prós: Consistente com manifests existentes e padrão de nomes curtos (`AUTH`, `USR`, `ORG`)
- Contras: Requer atualizar UX-000

**Opção B — Padronizar em UX-USER- (longo):**
Renomear manifests para `ux-user-001/002/003` e alinhar com UX-000.

- Prós: Consistente com UX-000 atual
- Contras: Requer renomear 3 manifests e atualizar todas as referências

**Opção C — Manter ambos com mapeamento explícito:**
Documentar equivalência `UX-USER-xxx ↔ UX-USR-xxx` em UX-000.

- Prós: Nenhuma mudança de arquivo
- Contras: Complexidade desnecessária, debt de nomenclatura permanente

### Recomendação

Opção A — padronizar em `UX-USR-` (curto). Alinhado com padrão dos demais domínios (`AUTH`, `ORG`, `ROLE`, `TENANT`).

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta UX-000 | Atualizar Screen IDs para UX-USR-xxx e alinhar semântica | Após decisão |

### Resolução

> **Decisão:** Opção A — Padronizar em UX-USR- (curto)
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** UX-000 atualizado: UX-USER-001→UX-USR-001 (UX-004, listagem), UX-USER-002→UX-USR-004 (UX-005, perfil). Alinhado com padrão de nomes curtos (AUTH, USR, ORG, ROLE, TENANT). Semântica corrigida: UX-USR-001=list, UX-USR-002=form, UX-USR-003=invite.
> **Artefato de saída:** UX-000 v0.3.0
> **Implementado em:** 2026-03-22

---

## ~~PENDENTE-011 — Decisão sobre unificação Login + Recuperação de Senha em UX-AUTH-001~~

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** UX
- **tipo:** DEC-TEC
- **origem:** VALIDATE-ALL (Fase 3)
- **criado_em:** 2026-03-20
- **criado_por:** validate-all
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-22
- **modulo:** MOD-000
- **rastreia_para:** UX-000 §UX-001, UX-000 §UX-002, US-MOD-000-F01, US-MOD-000-F04
- **tags:** screen-manifest, auth, login, forgot-password, UX-AUTH
- **sla_data:** —
- **dependencias:** [PENDENTE-009]

### Questão

UX-000 define duas jornadas separadas com Screen IDs distintos:

- **UX-001 (UX-AUTH-001):** Login / Logout / MFA
- **UX-002 (UX-AUTH-002):** Recuperação de Senha (forgot + reset)

Porém o manifest `ux-auth-001.login.yaml` **unifica ambas** numa única rota `/login` com 3 painéis (login, forgot-password, reset-password). Também falta o fluxo MFA descrito em UX-001.

### Impacto

- Divergência entre spec (UX-000) e implementação declarada (manifest)
- Cobertura de telas: UX-AUTH-002 não tem manifest próprio
- Fluxo MFA sem representação em nenhum manifest

### Opções

**Opção A — Manter unificado e atualizar UX-000:**
Aceitar que login + recuperação vivem na mesma rota (SPA comum). Unificar UX-001/UX-002 em UX-000 sob `UX-AUTH-001`. Adicionar painel MFA ao manifest.

- Prós: Reflete UX real (SPAs frequentemente unificam auth flows na mesma rota), manifest já existe e funciona
- Contras: Requer atualizar UX-000, painel MFA precisa ser adicionado

**Opção B — Separar em dois manifests:**
Criar `ux-auth-002.forgot-password.yaml` e remover painéis forgot/reset do `ux-auth-001`.

- Prós: Consistente com UX-000 atual, Screen IDs 1:1 com manifests
- Contras: Na prática são a mesma rota SPA, separar pode ser artificial

**Opção C — Separar em três manifests:**
`ux-auth-001` (login+MFA), `ux-auth-002` (forgot), `ux-auth-003` (reset).

- Prós: Granularidade máxima, rastreabilidade precisa
- Contras: Over-engineering para fluxo simples, 3 manifests para 1 rota

### Recomendação

Opção A — manter unificado. Login + forgot + reset + MFA na mesma rota é padrão de mercado em SPAs. Atualizar UX-000 para refletir a unificação e adicionar painel MFA ao manifest.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta UX-000 | Unificar UX-001/UX-002 sob UX-AUTH-001 | Após decisão |
| Edição direta ux-auth-001 | Adicionar painel MFA (ação submit_mfa, endpoint /auth/mfa/verify) | Após decisão |

### Resolução

> **Decisão:** Opção A — Manter unificado e atualizar UX-000 + manifest
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** Login + forgot + reset + MFA na mesma rota `/login` é padrão SPA. UX-000 §UX-001 unificado com §UX-002. Manifest ux-auth-001 v1.1.0 atualizado: painel `mfa` adicionado, ação `submit_mfa` (POST /auth/mfa/verify), componente `MfaForm`.
> **Artefato de saída:** UX-000 v0.3.0 (unificação), ux-auth-001.login.yaml v1.1.0 (painel MFA)
> **Implementado em:** 2026-03-22

---

## ~~PENDENTE-012 — Screen manifests YAML ausentes para 5 telas definidas em UX-000~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** UX
- **tipo:** LACUNA
- **origem:** VALIDATE
- **criado_em:** 2026-03-22
- **criado_por:** validate-all
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-22
- **modulo:** MOD-000
- **rastreia_para:** UX-000 §UX-003, UX-000 §UX-006, UX-000 §UX-007, UX-000 §UX-008
- **tags:** screen-manifest, schema-v1, cobertura, lacuna
- **sla_data:** —
- **dependencias:** [PENDENTE-011]

### Questão

UX-000 define 8 Screen IDs para MOD-000 (UX-AUTH-001/002/003, UX-USER-001/002, UX-ROLE-001, UX-TENANT-001/002), mas apenas 1 manifest YAML existe para o módulo (`ux-auth-001.login.yaml`). Os manifests `ux-usr-*` pertencem a MOD-002. Faltam manifests para: UX-AUTH-003 (Gestão de Sessões/Kill-Switch), UX-ROLE-001 (Gestão de Roles/RBAC), UX-TENANT-001 (Gestão de Filiais) e UX-TENANT-002 (Vinculação Usuário-Filial). A existência de UX-AUTH-002 depende da decisão de PENDENTE-011 (unificar ou separar Login+Recuperação).

### Impacto

Sem manifests YAML, os gates de validação (`/validate-manifest`) não podem verificar conformidade de telas. A Fase 3 de validação fica incompleta para 5 das 8 telas do Foundation. Promoção para READY bloqueada enquanto cobertura de manifests for parcial.

### Opções

**Opção A — Criar os 4 manifests faltantes (mínimo):**
Criar `ux-auth-003.sessions.yaml`, `ux-role-001.roles-list.yaml`, `ux-tenant-001.tenants-list.yaml`, `ux-tenant-002.tenant-users.yaml`. UX-AUTH-002 depende de PENDENTE-011.

- Prós: Cobertura completa, habilita validação Fase 3 para todas as telas
- Contras: Esforço de criação (4 manifests)

**Opção B — Criar apenas os manifests de telas prioritárias:**
Criar primeiro `ux-role-001` e `ux-tenant-001` (telas de gestão core). Sessões e vinculação ficam para iteração seguinte.

- Prós: Progresso incremental, foca nas telas mais críticas
- Contras: Cobertura parcial persiste, Fase 3 incompleta

### Recomendação

Opção A — criar todos os 4 manifests. O Foundation é módulo raiz e todos os dependentes precisam dos contratos de tela estabilizados. UX-AUTH-002 fica pendente de PENDENTE-011.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| Criação direta dos YAML | Criar manifests v1 para as 4 telas | Após decisão |
| `/validate-manifest` | Validar cada manifest criado | Após criação |

### Resolução

> **Decisão:** Opção A — Criar os 4 manifests faltantes
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** Foundation é módulo raiz — cobertura completa de manifests é pré-requisito para promoção. UX-AUTH-002 não é necessário (PENDENTE-011 decidiu manter unificado em UX-AUTH-001). 4 manifests criados em schema v1 com scopes canônicos do DOC-FND-000 §2.2.
> **Artefato de saída:** ux-auth-003.sessions.yaml v1.0.0, ux-role-001.roles-list.yaml v1.0.0, ux-tenant-001.tenants-list.yaml v1.0.0, ux-tenant-002.tenant-users.yaml v1.0.0
> **Implementado em:** 2026-03-22

---

## ~~PENDENTE-013 — Endpoints GET retornam 404 vazio ao invés de RFC 9457 ProblemDetails~~

- **status:** IMPLEMENTADA ✅
- **severidade:** ALTA
- **domínio:** API
- **tipo:** BUG
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **modulo:** MOD-000
- **rastreia_para:** FR-013, EX-OAS-001
- **tags:** rfc-9457, error-handling, presentation
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-23
- **decidido_por:** usuário
- **opcao_escolhida:** A
- **justificativa_decisao:** Padrão DDD já adotado nos demais endpoints; error-handler centralizado garante RFC 9457
- **implementado_em:** 2026-03-23

### Questão

`GET /users/:id` (users.route.ts:88-89) e `GET /roles/:id` (roles.route.ts:87) retornam `reply.status(404).send()` com body vazio quando o recurso não é encontrado. O OpenAPI spec declara `ProblemDetails404` para esses endpoints. O response deveria ser um ProblemDetails completo com `type`, `title`, `status`, `detail` e `extensions.correlationId` conforme RFC 9457.

### Impacto

- Clientes da API recebem 404 sem body, impossibilitando tratamento programático do erro (sem `type` para categorizar)
- Contratos OpenAPI estão inconsistentes com a implementação real — ferramentas de geração de código (frontend) esperam `ProblemDetails` no body
- Auditoria e debugging prejudicados — sem `correlationId` no response, rastrear a causa no backend exige cruzamento manual de logs

### Opções

**Opção A — Lançar DomainError.NotFound no use case:**
O use case lança uma exceção tipada `DomainError.NotFound(entity, id, correlationId)`. O error-handler global do Fastify (já existente) serializa automaticamente para RFC 9457 ProblemDetails.

- Prós: Padrão DDD; centraliza formatação de erros; consistente com POST/PUT que já usam DomainError; zero lógica de formatação nas routes
- Contras: Nenhum relevante — o error-handler já suporta esse pattern

**Opção B — Formatar ProblemDetails diretamente na route:**
A route constrói o objeto ProblemDetails manualmente: `reply.status(404).send({ type: "/problems/not-found", title: "Not Found", ... })`.

- Prós: Explícito; não depende de infra de exceções
- Contras: Duplicação de lógica de formatação em cada route; diverge do padrão usado nos outros endpoints; risco de inconsistência no formato

**Opção C — Middleware Fastify de not-found automático:**
Criar um plugin Fastify `setNotFoundHandler` que intercepta qualquer 404 e injeta ProblemDetails.

- Prós: Captura inclusive 404 de rotas inexistentes
- Contras: Não tem acesso ao contexto de domínio (entity, id); genérico demais para erros de negócio; difícil propagar correlationId corretamente

### Recomendação

Opção A — lançar `DomainError.NotFound` no use case. É o padrão já adotado nos demais endpoints do Foundation (create, update) e garante formatação consistente via error-handler centralizado.

### Ação Sugerida

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta routes | Substituir `reply.status(404).send()` por `throw EntityNotFoundError(entity, id)` nos handlers de users e roles | Imediato |

### Resolução

> **Decisão:** Opção A — Lançar `EntityNotFoundError` no handler (error-handler centralizado serializa para RFC 9457)
> **Decidido por:** usuário em 2026-03-23
> **Justificativa:** Padrão DDD já adotado nos demais endpoints do Foundation; error-handler centralizado garante consistência RFC 9457
> **Artefato de saída:** users.route.ts:88-89, roles.route.ts:87
> **Implementado em:** 2026-03-23

---

## ~~PENDENTE-014 — DELETE endpoints sem correlationId quebrando audit trail~~

- **status:** IMPLEMENTADA ✅
- **severidade:** ALTA
- **domínio:** API
- **tipo:** BUG
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **modulo:** MOD-000
- **rastreia_para:** FR-013, DOC-ARC-003
- **tags:** correlation-id, audit-trail, presentation
- **sla_data:** —
- **dependencias:** []

### Questão

`DELETE /roles/:id` (roles.route.ts:143-154) e `DELETE /tenants/:tenantId/users/:userId` (tenants.route.ts:190-205) não extraem `x-correlation-id` do header e não propagam para use cases/repos. Isso quebra a cadeia de rastreabilidade E2E (DOC-ARC-003). Os demais endpoints mutantes (POST, PUT) já fazem a extração corretamente via `request.headers['x-correlation-id']`.

### Impacto

- Eventos de domínio emitidos pelo DELETE (`role.deleted`, `tenant_user.removed`) ficam sem `correlation_id`, impossibilitando rastreamento E2E
- Auditoria (`domain_events`) não consegue correlacionar a exclusão com a requisição HTTP original
- Gate CI DOC-ARC-003 pode falhar na validação de rastreabilidade em ciclos futuros de validate-all

### Opções

**Opção A — Extrair correlationId na route e passar ao use case:**
Mesmo padrão dos endpoints POST/PUT existentes: `const correlationId = request.headers['x-correlation-id']` e passa como parâmetro ao use case.

- Prós: Consistente com padrão existente; mudança localizada (2 arquivos); sem dependências extras
- Contras: Nenhum relevante

**Opção B — Middleware Fastify de extração automática:**
Criar um hook `onRequest` que injeta `request.correlationId` em todas as requisições automaticamente.

- Prós: Centralizado; novas routes herdam automaticamente
- Contras: Overhead para implementar agora; requer refactoring dos endpoints existentes que já extraem manualmente; mudança de maior escopo

### Recomendação

Opção A — extrair diretamente na route. É a correção mínima e consistente com o padrão já existente. A centralização via middleware (Opção B) pode ser feita como melhoria futura sem bloquear esta correção.

### Ação Sugerida

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição direta routes | Adicionar extração de `x-correlation-id` nos handlers DELETE de roles.route.ts e tenants.route.ts | Imediato |

### Resolução

> **Decisão:** Opção A — Extrair correlationId na route e passar ao use case
> **Decidido por:** usuário em 2026-03-24
> **Justificativa:** Correção mínima e consistente com o padrão POST/PUT já existente. Middleware centralizado (Opção B) pode vir como melhoria futura sem bloquear esta correção.
> **Artefato de saída:** roles.route.ts (DELETE handler), tenants.route.ts (DELETE /tenants/:id + DELETE /tenants/:tenantId/users/:userId)
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-015 — Idempotency-Key ausente do OpenAPI spec~~

- **status:** IMPLEMENTADA ✅
- **severidade:** MEDIA
- **domínio:** API
- **tipo:** LACUNA
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **modulo:** MOD-000
- **rastreia_para:** FR-001, FR-006, DOC-UX-010
- **tags:** idempotency, openapi, headers
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-24
- **decidido_por:** usuário
- **opcao_escolhida:** A

### Questão

O OpenAPI spec `v1.yaml` não documenta o header `Idempotency-Key` em nenhum endpoint de escrita (POST/PUT). O header está definido e usado no código (`common.dto.ts`, login use case), mas falta a declaração em `components/parameters` do spec e a referência nos paths relevantes (POST /auth/login, POST /users, POST /roles, etc.). Clientes gerados automaticamente não incluem o header, perdendo a proteção contra duplicação.

### Impacto

- Clientes SDK gerados a partir do spec não enviam `Idempotency-Key`, perdendo proteção contra requests duplicados
- Documentação da API incompleta — desenvolvedores de integrações não sabem que o header existe
- Validação EX-OAS-001 reporta divergência entre implementação e spec

### Opções

**Opção A — Declarar como parameter reutilizável em components:**
Criar `components/parameters/IdempotencyKey` com `in: header`, `required: false`, `schema: { type: string, format: uuid }` e referenciar em todos os endpoints POST/PUT.

- Prós: DRY; um ponto de definição; geração de código automática inclui o header; alinhado com padrão OpenAPI
- Contras: Nenhum relevante

**Opção B — Declarar inline em cada endpoint:**
Adicionar o parameter diretamente em cada path POST/PUT.

- Prós: Explícito por endpoint
- Contras: Duplicação massiva (10+ endpoints); difícil manter consistência; diverge do padrão já usado para `X-Correlation-ID`

### Recomendação

Opção A — declarar em `components/parameters` e referenciar via `$ref`. Consistente com o padrão já usado para `X-Correlation-ID` no mesmo spec.

### Ação Sugerida

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição v1.yaml | Adicionar `components.parameters.IdempotencyKey` e `$ref` em endpoints POST/PUT | Próximo ciclo |

### Resolução

> **Decisão:** Opção A — Declarar como parameter reutilizável em components
> **Decidido por:** usuário em 2026-03-24
> **Justificativa:** DRY, consistente com padrão existente para X-Correlation-ID, code-gen automático inclui o header sem intervenção manual
> **Artefato de saída:** apps/api/openapi/v1.yaml (components/parameters/IdempotencyKey + $ref em 13 endpoints)
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-016 — OpenAPI spec: 12 success responses sem body schema~~

- **status:** IMPLEMENTADA ✅
- **severidade:** MEDIA
- **domínio:** API
- **tipo:** LACUNA
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **modulo:** MOD-000
- **rastreia_para:** EX-OAS-001
- **tags:** openapi, schemas, code-generation
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-24
- **decidido_por:** usuário
- **opcao_escolhida:** A

### Questão

12 de 29 success responses no OpenAPI spec não definem body schema. Endpoints afetados: roles CRUD completo (GET list, GET by id, POST, PUT, DELETE), tenants CRUD (GET list, GET by id, POST, PUT), tenant-users CRUD (POST, DELETE), change-password (200) e reset-password (200). O code-gen frontend não consegue gerar tipos para esses responses.

### Impacto

- Geração de tipos TypeScript no frontend falha para 12 endpoints — desenvolvedores precisam tipar manualmente
- Contratos de API incompletos — não há garantia formal do formato de retorno
- Ferramentas de mock (MSW, Prism) não conseguem gerar mocks realistas para esses endpoints
- Validação EX-OAS-001 reporta 12 violações

### Opções

**Opção A — Adicionar schemas completos com $ref a components:**
Definir schemas reutilizáveis (`RoleResponse`, `TenantResponse`, `TenantUserResponse`, etc.) em `components/schemas` e referenciar nos responses.

- Prós: DRY; fonte única de verdade; code-gen completo; mocks automáticos
- Contras: Trabalho significativo (12 schemas); precisa alinhar com DTOs do código

**Opção B — Schema inline mínimo por endpoint:**
Adicionar `content.application/json.schema` inline em cada response, apenas com os campos essenciais.

- Prós: Rápido de implementar
- Contras: Duplicação; sem reutilização; difícil manter sincronizado com o código

**Opção C — Postergar e gerar schemas a partir dos DTOs do código:**
Usar uma ferramenta (zod-to-openapi ou similar) para gerar os schemas automaticamente a partir dos Zod schemas existentes no código.

- Prós: Fonte única de verdade no código; zero drift entre spec e implementação
- Contras: Requer setup de tooling; DTOs existentes podem não cobrir todos os campos do response

### Recomendação

Opção A — schemas em `components/schemas`. Os DTOs no código já definem a estrutura; basta espelhar. A Opção C é ideal a longo prazo mas requer setup que não justifica bloquear esta correção.

### Ação Sugerida

| Skill | Propósito | Quando executar |
|---|---|---|
| Edição v1.yaml | Criar schemas em `components/schemas` e referenciar nos 12 responses | Próximo ciclo |

### Resolução

> **Decisão:** Opção A — Adicionar schemas completos com $ref a components/schemas
> **Decidido por:** usuário em 2026-03-24
> **Justificativa:** DRY e fonte única de verdade. Os DTOs no código já definem a estrutura; espelhar em components/schemas garante code-gen completo, mocks automáticos e contratos formais. Opção C (zod-to-openapi) é ideal a longo prazo mas requer setup que não justifica bloquear esta correção.
> **Artefato de saída:** v1.yaml v1.4.0 — 12 response schemas em components/schemas (RoleCreateResponse, RoleListItem, PaginatedRoles, RoleDetailResponse, TenantCreateResponse, TenantListItem, PaginatedTenants, TenantDetailResponse, TenantUserAddResponse, TenantUserListItem, PaginatedTenantUsers) + GET /tenants/{id} endpoint adicionado
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-017 — Testes unitários e de integração ausentes~~

- **status:** IMPLEMENTADA ✅
- **severidade:** ALTA
- **domínio:** CODE
- **tipo:** LACUNA
- **origem:** AGN-COD-VAL (codegen)
- **criado_em:** 2026-03-23
- **criado_por:** AGN-COD-VAL
- **modulo:** MOD-000
- **rastreia_para:** DOC-GNP-00
- **tags:** tests, quality, ci
- **sla_data:** —
- **dependencias:** []
- **decidido_em:** 2026-03-24
- **decidido_por:** usuário
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-24

### Questão

Nenhum arquivo de teste encontrado para API (`apps/api/test/`) nem Web (`apps/web/src/**/__tests__/`). Os 69 arquivos gerados nas 6 camadas (routes, use cases, repos, schemas, hooks, pages) não possuem cobertura de testes. Sem testes, alterações futuras (bug fixes, refactorings) não têm rede de segurança.

### Impacto

- Zero cobertura de testes — qualquer mudança pode introduzir regressões silenciosas
- CI pipeline não valida lógica de negócio (apenas lint e type-check)
- Use cases críticos (login, refresh token rotation, RBAC check) não estão cobertos
- Endpoints de API sem testes de contrato — divergências entre spec e implementação passam despercebidas
- Hooks de auth no frontend sem testes — erros de autenticação podem travar a UX

### Opções

**Opção A — Testes por prioridade (críticos primeiro):**
Começar pelos use cases mais críticos: login, refresh, RBAC, error-handler. Depois expandir para routes, repos e hooks frontend. Usar Vitest para ambos API e Web.

- Prós: Cobre os cenários de maior risco primeiro; entregável incremental; rápido retorno de valor
- Contras: Cobertura parcial no curto prazo

**Opção B — Cobertura completa em batch:**
Gerar testes para todos os 69 arquivos de uma vez via codegen-agent, com meta de 80%+ de cobertura.

- Prós: Cobertura abrangente de uma vez
- Contras: Volume alto de código gerado; risco de testes frágeis/superficiais; ciclo de review longo

**Opção C — Apenas testes de contrato (API) + smoke tests (Web):**
Testes de contrato OpenAPI para os endpoints (validando req/res contra o spec) e smoke tests mínimos para as páginas do frontend.

- Prós: Detecta divergências spec/implementação; rápido de implementar
- Contras: Não cobre lógica de negócio interna; use cases sem validação

### Recomendação

Opção A — priorizar use cases críticos. O login flow, refresh token rotation e RBAC são os caminhos de maior risco. Após cobertura desses, expandir incrementalmente. A Opção C pode complementar como camada adicional.

### Ação Sugerida

| Skill | Propósito | Quando executar |
|---|---|---|
| Geração de testes | Criar testes Vitest para: login use case, refresh use case, RBAC middleware, error-handler, auth hooks | Próximo ciclo de codegen |
| Testes de contrato | Validar endpoints contra OpenAPI spec com Prism ou similar | Após PENDENTE-016 (schemas completos) |

### Resolução

> **Decisão:** Opção A — Testes por prioridade (críticos primeiro)
> **Decidido por:** usuário em 2026-03-24
> **Justificativa:** Priorizar use cases críticos (login, refresh token rotation, RBAC, error-handler) garante rede de segurança nos caminhos de maior risco com entrega incremental. Opção C pode complementar como camada adicional após PENDENTE-016.
> **Artefato de saída:** 8 test suites em `apps/api/test/foundation/` (domain-errors, scope.vo, user.entity, session.entity, role.entity, login.use-case, refresh-token.use-case, error-handler) + fix import path em error-handler.ts
> **Implementado em:** 2026-03-24

---

## PENDENTE-018 — ~~Erros de lint pré-existentes do codegen (ESLint + Prettier)~~

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **modulo:** MOD-000
- **rastreia_para:** DOC-PADRAO-002, DOC-ARC-002
- **tags:** lint, eslint, prettier, codegen, cross-module
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Código gerado pelo codegen (PKG-COD-001) não passa em `pnpm lint` nem `pnpm format:check`. Há 55 ESLint errors, 91 warnings e 441 arquivos com formatação Prettier divergente, distribuídos por 19 módulos. Isto viola DOC-PADRAO-002 §4.3 (regra MUST: todo código novo DEVE passar em `pnpm lint` sem erros antes de merge) e o gate `lint` do DOC-ARC-002.

### Impacto

- Gate `lint` do CI (DOC-ARC-002) falharia se ativado — bloqueia qualquer pipeline futuro
- 55 errors incluem 50× `react-hooks/set-state-in-effect` (cascading renders em produção)
- 91 warnings poluem output de lint, dificultando identificação de novos erros
- Formatação inconsistente em 441 arquivos dificulta code review e diffs

### Distribuição por módulo

| Módulo | Ocorrências | | Módulo | Ocorrências |
|---|---|---|---|---|
| web/identity-advanced | 16 | | web/mcp-automation | 7 |
| web/foundation | 13 | | web/movement-approval | 7 |
| web/contextual-params | 12 | | web/process-modeling | 7 |
| web/users | 10 | | api/foundation | 6 |
| web/org-units | 9 | | web/smartgrid | 6 |
| web/backoffice-admin | 7 | | web/case-execution | 5 |
| web/integration-protheus | 4 | | api/mcp | 3 |
| api/movement-approval | 3 | | api/org-units | 3 |
| api/case-execution | 2 | | api/identity-advanced | 2 |
| api/integration-protheus | 2 | | | |

### Detalhamento dos erros

**Errors (55):**

| Regra | Qtd | Descrição |
|---|---|---|
| `react-hooks/set-state-in-effect` | 50 | setState síncrono dentro de useEffect — causa cascading renders |
| `react/no-unescaped-entities` | 2 | Caracteres `'` `"` não escapados em JSX |
| impure function during render | 2 | Side-effects no corpo do componente React |
| variable before declaration | 1 | Variável usada antes de ser declarada |

**Warnings (91):**

| Regra | Qtd | Descrição |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | 78 | Imports/variáveis não utilizados |
| `@typescript-eslint/consistent-type-imports` | 7 | `import { X }` deveria ser `import type { X }` |
| `react-hooks/exhaustive-deps` | 6 | Dependências faltando em useEffect |

### Opções

**Opção A — Correção em 3 fases (incrementalista):**

1. `pnpm format` — corrige 441 arquivos automaticamente (0 risco)
2. `pnpm lint:fix` + remoção manual de unused imports/vars — elimina 91 warnings
3. Refatoração dos 55 errors React (extrair lógica de setState para callbacks/reducers)

- Prós: Baixo risco, cada fase é independente e reversível, progresso mensurável
- Contras: Fase 3 requer entendimento da lógica de cada componente

**Opção B — Fix em batch via codegen-agent:**

Criar um agente de lint-fix que percorre os 19 módulos automaticamente, aplicando padrões de correção conhecidos para cada regra.

- Prós: Velocidade, uniformidade de padrão
- Contras: Risco de correções mecânicas que quebram lógica; setState patterns podem variar

**Opção C — Relaxar regras temporariamente:**

Adicionar `eslint-disable` nos arquivos gerados e criar um backlog de correção por módulo.

- Prós: Desbloqueia CI imediatamente
- Contras: Dívida técnica acumulada, esconde problemas reais (cascading renders)

### Recomendação

Opção A — Correção incremental em 3 fases. As fases 1 e 2 são totalmente automatizáveis e eliminam 100% dos warnings + formatação. A fase 3 (55 errors) exige revisão por componente mas segue padrão repetitivo (extrair setState para callback pattern).

### Ação Sugerida

| Skill / Comando | Propósito | Quando executar |
|---|---|---|
| `pnpm format` | Fase 1: auto-formatação Prettier | Imediatamente |
| `pnpm lint:fix` | Fase 2: auto-fix warnings ESLint | Após fase 1 |
| Refatoração manual | Fase 3: corrigir 55 errors React hooks | Após fase 2, por módulo |

### Resolução

> **Decisão:** Opção A — Correção incremental em 3 fases (format + lint:fix + refatoração errors)
> **Decidido por:** usuário em 2026-03-24
> **Justificativa:** Fases 1 e 2 são automatizáveis com risco zero (Prettier + auto-fix ESLint). Fase 3 segue padrão repetitivo (extrair setState para callback). Não relaxar regras (Opção C) para não acumular dívida técnica. Batch via codegen-agent (Opção B) é arriscado em correções de lógica React.
> **Artefato de saída:** pnpm format + pnpm lint (0 errors, 0 warnings — 110→0 problems across 40+ arquivos)
> **Implementado em:** 2026-03-24

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-000, US-MOD-000-F01, US-MOD-000-F02, US-MOD-000-F03, US-MOD-000-F04, US-MOD-000-F05, US-MOD-000-F09, US-MOD-000-F16, FR-000, FR-013, FR-017, BR-013, SEC-000, SEC-002, INT-000, DATA-000, DOC-FND-000, DOC-ARC-003, UX-000, DOC-UX-010, EX-OAS-001, DOC-PADRAO-002, DOC-ARC-002
- **referencias_exemplos:** PKG-DEV-001 §12 (checagens mínimas AGN-DEV-11), DOC-FND-000 §2.1-§2.2 (scopes canônicos), DOC-ARC-003B (Gate 3), screen-manifest.v1.schema.json, PKG-COD-001 §4 (AGN-COD-VAL checklist), DOC-PADRAO-002 §4.3 (regras ESLint/Prettier)
- **evidencias:** PENDENTE-001 a 004: lacunas de enriquecimento pilares (2026-03-15). PENDENTE-005: divergência BR-013 vs FR-017 (status code). PENDENTE-006/007: findings AGN-DEV-11 validação cruzada (2026-03-17). PENDENTE-008 a 011: findings validate-all Fase 3 — screen manifests (2026-03-20). PENDENTE-013 a 017: findings AGN-COD-VAL codegen (2026-03-23). PENDENTE-018: erros lint pré-existentes do codegen (2026-03-24).
