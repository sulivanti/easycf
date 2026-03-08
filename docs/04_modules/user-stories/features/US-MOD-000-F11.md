# US-MOD-000-F11 — Endpoint GET /info (Versão e Metadados do Sistema)

**Status:** `READY`
**Data:** 2026-03-06
**Autor(es):** Arquitetura
**Módulo Destino:** **ECF Core** (Infraestrutura do Framework — `@easycf/core-api`)
**Referências Normativas:** DOC-PADRAO-001 §5 | DOC-ARC-001 | DOC-DEV-001 §4.1

## Metadados de Governança

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** DOC-PADRAO-001, DOC-ARC-001
- **nivel_arquitetura:** 0 (infraestrutura do framework — sem domínio de negócio)
- **referencias_exemplos:** `GET /health` em `packages/core-api/src/bootstrap/createApp.ts`
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*

---

## 1. Contexto e Problema

As US-033 a US-035 (Ajuda, Suporte, Sobre) foram classificadas como **UI/produto** e, portanto, **não pertencem ao MOD-000**. Ainda assim, o campo "versão do sistema" — tipicamente exibido em uma tela de *Sobre* — é uma informação de infraestrutura que o servidor deve expor.

O ECF já registra automaticamente um endpoint `GET /health` (heartbeat) em todo app criado com `createApp()`. O endpoint `GET /info` segue a mesma filosofia: infraestrutura fornecida **pelo framework**, não pelo módulo de negócio.

A versão a ser exposta é a versão do próprio **app hospedeiro** (ex: `apps/api`), resolvida via `process.env.npm_package_version`, variável injetada automaticamente pelo Node.js/pnpm ao inicializar com scripts `npm run dev` / `pnpm dev`.

---

## 2. A Solução (Linguagem de Negócio)

Como **desenvolvedor ou operador**, quero consultar a versão corrente do sistema em execução via um endpoint público e padronizado, sem necessidade de autenticação, para realizar verificações rápidas de deploy ou diagnóstico remoto.

### Contrato HTTP

```http
GET /info
```

**Resposta 200 OK:**

```json
{
  "name":        "minha-api",
  "version":     "1.2.3",
  "environment": "production",
  "timestamp":   "2026-03-06T22:25:00.000Z"
}
```

| Campo         | Origem                                             | Exemplo        |
|---------------|----------------------------------------------------|----------------|
| `name`        | `process.env.npm_package_name`                     | `"minha-api"`  |
| `version`     | `process.env.npm_package_version`                  | `"1.2.3"`      |
| `environment` | `process.env.NODE_ENV` (fallback: `"development"`) | `"production"` |
| `timestamp`   | `new Date().toISOString()` (momento da requisição) | ISO 8601       |

> **Nota:** `npm_package_name` e `npm_package_version` são injetados automaticamente pelo runtime Node.js a partir do `package.json` do app que executa o script. Não há leitura de arquivo em disco.

### Localização no Framework

O endpoint é registrado em `packages/core-api/src/routes/info.ts` como plugin Fastify (`fastify-plugin`) e registrado automaticamente em `createApp()`, ao lado de `GET /health`.

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Endpoint GET /info — Metadados Públicos do Sistema

  Cenário: Consulta bem-sucedida de metadados
    Dado que a API está em execução
    Quando GET /info é chamado sem autenticação
    Então o status deve ser 200
    E o corpo deve conter os campos: name, version, environment, timestamp
    E version deve corresponder ao campo "version" do package.json do app

  Cenário: Ambiente correto propagado
    Dado que NODE_ENV = "production"
    Quando GET /info é chamado
    Então environment deve ser "production"

  Cenário: Fallback quando NODE_ENV não definida
    Dado que NODE_ENV não está definida
    Quando GET /info é chamado
    Então environment deve ser "development"

  Cenário: Rota pública — sem autenticação
    Dado que a requisição não possui header Authorization nem cookie de sessão
    Quando GET /info é chamado
    Então o status deve ser 200 (nenhum 401 ou 403)
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Sem Autenticação (Público):** O endpoint é público por design, equivalente ao `GET /health`. Nenhum middleware de autenticação deve ser aplicado a esta rota.

2. **Sem Dados Sensíveis:** O endpoint **NÃO deve expor** caminhos internos, segredos, credenciais, DSN de banco, etc. Apenas `name`, `version`, `environment` e `timestamp`.

3. **Registro Automático pelo Framework:** O endpoint é registrado em `createApp()` sem opt-in ou configuração adicional do app hospedeiro. Consistente com o comportamento do `GET /health`.

4. **Não pertence ao MOD-000:** Esta feature é **infraestrutura do ECF** (nível 0), não autenticação/RBAC. Não deve ser colocada nas user stories do MOD-000 de negócio.

5. **`X-Correlation-ID`:** A resposta **deve** propagar o `X-Correlation-ID` (aplicado globalmente pelo middleware `correlationId` já registrado em `createApp()`). Nenhuma lógica adicional necessária na rota.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [x] Localização no framework definida: `packages/core-api/src/routes/info.ts`
- [x] Contrato HTTP documentado (seção 2).
- [x] Cenários Gherkin revisados (seção 3).
- [x] Confirmado: sem dados sensíveis na resposta.
- [x] Confirmado: sem autenticação necessária.

---

> ⚠️ **Atenção:** Por ser infraestrutura do framework (nível 0), esta US não requer aprovação do épico MOD-000 para ser implementada — ela pertence ao roadmap do `@easycf/core-api` diretamente.
