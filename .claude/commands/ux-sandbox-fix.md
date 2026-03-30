# Skill: ux-sandbox-fix

Recebe feedback de validacao visual e aplica correcoes nos frames do Penpot sandbox.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `ux-sandbox-fix`

> **Pipeline UX Sandbox:** Esta skill e o PASSO 2 do pipeline. Prerequisito: `/ux-sandbox-create`. Proximo: `/ux-apply-layout`.

## Argumento

$ARGUMENTS deve conter o **numero da spec** (ex: `10`) seguido de **texto de correcao** (modo manual) ou flag `--from-spec`.

Exemplos:
- `/ux-sandbox-fix 10 mover SearchBar 20px para baixo, badge ATIVO deve ser verde mais escuro`
- `/ux-sandbox-fix 10 --from-spec` (auto-detecta drift entre spec e sandbox)
- `/ux-sandbox-fix 10 --from-spec --dry-run`

Flags opcionais:
- `--dry-run` — mostra plano de correcoes sem executar
- `--from-spec` — auto-detecta divergencias spec vs sandbox (sem input manual)

---

## Gates

### Gate 1 — Screen identifier valido

```text
Resolver spec a partir do numero em $ARGUMENTS:
├── Numero (ex: "10") → glob docs/03_especificacoes/ux/{N}-*-spec.md
├── Match encontrado  → Guarde SPEC_PATH, SPEC_NUMBER
└── Nenhum match      → ABORTE: "Spec nao encontrada para numero {N}."
```

### Gate 2 — Frame existe no sandbox

```text
Extrair frame name do header da spec (ex: "10-OrgTree")
Chamar mcp__penpot__search_object:
  file_id: 73c70309-a5e2-8120-8007-c7820d832ea2
  query: {frame_name}
├── Encontrado → Guarde FRAME_ID e PAGE_ID
└── Nao encontrado → ABORTE: "Frame '{nome}' nao existe no sandbox. Execute /ux-sandbox-create {N} primeiro."
```

### Gate 3 — MCP disponivel

```text
Chamar mcp__penpot__list_projects
├── Sucesso → Prossiga
└── Falha   → ABORTE: "MCP Penpot indisponivel."
```

---

## PASSO 1 — Inspecionar estado atual

### 1.1 — Object tree

Chamar `mcp__penpot__get_object_tree`:
- `file_id`: `73c70309-a5e2-8120-8007-c7820d832ea2`
- `object_id`: `FRAME_ID`
- `depth`: `-1` (arvore completa)

Guardar como `CURRENT_TREE`.

### 1.2 — Screenshot "antes"

Chamar `mcp__penpot__export_object`:
- `file_id`: sandbox file ID
- `object_id`: `FRAME_ID`
- `format`: `png`
- `scale`: `2`

Exibir screenshot "ANTES" ao usuario.

---

## PASSO 2 — Parsear correcoes

### Modo Manual (texto livre)

Quando $ARGUMENTS contem texto de correcao (sem `--from-spec`):

1. Parsear instrucoes em linguagem natural
2. Para cada instrucao, identificar:
   - **Objeto alvo:** Buscar no `CURRENT_TREE` por nome ou tipo
   - **Propriedade:** posicao (x/y), dimensao (w/h), cor (fill), texto, fonte, visibilidade
   - **Valor alvo:** o que o usuario quer

Exemplo de parsing:
```
"mover SearchBar 20px para baixo" → objeto: SearchBar, prop: y, operacao: y += 20
"badge ATIVO verde mais escuro"   → objeto: badge-ativo, prop: fill-color, valor: #1E7A42→#166B38
```

### Modo Auto (`--from-spec`)

Quando $ARGUMENTS contem `--from-spec`:

1. Ler spec (`SPEC_PATH`) e extrair element tree com dimensoes e fills
2. Comparar com `CURRENT_TREE` propriedade a propriedade:
   - Posicao (x, y) — tolerancia: 2px
   - Dimensoes (width, height) — tolerancia: 2px
   - Fill color — match exato hex
   - Texto — match exato
   - Font size/weight — match exato
3. Listar divergencias como correcoes automaticas

---

## PASSO 3 — Planejar correcoes

Montar tabela de correcoes planejadas:

```
| # | Objeto       | Propriedade | Valor Atual | Valor Alvo | Op       |
|---|-------------|-------------|-------------|------------|----------|
| 1 | SearchBar   | y           | 80          | 100        | mod-obj  |
| 2 | badge-ativo | fill-color  | #22C55E     | #1E7A42    | mod-obj  |
| 3 | InfoText    | (novo)      | —           | 14px #888  | add-obj  |
| 4 | OldLabel    | (remover)   | existe      | —          | del-obj  |
```

