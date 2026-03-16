> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-15 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) |

# PENDENTE-000 — Questões Abertas do Foundation

---

## PENDENTE-001 — Estratégia de SSO User Provisioning quando e-mail já existe com senha nativa

- **Questão:** Quando um usuário faz login via SSO (Google/Microsoft) e o e-mail já está cadastrado com senha nativa, qual o comportamento? Vincular automaticamente? Exigir confirmação? Bloquear?
- **Impacto:** Segurança (account takeover risk), UX (experiência de primeiro login SSO)
- **Opções:**
  - **Opção A:** Vincular automaticamente se o e-mail do SSO provider bater — risco de account takeover se provider for comprometido
  - **Opção B:** Exigir que o usuário confirme via senha nativa antes de vincular SSO — mais seguro, pior UX
  - **Opção C:** Criar conta separada com flag SSO e deixar admin mesclar — complexidade operacional
- **Recomendação:** Opção B (confirmação via senha) — equilíbrio entre segurança e UX. Registrar decisão em ADR.

---

## PENDENTE-002 — Política de expiração de refresh tokens com remember_me

- **Questão:** O refresh token com `remember_me=true` tem TTL de 30 dias. Deve haver rotação de refresh token a cada uso (sliding window) ou TTL fixo desde a criação?
- **Impacto:** Segurança (janela de risco se token vazado), UX (frequência de re-login)
- **Opções:**
  - **Opção A:** TTL fixo de 30 dias desde criação — mais simples, janela de risco fixa
  - **Opção B:** Rotação a cada refresh (novo refresh_token emitido, antigo invalidado) — mais seguro, complexidade de implementação
  - **Opção C:** Sliding window (renova TTL a cada uso, max absoluto 90 dias) — melhor UX, mais complexo
- **Recomendação:** Opção B (rotação) — padrão de segurança recomendado por OAuth2 BCP.

---

## PENDENTE-003 — Granularidade do campo codigo em tenant_users

- **Questão:** O pivot `tenant_users` (PK composta userId+tenantId) não tem campo `codigo` próprio (conforme US-MOD-000-F09 §4.8). Se APIs externas precisarem referenciar um vínculo, qual chave amigável expor?
- **Impacto:** Integrações, APIs externas, importação/exportação
- **Opções:**
  - **Opção A:** Expor `userId+tenantCode` concatenado — sem mudança no schema
  - **Opção B:** Adicionar campo `codigo` ao pivot — consistência com padrão, mas complexidade em PK composta
  - **Opção C:** Sem código amigável — integrações usam UUIDs diretamente
- **Recomendação:** Opção A — manter simplicidade, adicionar campo `codigo` apenas se demanda concreta surgir.

---

## PENDENTE-004 — Storage: limite de arquivos por entidade

- **Questão:** Deve haver um limite de arquivos (attachments) por entidade? Se sim, configurável por entity_type?
- **Impacto:** Performance (queries), custos de storage, UX
- **Opções:**
  - **Opção A:** Sem limite explícito — confiança na paginação e purge
  - **Opção B:** Limite global (ex: 50 anexos por entidade) — simples, pode ser restritivo
  - **Opção C:** Limite configurável por entity_type em DOC-PADRAO-005 — flexível, mais complexo
- **Recomendação:** Opção C — permite avatar ter limite 1, enquanto contratos podem ter 50.

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-000, US-MOD-000-F03, US-MOD-000-F01, US-MOD-000-F09, US-MOD-000-F16, FR-000, SEC-000, INT-000
- **referencias_exemplos:** N/A
- **evidencias:** Lacunas identificadas durante enriquecimento dos pilares BR, FR, DATA, INT, SEC
