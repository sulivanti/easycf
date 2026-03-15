# Plano de Implantação: Arquitetura Híbrida (Agentes + Skills)

**Versão:** 1.2
**Data:** 2026-03-13

Este documento descreve o plano de implantação para a arquitetura de Inteligência Artificial do projeto, utilizando uma abordagem híbrida que combina o contexto situacional de **Agentes** com a especialização técnica de **Skills**.

## 1. O que foi decidido

Foi escolhida a abordagem **"Agentes + Skills (Híbrida)"**. Essa modelagem permite separar a inteligência e o contexto (Agentes) da execução de tarefas granulares e repetitivas (Skills).

- **Agentes (Orquestradores):** Atuam como os "cérebros" da operação. Eles possuem o contexto do sistema, conhecem as regras globais de negócio (ex: padronização UTF-8, arquitetura base) e decidem *quando* e *quais* habilidades acionar.
- **Skills Prontas (Ferramentas de Base):** Ferramentas modulares e otimizadas já instaladas no projeto (provenientes de repositórios open-source e da comunidade, contidas no `skills-lock.json`), que executam tarefas delimitadas perfeitamente.
- **Skills Customizadas (O Futuro):** Ferramentas que serão criadas para atender especificidades absolutas do domínio do projeto (ex: regras exclusivas do SaaS ou multitenancy B2B).

## 2. Como vamos implementar

A implementação se dará pela separação clara de responsabilidades no repositório:

1. **Definição de Papéis (Agentes):**
   - Manter e evoluir as definições dos agentes dentro da pasta `docs/02_pacotes_agentes/`.
   - Exemplos vigentes: `PKG-DEV-001` (Enriquecimento/Documentação) e `PKG-COD-001` (Geração de Código).
   - Injetar no *system prompt* ou diretrizes do agente a instrução explícita de buscar e utilizar as skills da pasta `.agents/skills` para tarefas de rotina.

2. **Mapeamento de Ferramentas (Skills):**
   - Manter a pasta `.agents/skills` como o repositório central de capacidades técnicas.
   - O agente não deve tentar "adivinhar" como estruturar um Readme ou uma Especificação; ele deve delegar a chamada à respectiva skill instalada.

3. **Ciclo de Vida do Desenvolvimento (SDD - Spec-Driven Development):**
   - O fluxo de trabalho exigirá que os agentes utilizem as skills de especificação *antes* da geração de código, e as skills de documentação *após* a finalização do código.

## 3. Como e quando usar cada opção

Abaixo detalhamos o catálogo de opções e em que momento do ciclo de desenvolvimento o Agente ou o Desenvolvedor Humano deve acioná-las.

### 3.1. Agentes (Orquestradores)

**Quando usar:**
Para iniciar qualquer nova demanda (feature, refatoração estrutural, análise arquitetural) ou quando o contexto envolver múltiplas etapas e entendimento do negócio.
**Como usar:**
Acionando o perfil do agente correspondente ao momento da tarefa.

- Acionar `PKG-DEV-001` quando o objetivo for refinar regras de negócio, documentar fluxos de tenant ou criar base de conhecimento.
- Acionar `PKG-COD-001` quando houver uma especificação clara e o objetivo for implementar código fonte (ex: `.prw`, `.sql`).

### 3.2. Skills Prontas (As Ferramentas de Base)

**Quando usar:**
Sempre que o Agente ou o Desenvolvedor precisar executar uma etapa de processo bem delimitada, contendo padrões da indústria e do projeto.
**Como usar:**
O Agente realiza a chamada para a respectiva sub-rotina/skill:

- **`forge-module`**: Usado na fase de concepção (READY). Disparo único para materializar a fundação física do módulo antes do código.
- **`create-specification`**: Usada na fase de planejamento de arquitetura transversal não atrelada a módulos padrão.
- **`update-specification`**: Quando uma regra de negócio for alterada ou um bug requerer mudança na modelagem original.
- **`create-oo-component-documentation` / `readme-blueprint-generator`**: Na fase de entrega/review. O agente `PKG-COD-001` deve invocá-las logo após finalizar a construção de um componente para garantir que a documentação reflita o código.
- **`validate-drizzle-schemas`** ✅: Skill **customizada**. Usada pelo `AGN-COD-DB` (PKG-COD-001) obrigatoriamente ao criar ou revisar schemas Drizzle ORM. Valida regras de multitenancy, anti-patterns Foundation e integração Zod.
- **`drizzle-orm`**: Skill genérica de referência técnica. Usada pelo `AGN-COD-DB` como repositório de padrões de queries, migrations e configuração do ORM.
- **`theme-factory`**: Utilitária para artefatos visuais (slides, HTML, docs). Acionada por DEV ou COD quando necessário padronizar apresentação.
- **`update-markdown-file-index`**: Usada para manutenção de índices em documentação Markdown (ex: atualizar `INDEX.md` ao criar novos módulos).

### 3.3. Skills Customizadas

**Quando usar:**
Quando o projeto atingir gargalos técnicos que as skills prontas (comunitárias) não cobrem. Normalmente atreladas a frameworks proprietários ou regras arquiteturais rígidas.
**Como usar:**
O Desenvolvedor Humano ou o Agente (via skill `skill-creator`) desenvolve uma nova habilidade na pasta `.agents/skills`.

- *Exemplo de Uso Futuro:* Criar uma skill `verificar-queries-n+1-tenancy` e instruir o `PKG-COD-001` a rodá-la obrigatoriamente antes de concluir a criação de uma view SQL.
- *Exemplo de Uso Futuro:* Criar uma skill `validar-sintaxe-fastify` para garantir que funções estão sendo corretamente implementadas com decorators de segurança padrão.

## 4. Tarefas de Implantação

### Concluídas

- [x] **Atualizar Prompts/Diretrizes dos Agentes:** Revisados `PKG-DEV-001` (v1.3) e `PKG-COD-001` (v1.3) com tópicos 0.7 e 0.4 que obrigam uso de skills.
- [x] **Teste de Integração SDD (PoC):** Fluxo SDD validado com `create-specification` e `create-oo-component-documentation`.
- [x] **Levantamento de Skills Prioritárias (Domínio):** Documento `Levantamento_Skills_Prioritarias.md` atualizado para v2.0 com catálogo completo.
- [x] **Skill `validate-drizzle-schemas`:** Primeira skill customizada implementada e ativa. Cobre anti-patterns Foundation, multitenancy, Zod e LGPD.
- [x] **Documentação de Onboarding:** Seção disponível neste documento e no `DOC-GPA-001`.

### Pendentes (Próximas Skills Customizadas)

- [x] **`validate-openapi-contract`** — ✅ Implementada (2026-03-13): Valida conformidade com EX-OAS-001..004, lint Spectral e presença de `@contract` em artefatos. Ver `.agents/skills/validate-openapi-contract/SKILL.md`.
- [ ] **`validate-audit-hooks`** — Prioridade **Média**: Ampliar cobertura de auditoria para a camada Application (Use Cases), complementando o que `validate-drizzle-schemas` já cobre no schema de banco.
