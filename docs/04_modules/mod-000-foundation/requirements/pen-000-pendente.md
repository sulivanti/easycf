> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.15.0 | 2026-03-18 | Marcos Sulivan | Implementação PENDENTE-005 — BR-013 v0.6.0 (401→422 nos cenários token expirado/usado) |
| 0.14.0 | 2026-03-18 | Marcos Sulivan | Decisão PENDENTE-005 opção A — 422 Unprocessable Entity para token de reset expirado |
| 0.13.0 | 2026-03-18 | usuário     | Implementação PENDENTE-003 — DATA-000 §7 nota chave amigável tenant_users |
| 0.12.0 | 2026-03-18 | usuário     | Decisão PENDENTE-003 opção A — expor userId+tenantCode concatenado (sem mudança schema) |
| 0.11.0 | 2026-03-18 | usuário     | Implementação PENDENTE-004 — amendment DOC-PADRAO-005-C01 (max_attachments, CON-005, Gate STR-6) |
| 0.10.0 | 2026-03-18 | usuário     | Decisão PENDENTE-004 opção C — limite de anexos configurável por entity_type (DOC-PADRAO-005) |
| 0.9.0  | 2026-03-18 | usuário     | Decisão PENDENTE-002 opção B — rotação refresh token a cada uso (OAuth2 BCP) |
> | 0.8.0  | 2026-03-18 | AGN-DEV-09  | Implementação PENDENTE-001 — ADR-004 + FR-016 atualizado com fluxo Identity Linking SSO |
> | 0.7.0  | 2026-03-18 | usuário     | Implementação PENDENTE-007 — DOC-FND-000 §2.2 atualizado com scopes storage 3-seg |
> | 0.6.0  | 2026-03-18 | usuário     | Decisão PENDENTE-007 opção A — registrar scopes storage 3-seg em DOC-FND-000 §2.2 |
> | 0.5.0  | 2026-03-18 | usuário     | Decisão PENDENTE-001 opção B — confirmação via senha nativa antes de vincular SSO |
> | 0.4.0  | 2026-03-18 | usuário     | Implementação PENDENTE-006 — SEC-000, SEC-002, DATA-000 corrigidos para 3-seg |
| 0.3.0  | 2026-03-18 | usuário     | Decisão PENDENTE-006 opção A — migração scopes 3-segmentos em cascata |
| 0.2.0  | 2026-03-17 | AGN-DEV-10  | Adição PENDENTE-005/006/007 — findings de validação AGN-DEV-11 + divergência BR-013/FR-017 |
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

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-18
- **rastreia_para:** US-MOD-000, US-MOD-000-F03, US-MOD-000-F01, US-MOD-000-F04, US-MOD-000-F09, US-MOD-000-F16, FR-000, FR-017, BR-013, SEC-000, SEC-002, INT-000, DATA-000, DOC-FND-000
- **referencias_exemplos:** PKG-DEV-001 §12 (checagens mínimas AGN-DEV-11), DOC-FND-000 §2.1-§2.2 (scopes canônicos), DOC-ARC-003B (Gate 3)
- **evidencias:** PENDENTE-001 a 004: lacunas de enriquecimento pilares (2026-03-15). PENDENTE-005: divergência BR-013 vs FR-017 (status code). PENDENTE-006/007: findings AGN-DEV-11 validação cruzada (2026-03-17).
