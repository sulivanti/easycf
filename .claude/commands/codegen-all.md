# Skill: codegen-all

Orquestra a geração de código de **todos os módulos READY**, executando `/codegen` sequencialmente para cada módulo em **ordem topológica** (DEPENDENCY-GRAPH.md) com checkpoint de progresso em disco.

> **Caminhos:** `.agents/paths.json` | **Registro:** `.agents/codegen-registry.json` | **Contexto normativo:** `.agents/context-map.json` → `codegen`

## Quando usar esta skill

Consulte a tabela de decisão em `/codegen`. Use esta skill apenas quando precisa processar **vários módulos** de uma vez, respeitando a ordem de dependências.

## Argumento

$ARGUMENTS (opcional):

1. **Seletor de módulos** (default: `all`):
   - `all` — descobre e processa todos os módulos com `estado_item == READY`
   - Lista separada por vírgula — ex: `mod-000,mod-003,mod-005`
2. **Seletor de agentes** (opcional, default: `all`):
   - `all` — executa todos os agentes aplicáveis ao nível na ordem de fases
   - Lista separada por vírgula — ex: `AGN-COD-DB,AGN-COD-CORE`
   - Nome da camada — ex: `DB,CORE,APP`
3. **Flag `--dry-run`** (opcional): apenas lista o plano em ordem topológica, sem executar
4. **Flag `--resume`** (opcional): retoma execução a partir do último checkpoint

Se não fornecido, assume `all all` (todos os módulos READY, todos os agentes).

---

## Estratégia: Ordem Topológica + Single-Pass com Checkpoint

Diferente do `/enrich-all` (ordem numérica), o codegen respeita a **ordem topológica** do grafo de dependências. Módulos sem dependências são processados primeiro. Isso garante que o código das dependências esteja disponível quando módulos dependentes forem gerados.

---

## PASSO 1: Descoberta de Módulos READY

Leia todos os manifestos de módulo em `docs/04_modules/mod-*/mod-*.md`.

Para cada módulo:
- Extraia `estado_item` do metadata
- Se `estado_item` == `READY`, **inclua** na lista (elegível para codegen)
- Se `estado_item` != `READY`, **exclua** (módulo não selado)

Se o seletor de módulos não for `all`, filtre apenas os módulos especificados.

Se nenhum módulo elegível for encontrado, aborte: `"Nenhum módulo READY encontrado para codegen."`

## PASSO 2: Ordenação Topológica

Leia `docs/04_modules/DEPENDENCY-GRAPH.md` (seção §5 — Ordem de Implementação Sugerida).

Ordene os módulos elegíveis conforme a ordem topológica:

| Camada | Módulos | Pré-requisitos |
|--------|---------|----------------|
| 0 | MOD-000 | Nenhum |
| 1 | MOD-001, MOD-002, MOD-003 | MOD-000 |
| 2 | MOD-004 | MOD-000, MOD-003 |
| 3 | MOD-005 | MOD-000, MOD-003, MOD-004 |
| 4 | MOD-006 | MOD-000..MOD-005 |
| 5 | MOD-007, MOD-009 | MOD-006 |
| 6 | MOD-008, MOD-010, MOD-011 | MOD-007/MOD-009 |

Módulos na mesma camada topológica são processados sequencialmente (na ordem numérica).

**Validação:** Para cada módulo, verifique se todas as dependências do grafo também estão na lista ou já foram processadas (código já existe). Se uma dependência não está na lista e seu código não existe, emita aviso:
`"⚠️ MOD-{XXX} depende de MOD-{YYY} que não está na fila e não tem código gerado. O codegen pode gerar referências inválidas."`

## PASSO 3: Checkpoint — Carregar ou Criar

O arquivo de checkpoint é `.agents/codegen-all-checkpoint.json`.

### Se `--resume` e checkpoint existe:

Leia o checkpoint e filtre os módulos já concluídos (`status: "done"`). Retome a partir do primeiro módulo com `status: "pending"` ou `status: "error"`.

### Se não `--resume` ou checkpoint não existe:

Crie o checkpoint inicial:

