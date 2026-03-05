# Padrões de Variáveis de Ambiente e Configuração

## 1. Visão Geral

Este documento estabelece o padrão arquitetural para gerenciamento e tipagem de variáveis de ambiente no ecossistema Node.js do projeto **EasyA1**, aplicável a todos os módulos e ambientes (desenvolvimento, homologação, testes e produção).

## 2. Separação de Preocupações (SoC)

As seguintes categorias de dados devem **obrigatória e exclusivamente** residir em variáveis de ambiente (arquivo `.env` em modo de desenvolvimento local, secret managers ou injetadas no container em produção):

- URLs base de integração (ex.: APIs externas, URL da própria API, domínio do front-end)
- Credenciais sensíveis (senhas de banco de dados, chaves de API, segredos de JWT)
- Strings de conexão de serviços como PostgreSQL, Redis, etc.
- Flags de ambiente puramente ligadas à infraestrutura ou depuração.
- **Configurações de Comunicação**: Chaves de API de serviços de e-mail (ex: `RESEND_API_KEY`).
- **Branding Dinâmico**: Variáveis que ditam a identidade visual nos templates de e-mail e UI (ex: `BRAND_NAME`, `BRAND_PRIMARY_COLOR`).
- **Integração SSO (Google/Microsoft)**: Configurações obrigatórias para que provedores de autenticação externa funcionem (ex: `SSO_GOOGLE_ENABLED`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URI`). Sempre adicione o esqueleto de novas variáveis de integração no `.env.example`.

*(Feature flags que ditam comportamentos de negócio granulares **não** devem estar em variáveis de ambiente globais, a menos que versem sobre disponibilidade de serviços de terceiros, ex: `SSO_GOOGLE_ENABLED`).*

## 3. Validação Rigorosa no Boot (Fail-Fast)

É imperativo que qualquer variável requerida pelo serviço seja validada durante a subida (boot) da aplicação.

- O projeto exige a verificação via schema Zod de todas as variáveis vitais no ponto de entrada (ex: `server.ts` ou num arquivo `env.ts` isolado).
- Caso o processo detecte ausência ou má-formatação em `process.env.NOME`, ele deve lançar uma exceção e encerrar a subida (`process.exit(1)`) imediatamente, ao invés de prosseguir de forma instável até apresentar erro em runtime retardado.

## 4. Problem Details e Conformidade RFC 9457

A arquitetura do Fastify adota a padronização das respostas de erro conforme a [RFC 9457 (Problem Details for HTTP APIs)](https://www.rfc-editor.org/rfc/rfc9457.html).

- O campo `type` retornado nesses JSONs de erro nunca deve ter um link "hardcoded" de produção (ex.: *não* usar `https://easya1.com/problems/bad-request` fixo no código fonte).
- **Em vez disso**, a base da URL deve vir da variável de ambiente `API_BASE_URL`. Assim:
  - Em desenvolvimento: `http://localhost:3000/problems/bad-request`
  - Em staging: `https://staging-api.easya1.com/problems/bad-request`
  - Em produção: `https://api.easya1.com/problems/bad-request`
- Links de documentação ou terminos de fallback que remetem ao sistema frontend devem ser referenciados à variável `FRONTEND_URL`.

## 5. Arquivos de Ambiente Locais

Seguir a padronização de nomenclatura para variáveis locais (nunca expor no GitHub):

- `.env` e `.env.local` (Desenvolvimento principal, não comitado)
- `.env.test` (Mock e rotinas de testes e2e)
- `.env.example` (Arquivo **obrigatório** no repositório. O template deve conter as chaves sem segredos reais expostos. *Regra crítica:* sempre que uma nova variável for criada na aplicação — como chaves de testes de SSO ou novos provedores — o `.env.example` deve ser atualizado imediatamente em sincronia).

## 6. Referências no Código

Módulos não devem inferir se uma URL é HTTPS ou HTTP diretamente por inferência indireta; o link montado com template variables `${process.env.API_BASE_URL}` garante o esquema protocolar correto definido pela área de DevOps.

## 7. Alinhamento com Contratos (OpenAPI)

As especificações de contrato (ex: `v1.yaml`) devem refletir esse comportamento dinâmico.

- Nos exemplos de respostas de erro, deve-se usar o placeholder `{{API_BASE_URL}}` para indicar que a URI do problema é montada dinamicamente pelo servidor.
- Isso evita a percepção de URLs "irreais" ou hardcoded na documentação que não correspondem ao ambiente em que o desenvolvedor ou o cliente está operando.

## 8. Estratégia de `.env` no Monorepo (Regra Crítica)

### 8.1. Fonte Única de Verdade

No monorepo **{{project_name}}**, existe **um único `.env` na raiz** do projeto. Ele é a fonte de verdade para todos os apps (`api`, `web`, workers):

```text
{{project_name}}/
├── .env              ← ✅ ÚNICO arquivo de variáveis (não commitado)
├── .env.example      ← ✅ Template obrigatório no repositório (sem segredos)
├── apps/
│   ├── api/          ← ❌ NÃO deve ter .env próprio
│   └── web/          ← ❌ NÃO deve ter .env próprio
```

> **Regra:** Nunca crie um `.env` dentro de `apps/api/` ou `apps/web/`. Todo `.env` local dentro de um app indica duplicação e risco de divergência de configuração.

### 8.2. Como as Variáveis chegam aos Apps (Node.js v20+)

Os scripts `dev`, `start`, `db:migrate` etc. no `apps/api/package.json` usam a flag `--env-file` nativa do Node.js v20+:

```json
{
  "scripts": {
    "dev":        "tsx watch --env-file=../../.env src/server.ts",
    "start":      "node --env-file=../../.env dist/server.js",
    "db:migrate": "tsx --env-file=../../.env src/db/migrate.ts"
  }
}
```

O flag `--env-file` injeta as variáveis **antes** de qualquer módulo ESM ser carregado. Isso é fundamental porque em ESM os `import` estáticos são *hoisted* e executados antes do código do módulo — portanto, soluções baseadas em `dotenv.config()` no meio do `server.ts` **não funcionam** quando há módulos como `db/index.ts` que leem `process.env` durante sua inicialização.

> **Atenção:** Não substitua `--env-file` por `dotenv.config()` inline no `server.ts`. A ordem de execução do ESM não garante que o dotenv rode antes dos imports.

### 8.3. Scripts do Drizzle-kit

O `drizzle-kit` não é um script tsx, por isso usa `node --env-file` explicitamente com o caminho do binário:

```json
{
  "db:generate": "node --env-file=../../.env node_modules/.bin/drizzle-kit generate",
  "db:push":     "node --env-file=../../.env node_modules/.bin/drizzle-kit push",
  "db:studio":   "node --env-file=../../.env node_modules/.bin/drizzle-kit studio"
}
```

### 8.4. Obrigatoriedade do `.env.example`

O arquivo `.env.example` na raiz **deve sempre ser atualizado** quando uma nova variável for adicionada ao `.env`. Ele serve como a documentação viva das variáveis necessárias para novos integrantes do projeto configurarem o ambiente local.

O `.env.example` deve conter todas as chaves com valores fictícios (sem segredos reais):

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
JWT_SECRET=coloque-aqui-sua-chave-secreta-com-minimo-32-caracteres
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
...
```

### 8.5. Registro de Correção (2026-03-03)

**Problema identificado:** `apps/api/.env` não existia (estava no `.gitignore`). A API falhava no boot com `[FATAL] DATABASE_URL não definida` porque o `tsx watch src/server.ts` procurava variáveis no ambiente do processo e não encontrava nada.

**Causa raiz:** Falta de documentação clara sobre onde deve existir o `.env` e como os scripts devem carregá-lo.

**Solução aplicada:**

1. Confirmado que o `.env` **único** fica na raiz `{{project_name}}/`
2. Scripts de `apps/api/package.json` atualizados para usar `--env-file=../../.env`
3. Esta seção adicionada para prevenir recorrência
