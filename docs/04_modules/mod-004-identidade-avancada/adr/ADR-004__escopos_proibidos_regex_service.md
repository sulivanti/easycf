> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-09  | Criação Batch 4 (enrich-agent) |

# ADR-004 — Validação de Escopos Proibidos em Delegação via Regex no Service

## Contexto

A regra BR-001.4 estabelece que delegações (`access_delegations`) NUNCA podem conter escopos com sufixo `:approve`, `:execute` ou `:sign`. Esta é uma regra inegociável de segregação de funções — impede que delegatees tomem decisões em nome do delegator.

O campo `delegated_scopes` é armazenado como `jsonb` (array de strings) no PostgreSQL. A questão é: onde e como validar que nenhum dos escopos no array corresponde ao padrão proibido?

## Decisão

**Validar `delegated_scopes` no service layer via regex `*:(approve|execute|sign)$`, rejeitando com 422 antes de qualquer persistência.**

O service itera sobre o array `delegated_scopes` e testa cada escopo contra o pattern:

```
/:(approve|execute|sign)$/
```

Se algum escopo corresponder, retorna 422: "Delegações não podem incluir escopos de aprovação, execução ou assinatura."

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **A) CHECK constraint com expressão jsonb no banco** | Enforcement no DB; impossível bypass | Expressões jsonb + regex em CHECK são complexas e não portáveis; difícil manter se novos sufixos forem adicionados; performance em CHECK com jsonb_array_elements |
| **B) Trigger BEFORE INSERT** no PostgreSQL | Enforcement no DB; lógica SQL centralizada | Triggers adicionam complexidade; difícil de testar unitariamente; mensagem de erro menos rica (exceção SQL genérica) |
| **C) Regex no service (escolhida)** | Simples; testável com Vitest; mensagem de erro clara RFC 9457; extensível (adicionar novos sufixos é uma mudança de regex); alinhada com padrão Nível 2 (domínio decide) | Sem enforcement no DB — bug no service poderia permitir escopo proibido; requer testes rigorosos |
| **D) Value Object `DelegatedScope` com validação** | DDD-puro; invariante no domínio; reusável | Mais código; mesma falta de enforcement no DB que Opção C |

## Consequências

- **Positivas:**
  - Implementação simples e direta no use case `CreateAccessDelegationUseCase`
  - Testável unitariamente (sem dependência de banco)
  - Mensagem de erro rica via RFC 9457, com lista dos escopos proibidos encontrados
  - Extensível: adicionar novos sufixos proibidos requer apenas alterar o regex
  - Alinhada com Nível 2: invariante de domínio validada no domínio/use case, não no banco

- **Negativas:**
  - Sem safety net no banco — se o service for bypassado (ex: migração manual, script de manutenção), escopos proibidos poderiam ser inseridos
  - Regex simples — não impede variações criativas (ex: `finance:invoice:Approve` — case sensitivity)

- **Mitigações:**
  - Regex case-insensitive ou `.toLowerCase()` antes da comparação
  - Testes unitários obrigatórios: (a) escopo proibido `:approve` rejeitado, (b) escopo proibido `:execute` rejeitado, (c) escopo proibido `:sign` rejeitado, (d) escopo permitido aceito
  - Validação de formato de escopo no Zod schema (NFR-001.1): regex `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$` garante lowercase
  - Domain event `identity.delegation_created` registra os escopos delegados para auditoria (DATA-003)
  - Opcionalmente: combinar com Value Object `DelegatedScope` (Opção D) como evolução futura

## Status

**ACEITA** — Derivada de BR-001.4 (regra inegociável) + alinhamento com padrão Nível 2

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-004, US-MOD-004-F02, BR-001.4, FR-001.3, DATA-001, SEC-001, NFR-001.7
- **referencias_exemplos:** N/A
- **evidencias:** BR-001.4 (regra inegociável), FR-001.3 (Gherkin cenário "Rejeitar escopo de aprovação")