```json
{
  "started_at": "2026-03-23T10:00:00Z",
  "agent_selector": "all",
  "topological_order": [
    { "layer": 0, "modules": ["mod-000-foundation"] },
    { "layer": 1, "modules": ["mod-001-backoffice-admin", "mod-002-gestao-usuarios", "mod-003-estrutura-organizacional"] },
    { "layer": 2, "modules": ["mod-004-identidade-avancada"] },
    { "layer": 3, "modules": ["mod-005-modelagem-processos"] },
    { "layer": 4, "modules": ["mod-006-execucao-casos"] },
    { "layer": 5, "modules": ["mod-007-parametrizacao-contextual", "mod-009-movimentos-aprovacao"] },
    { "layer": 6, "modules": ["mod-008-integracao-protheus", "mod-010-mcp-automacao", "mod-011-smartgrid"] }
  ],
  "modules": [
    { "path": "docs/04_modules/mod-000-foundation/", "topo_layer": 0, "status": "pending" }
  ]
}
```

## PASSO 4: Pre-flight Scaffold Check

Verifique se o scaffold existe:
- `apps/api/package.json` deve existir
- `apps/web/package.json` deve existir
- Se não, aborte: `"Scaffold não encontrado. Execute /app-scaffold primeiro."`

## PASSO 5: Plano de Execução

Apresente ao usuário:

```
## Plano de Codegen — codegen-all

### Ordem Topológica ({N} módulos READY)
| Camada | Módulo | Nível | Agentes | Status |
|--------|--------|-------|---------|--------|
| 0 | mod-000-foundation | N2 | 6 | pending |
| 1 | mod-001-backoffice-admin | N1 | 5 | pending |
| 1 | mod-002-gestao-usuarios | N1 | 5 | pending |
| 1 | mod-003-estrutura-organizacional | N2 | 6 | pending |
| ... | ... | ... | ... | ... |

### Agentes por módulo: {seletor} (filtrado por nível)
### Total estimado: {N módulos} × ~{N médio agentes} = ~{total} execuções

⚠️ Dependências validadas: {OK|avisos}
```

Se `--dry-run`, pare aqui.

Caso contrário, pergunte: `"Confirma a execução? (sim/não)"`

## PASSO 6: Execução Sequencial por Camada Topológica

Para cada camada topológica, na ordem:

1. Anuncie: `## Camada Topológica {L}`
2. Para cada módulo na camada (ordem numérica):
   a. Anuncie: `### Módulo {M}/{total}: {nome_modulo} (camada topo {L})`
   b. Invoque `/codegen {caminho_modulo} {seletor_agentes}`
   c. Após completar, atualize o checkpoint no disco:
      ```json
      { "path": "docs/04_modules/mod-000-foundation/", "topo_layer": 0, "status": "done", "completed_at": "...", "files_generated": N }
      ```
   d. Se ocorrer erro:
      - Atualize o checkpoint com `"status": "error"` e `"error": "descrição"`
      - Pergunte ao usuário: `"Erro no módulo {nome}. Deseja: (1) continuar com próximo módulo, (2) abortar?"`
      - Se abortar, o checkpoint salvo permite retomar com `--resume`
   e. Emita progresso: `Módulo {M}/{total} completo — {N} arquivos gerados`

## PASSO 7: Relatório Final

Após todos os módulos processados:

```
## Relatório Final — codegen-all

### Resumo
- Módulos processados: {N}
- Módulos com sucesso: {N}
- Módulos com erro: {N}
- Total de arquivos gerados: {total}
- Camadas topológicas processadas: {N}

### Por Camada Topológica
| Camada | Módulo | Status | Arquivos | Erros |
|--------|--------|--------|----------|-------|
| 0 | mod-000-foundation | done | 17 | 0 |
| 1 | mod-001-backoffice-admin | done | 3 | 0 |
| ... | ... | ... | ... | ... |

### Árvore de Arquivos Gerados
```
apps/
├── api/
│   ├── src/modules/
│   │   ├── foundation/
│   │   │   ├── infrastructure/ (N files)
│   │   │   ├── domain/ (N files)
│   │   │   └── ...
│   │   └── ...
│   ├── db/ (N files)
│   └── openapi/ (N files)
└── web/
    └── src/modules/
        ├── foundation/ (N files)
        └── ...
```

### Próximos passos
- Execute `pnpm install` para instalar dependências adicionadas
- Execute `pnpm test` para verificar todos os testes
- Execute `pnpm lint` para verificar linting
- Revise os arquivos gerados por módulo
```

## PASSO 8: Limpeza do Checkpoint

Após relatório final:
- Se **todos** os módulos foram concluídos com sucesso, **delete** o arquivo de checkpoint
- Se houve erros, **mantenha** o checkpoint para permitir `--resume`
