---
name: create-specification
description: 'Create a new specification file for the solution, optimized for Generative AI consumption.'
---

# Create Specification

> [!IMPORTANT]
> **Quando usar neste projeto:**
> Use esta skill para **contratos técnicos e arquiteturais que não são módulos de negócio**. Exemplos concretos:
>
> - Definir a **estratégia de cache** (Redis, TTL, invalidação)
> - Especificar o **padrão de eventos de domínio** (formato, tabela de auditoria, garantias)
> - Definir **contratos de integração** com sistemas externos (webhooks, filas, API de terceiros)
> - Documentar a **estratégia de testes** de um módulo antes de implementar
> - Especificar **padrões de observabilidade** (traces, métricas, alertas)
>
> ⚠️ Se for um módulo de negócio (`MOD-XXX`), use `forge-module` — não esta skill.

Your goal is to create a new specification file for `${input:SpecPurpose}`.

The specification file must define the requirements, constraints, and interfaces for the solution components in a manner that is clear, unambiguous, and structured for effective use by Generative AIs. Follow established documentation standards and ensure the content is machine-readable and self-contained.

## Best Practices for AI-Ready Specifications

- Use precise, explicit, and unambiguous language.
- Clearly distinguish between requirements, constraints, and recommendations.
- Use structured formatting (headings, lists, tables) for easy parsing.
- Avoid idioms, metaphors, or context-dependent references.
- Define all acronyms and domain-specific terms.
- Include examples and edge cases where applicable.
- Ensure the document is self-contained and does not rely on external context.

The specification should be saved in the `docs/03_especificacoes/` directory (or its equivalent module directory) and named according to the following convention: `spec-[a-z0-9-]+.md`, where the name should be descriptive of the specification's content and starting with the highlevel purpose, which is one of [schema, tool, data, infrastructure, process, architecture, or design].

The specification file must follow the template below. **Leia o template canônico antes de criar o arquivo:**

> 📄 **Template oficial:** [`.agents/skills/_templates/spec-template.md`](./../_templates/spec-template.md)
>
> Copie a estrutura completa deste arquivo e preencha todas as seções. O template é a **fonte única de verdade** do formato de spec — qualquer evolução futura no layout é feita apenas lá.
