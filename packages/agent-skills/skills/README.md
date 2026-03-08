# Agent Skills (MCP-Like Reference)

Este documento serve como um catálogo simplificado das skills disponíveis neste diretório, funcionando como um MCP (Model Context Protocol) para rápida consulta de `triggers` e finalidades de cada Agente/Skill.

## Tabela de Habilidades

| Skill | Descrição Principal / Finalidade | Triggers / Exemplos de Uso |
| --- | --- | --- |
| `create-amendment` | Cria emenda governada para detalhar/corrigir especificações sem alterar o arquivo original. | **Triggers:** "criar emenda", "detalhar funcionalidade"<br>**Exemplos:** *"Criar emenda para detalhar a integração de gateway na especificação PGT"*, *"Adicionar regra de negócio usando amendment na US-CORE-F01"* |
| `create-oo-component-documentation` | Gera documentação padronizada para componentes OO (handlers, repositórios, services, etc). | **Triggers:** "documentar componente", "gerar doc técnica"<br>**Exemplos:** *"Por favor, documente a classe UserRepository"*, *"Gerar a documentação técnica do AuthController"* |
| `create-specification` | Cria um arquivo de especificação novo, otimizado para IA gerativa. | **Exemplos:** *"Criar especificação técnica inicial para o módulo de relatórios financeiros."* |
| `delete-module` | Exclui fisicamente a pasta de um módulo. Útil para limpeza ou descontinuação. | **Triggers:** "excluir módulo", "apagar MOD-XXX"<br>**Exemplos:** *"Apagar módulo MOD-005"*, *"Excluir completamente a pasta do módulo de notificações"* |
| `draft-user-story` | Entrevistador normativo que ajuda a elaborar e estruturar uma User Story do zero antes do código. | **Triggers:** "entrevistar US", "criar user story"<br>**Exemplos:** *"Quero rascunhar uma user story para recuperação de senha"*, *"Entrevistar nova US para o painel de admin"* |
| `drizzle-orm` | Especialista em uso e padrões do Drizzle ORM (Type-safe SQL ORM for TypeScript). | **Exemplos:** *"Como fazer um relational join corretamente usando Drizzle?"*, *"Qual o padrão de query builder para paginação no Drizzle?"* |
| `readme-blueprint-generator` | Gera/atualiza o README baseando-se em documentos normativos e de módulos do projeto. | **Triggers:** "gerar README", "atualizar README"<br>**Exemplos:** *"Atualizar o README do repositório baseado nos novos módulos criados."* |
| `rollback-module` | Desfaz a geração de um módulo (scaffold), apagando docs geradas e retornando a US para status inicial. | **Triggers:** "reprovar módulo", "desfazer scaffold"<br>**Exemplos:** *"Fazer rollback do MOD-012"*, *"Desfazer scaffold do MOD de pagamentos porque a especificação mudou"* |
| `scaffold-module` | Gera a estrutura completa de um novo módulo obedecendo às regras do arquivo normativo DOC-DEV-001. | **Triggers:** "scaffold module", "criar módulo"<br>**Exemplos:** *"Scaffold do novo módulo MOD-020 de Contabilidade"*, *"Gerar estrutura do MOD-015"* |
| `skill-creator` | Cria, moderniza ou analisa a performance e a variação das skills. | **Exemplos:** *"Criar uma nova skill para validar padronização de commits"*, *"Analisar as métricas de variância da skill validate-fastify-endpoint"* |
| `transition-spec-status` | Analisa a especificação (DoR) e transita o status (DRAFT -> REFINING/READY). | **Triggers:** "transicionar status", "validar DoR"<br>**Exemplos:** *"Promover a especificação do MOD-008 para READY"*, *"Validar DoR desta spec de perfil de usuário"* |
| `update-markdown-file-index` | Cria ou atualiza uma tabela/índice com todos os arquivos de um dado diretório na documentação. | **Exemplos:** *"Atualizar índice de arquivos markdown da pasta docs/04_modules"* |
| `update-specification` | Atualiza uma documentação/especificação existente, mantendo histórico e padrões do projeto. | **Exemplos:** *"Mudar a regra de limite de tentativas na especificação de login"*, *"Atualizar a spec do carrinho com novos requisitos"* |
| `validate-drizzle-schemas` | Valida schemas de banco contra diretrizes fundamentais (Multi-tenant, Zod, anti-patterns). | **Exemplos:** *"Validar schema.ts de contas de usuários"*, *"Checar se há algum anti-pattern neste schema do banco"* |
| `validate-fastify-endpoint` | Avalia rotas Fastify para garantir contratos arquiteturais (RBAC, RFC 9457 e logs). | **Triggers:** "validar rota", "revisar endpoint"<br>**Exemplos:** *"Revisar a segurança do endpoint de login"*, *"Validar rota de criação de usuários no Fastify no arquivo user.routes.ts"* |
