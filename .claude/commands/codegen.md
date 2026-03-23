# Skill: codegen

Orquestra os agentes de geração de código PKG-COD-001 para um módulo, respeitando dependências entre camadas e o nível arquitetural.

> **Caminhos:** `.agents/paths.json` | **Registro:** `.agents/codegen-registry.json` | **Contexto normativo:** `.agents/context-map.json` → `codegen`

## Quando usar qual skill de codegen

| Situação | Skill | Exemplo |
|---|---|---|
| Preciso rodar **1 agente** em **1 módulo** | `/codegen-agent` | `/codegen-agent docs/04_modules/mod-000-foundation/ AGN-COD-DB` |
| Preciso rodar **vários agentes** em **1 módulo** | `/codegen` (esta skill) | `/codegen docs/04_modules/mod-000-foundation/` |
| Preciso rodar agentes em **vários módulos** | `/codegen-all` | `/codegen-all` |

**Regra geral:** use a skill mais granular que resolve seu caso. `/codegen-agent` é mais rápido e consome menos contexto. `/codegen` orquestra a ordem correta entre camadas. `/codegen-all` é para operações em lote com ordem topológica.

---

## Argumento

$ARGUMENTS deve conter:

1. **Caminho do módulo** (ex: `docs/04_modules/mod-000-foundation/`)
2. **Seletor de agentes** (opcional, default: `all`):
   - `all` — executa todos os agentes aplicáveis ao nível na ordem de fases
   - ID único — ex: `AGN-COD-DB`
   - Lista separada por vírgula — ex: `AGN-COD-DB,AGN-COD-CORE,AGN-COD-APP`
   - Nome da camada — ex: `DB`, `CORE`, `APP`, `API`, `WEB`, `VAL` (resolve para o agente correspondente)

Se não fornecido, pergunte ao usuário.

---

## PASSO 1: Validação do Módulo

Leia o manifesto do módulo (arquivo `<dirname>.md`, ex: `mod-000-foundation.md`).

- Se **não existir**, aborte: `"Módulo não encontrado. Execute /forge-module primeiro."`
- Se `estado_item` **NÃO** for `READY`, aborte: `"Módulo não está READY. O codegen requer especificações seladas. Execute /promote-module primeiro."`

Extraia:
- **Nível arquitetural** (0, 1 ou 2) da seção "Nível de Arquitetura"
- **module_paths** para resolução do slug

## PASSO 2: Resolução de Agentes

Leia `.agents/codegen-registry.json`.

### Se `all`:

Use a sequência definida em `execution_phases` do registry, **filtrada pelo nível** do módulo:

| Fase | Agente | Camada | Nível mín. |
|------|--------|--------|------------|
| 1 | AGN-COD-DB | infrastructure | 1 |
| 2 | AGN-COD-CORE | domain | 2 |
| 3 | AGN-COD-APP | application | 1 |
| 4 | AGN-COD-API | presentation | 1 |
| 5 | AGN-COD-WEB | web | 0 |
| 6 | AGN-COD-VAL | validation | 0 |

Aplique o `level_filter` do registro para remover agentes não aplicáveis ao nível.

### Se ID único ou lista:

Ordene os agentes selecionados pela ordem de fases acima. Se AGN-COD-VAL estiver na lista, mova-o para o final.

### Resolução por nome de camada:

| Camada | Agente |
|--------|--------|
| DB | AGN-COD-DB |
| CORE | AGN-COD-CORE |
| APP | AGN-COD-APP |
| API | AGN-COD-API |
| WEB | AGN-COD-WEB |
| VAL | AGN-COD-VAL |

## PASSO 3: Aviso de Contexto (modo `all`)

Se o seletor for `all`, informe ao usuário:

> **Nota:** A execução de todos os agentes em uma única conversa acumula contexto progressivamente. Para módulos grandes ou complexos, considere executar em batches:
> - Batch 1: `AGN-COD-DB,AGN-COD-CORE` (infraestrutura + domínio)
> - Batch 2: `AGN-COD-APP,AGN-COD-API` (application + endpoints)
> - Batch 3: `AGN-COD-WEB,AGN-COD-VAL` (frontend + validação)

Pergunte se deseja continuar com `all` ou usar batches. Se o usuário confirmar `all`, prossiga.

## PASSO 4: Pre-flight Scaffold Check

Verifique se o scaffold necessário existe:
- Se algum agente da lista opera em `apps/api/` → verifique `apps/api/package.json`
- Se algum agente da lista opera em `apps/web/` → verifique `apps/web/package.json`
- Se não existe, aborte: `"Scaffold não encontrado. Execute /app-scaffold primeiro."`

## PASSO 5: Execução Sequencial

Para cada fase na sequência resolvida:

1. Anuncie a fase: `### Fase {N}: {label}`
2. Para cada agente na fase, invoque:
   ```
   /codegen-agent {caminho_modulo} {agent_id}
   ```
3. Após cada agente, registre o resultado (arquivos gerados, missing_info, validações)
4. Se um agente reportar `missing_info` crítico que impede fases seguintes, pause e pergunte ao usuário
5. Se um agente for skippado por nível (exit graceful), registre e continue

## PASSO 6: Validação Cruzada Final

Após todos os agentes executados (especialmente AGN-COD-VAL):

1. Verifique consistência entre camadas:
   - Schemas Drizzle → tipos Domain → use cases Application → rotas API
   - Endpoints API → consumo Web
2. Se `AGN-COD-VAL` reportou erros, destaque no relatório

## PASSO 7: Relatório Consolidado

Após todos os agentes executados, emita um resumo consolidado:

```
## Relatório de Codegen — {caminho_modulo}

### Agentes executados
| Fase | Agente | Camada | Arquivos | Status |
|------|--------|--------|----------|--------|
| 1 | AGN-COD-DB | infrastructure | 3 | ✅ |
| 2 | AGN-COD-CORE | domain | 2 | ✅ |
| 3 | AGN-COD-APP | application | 4 | ✅ |
| 4 | AGN-COD-API | presentation | 5 | ✅ |
| 5 | AGN-COD-WEB | web | 3 | ✅ |
| 6 | AGN-COD-VAL | validation | 0 | ✅ |
| — | — | — | — | ⏭️ skipped (nível) |

### Arquivos gerados ({N} total)
- {lista de arquivos criados ou atualizados, agrupados por camada}

### Missing Info (consolidado)
- {lista de lacunas pendentes de todos os agentes}

### Validações
- ✅ {validações passaram}
- ❌ {validações falharam, se houver}

### Próximos passos
- Revise os arquivos gerados
- Resolva os itens de Missing Info
- Execute `pnpm install` para instalar dependências
- Execute `pnpm test` para verificar testes
- Execute `/codegen-all` para processar o próximo módulo
```

## PASSO 8: Sincronizar Plano de Ação

Após o relatório consolidado, atualize o plano de ação do módulo:

1. Verifique se o plano já existe: `docs/04_modules/user-stories/plano/PLANO-ACAO-MOD-{NNN}.md`
2. Se **existe** → invoque `/action-plan {caminho_modulo} --update`
3. Se **não existe** → invoque `/action-plan {caminho_modulo}` (criação completa)

> **Nota:** Este passo garante que o plano de ação reflita o progresso da geração de código.
> Adicione ao relatório: `📋 Plano de ação atualizado: PLANO-ACAO-MOD-{NNN}.md`
