# Skill: create-oo-component-documentation

Gera documentação técnica padronizada para componentes OO do projeto (handlers Fastify, repositórios Drizzle, services, middlewares).

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `create-oo-doc`

> **Quando usar:** Ao gerar ou refatorar:
> - Fastify handler ou plugin (`src/modules/*/routes/`, `src/modules/*/handlers/`)
> - Repositório Drizzle (`src/modules/*/repositories/`)
> - Service/use-case de domínio (`src/modules/*/services/`)
> - Middleware transversal (autenticação, tracing, RBAC)

## Argumento

$ARGUMENTS deve conter o caminho do componente (arquivo ou pasta). Se não fornecido, pergunte ao usuário.

## Análise

1. Determine tipo de path (pasta vs arquivo) e identifique componente principal
2. Examine código para estruturas de classes e herança
3. Identifique design patterns e decisões arquiteturais
4. Documente APIs públicas, interfaces e dependências
5. Documente parâmetros, retornos e exceções
6. Avalie performance, segurança, confiabilidade, manutenibilidade

## Stack Específica

- **TypeScript/Node.js** — módulos ESM, async/await, tipos inferidos
- **Fastify** — plugins, hooks, schemas JSON, decorators, lifecycle
- **Drizzle ORM** — schemas `pgTable`, relações, `$inferSelect`
- **Zod** — schemas de validação, `createInsertSchema`, `safeParse`

## Estrutura da Documentação

Gere markdown com as seguintes seções:

1. **Component Overview** — propósito, escopo, contexto
2. **Architecture** — patterns, dependências, diagramas Mermaid (componentes + classes)
3. **Interface Documentation** — tabela de métodos/propriedades
4. **Implementation Details** — classes, configuração, algoritmos
5. **Usage Examples** — básico e avançado com código TypeScript
6. **Quality Attributes** — segurança, performance, confiabilidade

### Contratos Obrigatórios (verificar e documentar)

| Contrato | Regra | Normativo |
|---|---|---|
| **RBAC** | Handler verifica role antes de executar | DOC-ARC-001, SEC-* |
| **X-Correlation-ID** | Propaga correlationId para logs, eventos, chamadas externas | DOC-ARC-003 |
| **RFC 9457** | Erros em formato Problem Details | DOC-ARC-002 |
| **Idempotency-Key** | Escritas com side-effect suportam reenvio idempotente | DOC-DEV-001 |
| **Multi-Tenant** | Toda query filtra por tenant_id no repositório | validate-drizzle-schemas §2 |

## Onde Salvar

`docs/03_especificacoes/components/[component-name]-documentation.md`
