# Skill: enrich-all

Orquestra o enriquecimento de **todos os módulos elegíveis**, executando `/enrich` sequencialmente para cada módulo com checkpoint de progresso em disco.

> **Caminhos:** `.agents/paths.json` | **Registro:** `.agents/enrichment-registry.json` | **Contexto normativo:** `.agents/context-map.json` → `enrich-all`

## Quando usar esta skill

Consulte a tabela de decisão em `/enrich`. Use esta skill apenas quando precisa processar **vários módulos** de uma vez.

## Argumento

$ARGUMENTS (opcional):

1. **Seletor de módulos** (default: `all`):
   - `all` — descobre e processa todos os módulos com `estado_item != READY`
   - Lista separada por vírgula — ex: `mod-001,mod-003,mod-005`
2. **Seletor de agentes** (opcional, default: `all`):
   - `all` — executa todos os 11 agentes na ordem de fases
   - Lista separada por vírgula — ex: `AGN-DEV-02,AGN-DEV-04`
   - Nome do pilar — ex: `BR,DATA,SEC`
3. **Flag `--dry-run`** (opcional): apenas lista o plano, sem executar
4. **Flag `--resume`** (opcional): retoma execução a partir do último checkpoint

Se não fornecido, assume `all all` (todos os módulos, todos os agentes).

---

## Estratégia: Single-Pass com Checkpoint

Cada módulo é processado sequencialmente via `/enrich`. Entre módulos, o progresso é salvo em disco no arquivo de checkpoint. Isso permite:

- **Resume após interrupção** — a flag `--resume` retoma do último módulo não concluído
- **Simplicidade** — delega toda a lógica de fases e agentes para `/enrich`
- **Sem subagents** — execução linear, sem overhead de contexto extra

---

## PASSO 1: Descoberta de Módulos

Leia todos os `mod.md` em `docs/04_modules/mod-*/mod.md`.

Para cada módulo:
- Extraia `estado_item` do frontmatter/metadata
- Se `estado_item` == `READY`, **exclua** da lista (módulo selado)
- Se `estado_item` == `DRAFT` ou `WIP`, **inclua** na lista

Se o seletor de módulos não for `all`, filtre apenas os módulos especificados.

Ordene os módulos pelo número do módulo (ex: `mod-000` antes de `mod-001`).

Se nenhum módulo elegível for encontrado, aborte: `"Nenhum módulo elegível encontrado."`

## PASSO 2: Checkpoint — Carregar ou Criar

O arquivo de checkpoint é `.agents/enrich-all-checkpoint.json`.

### Se `--resume` e checkpoint existe:

Leia o checkpoint e filtre os módulos já concluídos (`status: "done"`). Retome a partir do primeiro módulo com `status: "pending"` ou `status: "error"`.

### Se não `--resume` ou checkpoint não existe:

Crie o checkpoint inicial:

```json
{
  "started_at": "2026-03-20T10:00:00Z",
  "agent_selector": "all",
  "modules": [
    { "path": "docs/04_modules/mod-000-foundation/", "status": "pending" },
    { "path": "docs/04_modules/mod-001-backoffice-admin/", "status": "pending" }
  ]
}
```

## PASSO 3: Plano de Execução

Apresente ao usuário:

```
## Plano de Enriquecimento — enrich-all

### Módulos ({N} elegíveis)
| # | Módulo | Estado | Status Checkpoint |
|---|--------|--------|-------------------|
| 1 | mod-000-foundation | DRAFT | pending |
| ... | ... | ... | ... |

### Agentes: {seletor} ({N} agentes por módulo)
### Total estimado: {N módulos} × {N agentes} = {total} execuções
```

Se `--dry-run`, pare aqui.

Caso contrário, pergunte: `"Confirma a execução? (sim/não)"`

## PASSO 4: Execução Sequencial

Para cada módulo pendente na ordem:

1. Anuncie: `## Módulo {M}/{total}: {nome_modulo}`

2. Invoque `/enrich {caminho_modulo} {seletor_agentes}`

3. Após completar, atualize o checkpoint no disco:
   ```json
   { "path": "docs/04_modules/mod-000-foundation/", "status": "done", "completed_at": "...", "items_generated": N }
   ```

4. Se ocorrer erro:
   - Atualize o checkpoint com `"status": "error"` e `"error": "descrição"`
   - Pergunte ao usuário: `"Erro no módulo {nome}. Deseja: (1) continuar com próximo módulo, (2) abortar?"`
   - Se abortar, o checkpoint salvo permite retomar com `--resume`

5. Emita progresso: `Módulo {M}/{total} completo — {N} items gerados`

## PASSO 5: Relatório Final

Após todos os módulos processados:

```
## Relatório Final — enrich-all

### Resumo
- Módulos processados: {N}
- Módulos com sucesso: {N}
- Módulos com erro: {N}
- Total de agentes executados: {total}

### Por Módulo
| Módulo | Status | Items | Erros |
|--------|--------|-------|-------|
| mod-000 | done | 11 | 0 |
| ... | ... | ... | ... |

### Próximos passos
- Revise os arquivos enriquecidos por módulo
- Execute `/validate-all {caminho_modulo}` para cada módulo
- Quando satisfeito com cada módulo, promova com `/promote-module`
```

## PASSO 6: Limpeza do Checkpoint

Após relatório final:
- Se **todos** os módulos foram concluídos com sucesso, **delete** o arquivo de checkpoint
- Se houve erros, **mantenha** o checkpoint para permitir `--resume`