Exibir tabela ao usuario.

**Se `--dry-run`:** Exibir tabela e PARE aqui sem executar.

---

## PASSO 4 — Auth e executar correcoes

### 4.1 — Login REST

```bash
curl -s -c /tmp/penpot-cookies.txt \
  -X POST "https://dspp.jetme.com.br/api/rpc/command/login-with-password" \
  -H "Content-Type: application/transit+json" \
  -d '["^ ","~:email","clauded@jetme.com.br","~:password","Claude-Desktop"]'
```

### 4.2 — Obter revn

```bash
curl -s -b /tmp/penpot-cookies.txt \
  -X POST "https://dspp.jetme.com.br/api/rpc/command/get-file" \
  -H "Content-Type: application/transit+json" \
  -H "Accept: application/transit+json" \
  -d '["^ ","~:id","~u73c70309-a5e2-8120-8007-c7820d832ea2","~:features",["~#set",["fdata/path-data","design-tokens/v1","variants/v1","layout/grid","components/v2","fdata/shape-data-type","styles/v2","flex/v2","grid/v2","booleans/v2"]]]'
```

### 4.3 — Gerar e enviar changes

Para cada correcao na tabela:

**`mod-obj`** (modificar propriedade):
```
["^ ",
  "~:type", "~:mod-obj",
  "~:id", "~u{OBJECT_ID}",
  "~:page-id", "~u{PAGE_ID}",
  "~:operations", [
    ["^ ", "~:type", "~:set", "~:attr", "~:{propriedade}", "~:val", {valor}]
  ]
]
```

**`add-obj`** (adicionar novo objeto):
Usar helpers `make_rect`/`make_text`/`make_frame` + `add_obj` do pattern de `scripts/penpot-create-org-screens.py`.

**`del-obj`** (remover objeto):
```
["^ ",
  "~:type", "~:del-obj",
  "~:id", "~u{OBJECT_ID}",
  "~:page-id", "~u{PAGE_ID}"
]
```

Enviar via `update-file` com transit body padrao. Incrementar `REVN` apos cada batch.

---

## PASSO 5 — Verificar resultado

### 5.1 — Re-fetch tree

Chamar `mcp__penpot__get_object_tree` novamente com `depth=-1`.
Confirmar que as correcoes foram aplicadas comparando com valores alvos.

### 5.2 — Screenshot "depois"

Chamar `mcp__penpot__export_object` com mesmo frame.
Exibir screenshot "DEPOIS" ao usuario.

---

## PASSO 6 — Relatorio

Emita no chat:

```
## ux-sandbox-fix — Resultado

### Spec
- **Arquivo:** {SPEC_PATH}
- **Frame:** {frame_name}
- **Modo:** {Manual | Auto (--from-spec)}

### Correcoes aplicadas
| # | Objeto | Propriedade | Antes | Depois | Status |
|---|--------|-------------|-------|--------|--------|
| 1 | {obj}  | {prop}      | {old} | {new}  | OK     |

### Screenshots
- **Antes:** (imagem acima)
- **Depois:** (imagem acima)

### Metricas
- Correcoes planejadas: {N}
- Correcoes aplicadas: {N}
- Falhas: {N}

### Proximos passos
- Se mais ajustes: `/ux-sandbox-fix {SPEC_NUMBER} {descricao}`
- Se layout validado: `/ux-apply-layout {SPEC_NUMBER}`
```

---

## Error Handling

| Erro | Causa | Acao |
|---|---|---|
| Frame nao encontrado | Nunca foi criado ou deletado | Executar `/ux-sandbox-create {N}` |
| Objeto alvo nao encontrado | Nome incorreto ou ja removido | Listar objetos existentes no frame |
| mod-obj falhou | Propriedade invalida ou tipo incompativel | Verificar schema Penpot e retry com propriedade correta |
| revn conflict | Edicao concorrente | Re-obter revn e retry |
| Correcao ambigua | Texto manual impreciso | Pedir ao usuario que especifique melhor |

---

## Notas

- O modo `--from-spec` e mais confiavel pois compara dados estruturados. Prefira-o para correcoes sistematicas.
- O modo manual e melhor para ajustes finos que nao estao na spec (ex: "mover 5px para direita").
- Tolerancias no modo auto: 2px para posicao/dimensao, 0 para cor/texto/fonte.
- Se muitas correcoes (>20), considere re-criar o frame com `/ux-sandbox-create` em vez de patching.
