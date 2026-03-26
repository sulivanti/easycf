# Skill: create-specification

Cria um novo arquivo de especificação técnica, otimizado para consumo por IA Generativa.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `create-specification`

> **Quando usar:** Para contratos técnicos e arquiteturais que NÃO são módulos de negócio:
> - Bugfixes cross-módulo (ex: tenant_id vazio em domain_events)
> - Estratégia de cache (Redis, TTL, invalidação)
> - Padrão de eventos de domínio (formato, auditoria, garantias)
> - Contratos de integração com sistemas externos (webhooks, filas, APIs)
> - Estratégia de testes antes de implementar
> - Padrões de observabilidade (traces, métricas, alertas)
>
> Se for módulo de negócio (MOD-XXX), use `/project:forge-module`.

## Pipeline completo (spec → amendment → merge → implementação)

```text
/create-specification ──→ /create-amendment ──→ /merge-amendment ──→ implementação ──→ /git release
       (esta skill)         (se módulos READY)    (sela no base)      (edita código)     (versiona)
```

> **Regra:** Specs geram amendments quando afetam módulos com `estado_item: READY`.
> Se os módulos estão em `DRAFT`, a spec serve diretamente como guia para implementação.

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
- **Sempre inclua "Appendix A: Plano de Execução"** com: arquivos afetados, steps, e paralelização

## Onde Salvar

Diretório: `docs/03_especificacoes/`
Nomenclatura: `spec-[a-z0-9-]+.md` (ex: `spec-cache-strategy-products.md`)

## Template

Leia o template canônico antes de criar: `.agents/templates/spec-template.md`
Copie a estrutura completa e preencha todas as seções.

## Passo Final: Análise de Impacto e Próximos Passos

Após criar a spec, **SEMPRE** execute esta análise:

### 1. Identificar módulos afetados

A partir da seção "Arquivos modificados" ou "Plano de Execução" da spec, identifique quais módulos (MOD-NNN) são impactados.

### 2. Verificar estado dos módulos

Para cada módulo afetado, leia o manifesto (`docs/04_modules/mod-NNN-*/mod-NNN-*.md`) e extraia `estado_item`.

### 3. Determinar próximo passo

```text
estado_item do módulo afetado?
├── READY  → Próximo: /create-amendment (amendments nos requisitos afetados)
├── DRAFT  → Próximo: implementação direta (spec serve como guia)
└── Misto  → Um /create-amendment por módulo READY + implementação direta nos DRAFT
```

### 4. Comunicar ao usuário

Responda com:
- Link da spec criada
- Lista de módulos afetados + estado de cada um
- **Próximo passo concreto** com o comando exato:
  - Se READY: `Execute /create-amendment com base na spec {path} — {N} módulos afetados: {lista}`
  - Se DRAFT: `Implemente diretamente com base na spec — módulos em DRAFT permitem edição`
  - Se misto: indique ambos os caminhos
- Resumo do plano de execução (steps e paralelização)
