# Skill: create-specification

Cria um novo arquivo de especificação técnica, otimizado para consumo por IA Generativa.

> **Quando usar:** Para contratos técnicos e arquiteturais que NÃO são módulos de negócio:
> - Estratégia de cache (Redis, TTL, invalidação)
> - Padrão de eventos de domínio (formato, auditoria, garantias)
> - Contratos de integração com sistemas externos (webhooks, filas, APIs)
> - Estratégia de testes antes de implementar
> - Padrões de observabilidade (traces, métricas, alertas)
>
> Se for módulo de negócio (MOD-XXX), use `/project:forge-module`.

## Argumento

$ARGUMENTS deve conter a descrição do propósito da especificação (ex: `"estratégia de cache para módulo de produtos"`). Se não fornecido, pergunte ao usuário.

## Boas Práticas

- Use linguagem precisa, explícita e não ambígua
- Distinga claramente entre requisitos, restrições e recomendações
- Use formatação estruturada (headings, listas, tabelas)
- Evite expressões idiomáticas ou referências dependentes de contexto
- Defina todos os acrônimos e termos de domínio
- Inclua exemplos e edge cases
- O documento deve ser autossuficiente

## Onde Salvar

Diretório: `docs/03_especificacoes/`
Nomenclatura: `spec-[a-z0-9-]+.md` (ex: `spec-cache-strategy-products.md`)

## Template

Leia o template canônico antes de criar: `.agents/skills/_templates/spec-template.md`
Copie a estrutura completa e preencha todas as seções.
