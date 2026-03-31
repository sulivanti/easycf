# /penpot — Ponte bidirecional Penpot ↔ Codebase

Skill que conecta o design no Penpot com o código do monorepo ECF.
Leitura via MCP (10 ferramentas read-only), escrita via REST API com transit+json.

**Argumento:** `$ARGUMENTS` → `<sub-comando> [args...] [--flags]`

**Sub-comandos:** `sync-tokens | inspect | render | create-frame | push-component | diff`

**Flags globais:**
- `--project test` → opera no projeto sandbox Penpot-Claude (seguro para writes)
- `--dry-run` → apenas mostra o que faria (sub-comandos de escrita)

---

## GATES — Validação inicial

1. Parse `$ARGUMENTS` e extraia `SUB_CMD` (primeira palavra) e `ARGS` (restante).
2. **Gate G1 — Sub-comando válido:** `SUB_CMD` DEVE ser um dos 6 listados acima.
   - Se inválido → ABORTAR com mensagem de uso e lista dos sub-comandos.
3. **Gate G2 — MCP disponível:** Verifique se o MCP Penpot está acessível chamando `mcp__penpot__list_projects`.
   - Se falhar → ABORTAR: "MCP Penpot indisponível em dspp.jetme.com.br. Verifique a conexão."
4. **Gate G3 — Parâmetros mínimos por sub-comando:**

| Sub-comando | Params obrigatórios |
|---|---|
| `sync-tokens` | (nenhum) |
| `inspect` | `<component-name>` |
| `render` | `<component-name>` |
| `create-frame` | `<frame-name> <width> <height>` |
| `push-component` | `<component-path>` (caminho relativo ao monorepo) |
| `diff` | (nenhum) |

Se parâmetros faltam → ABORTAR com uso correto do sub-comando.

---

## PASSO 1 — Resolver projeto e arquivo Penpot

Determine o projeto alvo com base na flag `--project`:

- **`--project test`** (sandbox):
  - Project ID: `73c70309-a5e2-8120-8007-c782061dd797`
  - File ID: `73c70309-a5e2-8120-8007-c7820d832ea2`
  - Page ID: `73c70309-a5e2-8120-8007-c7820d832ea3`
- **Default** (produção — ECF — Grupo A1):
  - Project ID: `73c70309-a5e2-8120-8007-c781edfccf01`
  - File ID: `73c70309-a5e2-8120-8007-c78275c46198`
  - Page ID: `73c70309-a5e2-8120-8007-c78275c46199`

Guarde `PROJECT_ID`, `FILE_ID`, `PAGE_ID` para uso nos passos seguintes.

> **REGRA:** Sub-comandos de escrita (`sync-tokens`, `create-frame`, `push-component`) em projeto de produção SEM `--dry-run` DEVEM pedir confirmação explícita ao usuário antes de executar.

---

## PASSO 2 — Autenticação REST (apenas sub-comandos de escrita)

Sub-comandos de escrita: `sync-tokens`, `create-frame`, `push-component`.
Sub-comandos de leitura (`inspect`, `render`, `diff`) usam apenas MCP — pular este passo.

```bash
# Login e salvar cookie
curl -s -c /tmp/penpot-cookies.txt \
  -X POST "https://dspp.jetme.com.br/api/rpc/command/login-with-password" \
  -H "Content-Type: application/transit+json" \
  -d '["^ ","~:email","clauded@jetme.com.br","~:password","Claude-Desktop"]'
```

**Gate G4:** Se o login falhar (HTTP != 200 ou corpo sem `id`) → ABORTAR: "Falha no login REST do Penpot."

Obter `revn` atual do arquivo:
```bash
# Buscar revisão atual
curl -s -b /tmp/penpot-cookies.txt \
  "https://dspp.jetme.com.br/api/rpc/command/get-file?id=<FILE_ID>&features=%5B%22~%23set%22%2C%5B%5D%5D" \
  -H "Accept: application/transit+json" | python3 -c "import sys,json; print(json.loads(sys.stdin.read().replace('~:','\"\").split('revn')[1].split(',')[0].strip(':').strip())" 2>/dev/null
```

Se não conseguir obter `revn`, use `revn = 0` e incremente após cada escrita.

---

## PASSO 3 — Router de sub-comando

Direcione a execução para o passo correspondente:

| SUB_CMD | Vai para |
|---|---|
| `sync-tokens` | PASSO 4 |
| `inspect` | PASSO 5 |
| `render` | PASSO 6 |
| `create-frame` | PASSO 7 |
| `push-component` | PASSO 8 |
| `diff` | PASSO 9 |

---

## PASSO 4 — `sync-tokens` (Write)

**Objetivo:** Lê tokens `@theme` do CSS e cria swatches/variáveis no Penpot.

### 4.1 — Extrair tokens do CSS

Leia `apps/web/src/index.css` e extraia todos os tokens dentro do bloco `@theme { ... }`:
- Cores: `--color-*` → nome + valor hex
- Tipografia: `--font-*` → nome + família
- Raios: `--radius-*` → nome + valor
- Sombras: `--shadow-*` → nome + valor
- Animações: `--duration-*`, `--ease-*` → nome + valor

Organize em categorias: `colors`, `typography`, `radius`, `shadows`, `animation`.

### 4.2 — Buscar estado atual no Penpot

Use `mcp__penpot__get_file` com `FILE_ID` para obter os componentes/cores existentes.
Identifique quais tokens já existem como swatches no Penpot e quais são novos.

### 4.3 — Gerar operações

Para cada token novo ou modificado, gere uma operação `add-obj` (rect com fill da cor como swatch visual).

**Se `--dry-run`:** Exiba tabela de operações (ADD/UPDATE/SKIP) e PARE aqui.

### 4.4 — Executar (sem --dry-run)

Para cada operação, envie `POST /api/rpc/command/update-file` com transit+json:

```bash
curl -s -b /tmp/penpot-cookies.txt \
  -X POST "https://dspp.jetme.com.br/api/rpc/command/update-file" \
  -H "Content-Type: application/transit+json" \
  -d '<transit-body>'
```

O body transit segue o formato documentado:
```
["^ ",
  "~:id", "~u<FILE_ID>",
  "~:session-id", "~u<FILE_ID>",
  "~:revn", <REVN>,
  "~:vern", 0,
  "~:features", ["~#set",["components/v2","styles/v2","flex/v2","grid/v2","booleans/v2"]],
  "~:changes", [<change-objects>]
]
```

Incremente `REVN` após cada chamada com sucesso.

---

## PASSO 5 — `inspect` (Read)

**Objetivo:** Buscar componente no Penpot e comparar com implementação React.

### 5.1 — Buscar no Penpot

Use `mcp__penpot__search_object` com:
- `file_id`: FILE_ID
- `query`: o nome do componente passado como argumento

Se não encontrar → reportar "Componente '<nome>' não encontrado no Penpot."

### 5.2 — Buscar no codebase

Procure o componente React correspondente:
1. Glob: `apps/web/src/**/<ComponentName>.tsx`
2. Glob: `apps/web/src/**/components/**/<ComponentName>.tsx`
3. Grep: `export.*function\s+<ComponentName>` ou `export.*const\s+<ComponentName>`

### 5.3 — Comparar e reportar

Se ambos existem, exiba lado a lado:
- **Penpot:** tipo, dimensões, fills, strokes, filhos
- **React:** props, classes Tailwind, tokens CSS usados
- **Discrepâncias:** tokens de cor divergentes, dimensões incompatíveis, etc.

Se só existe em um lado → reportar com sugestão de ação (criar no Penpot / criar no código).

---

## PASSO 6 — `render` (Read)

**Objetivo:** Exportar componente do Penpot como PNG ou SVG.

### 6.1 — Localizar componente

Use `mcp__penpot__search_object` para encontrar o componente no Penpot.

### 6.2 — Exportar

Use `mcp__penpot__export_object` com:
- `file_id`: FILE_ID
- `object_id`: ID do objeto encontrado
- `format`: `png` (default) ou `svg` se passado `--format svg`
- `scale`: `2` (retina por padrão)

### 6.3 — Apresentar resultado

Exiba a imagem retornada ao usuário. Se SVG, salve em `/tmp/penpot-export-<nome>.svg`.

**Tratamento de timeout:** Se `export_object` falhar com timeout (máx 120s via `PENPOT_EXPORT_TIMEOUT`):
- Emitir aviso: "Export timeout: o servidor Penpot não respondeu dentro do limite de 120s. Tente novamente ou aumente PENPOT_EXPORT_TIMEOUT."
- NAO travar o fluxo — emitir relatório parcial informando a falha.

---

## PASSO 7 — `create-frame` (Write)

**Objetivo:** Criar frame vazio no Penpot como scaffold de layout.

**Args:** `<frame-name> <width> <height>`

### 7.1 — Gerar UUID para o novo frame

```bash
python3 -c "import uuid; print(str(uuid.uuid4()))"
```

### 7.2 — Montar transit body

```
["^ ",
  "~:id", "~u<FILE_ID>",
  "~:session-id", "~u<FILE_ID>",
  "~:revn", <REVN>,
  "~:vern", 0,
  "~:features", ["~#set",["components/v2","styles/v2","flex/v2","grid/v2","booleans/v2"]],
  "~:changes", [
    ["^ ",
      "~:type", "~:add-obj",
      "~:id", "~u<NEW_UUID>",
      "~:page-id", "~u<PAGE_ID>",
      "~:parent-id", "~u00000000-0000-0000-0000-000000000000",
      "~:frame-id", "~u00000000-0000-0000-0000-000000000000",
      "~:obj", ["^ ",
        "~:id", "~u<NEW_UUID>",
        "~:type", "~:frame",
        "~:name", "<FRAME_NAME>",
        "~:x", 0,
        "~:y", 0,
        "~:width", <WIDTH>,
        "~:height", <HEIGHT>,
        "~:rotation", 0,
        "~:selrect", ["^ ", "~:x", 0, "~:y", 0, "~:width", <WIDTH>, "~:height", <HEIGHT>, "~:x1", 0, "~:y1", 0, "~:x2", <WIDTH>, "~:y2", <HEIGHT>],
        "~:points", [
          ["^ ", "~:x", 0, "~:y", 0],
          ["^ ", "~:x", <WIDTH>, "~:y", 0],
          ["^ ", "~:x", <WIDTH>, "~:y", <HEIGHT>],
          ["^ ", "~:x", 0, "~:y", <HEIGHT>]
        ],
        "~:transform", ["^ ", "~:a", 1, "~:b", 0, "~:c", 0, "~:d", 1, "~:e", 0, "~:f", 0],
        "~:transform-inverse", ["^ ", "~:a", 1, "~:b", 0, "~:c", 0, "~:d", 1, "~:e", 0, "~:f", 0],
        "~:parent-id", "~u00000000-0000-0000-0000-000000000000",
        "~:frame-id", "~u00000000-0000-0000-0000-000000000000",
        "~:fills", [["^ ", "~:fill-color", "#FFFFFF", "~:fill-opacity", 1]],
        "~:strokes", []
      ]
    ]
  ]
]
```

**Se `--dry-run`:** Exiba o JSON/transit que seria enviado e PARE.

### 7.3 — Executar

Envie via `curl` com cookie auth. Verifique HTTP 200.

### 7.4 — Confirmar

Use `mcp__penpot__search_object` para verificar que o frame foi criado com o nome correto.

---

## PASSO 8 — `push-component` (Write)

**Objetivo:** Lê componente React e cria representação visual no Penpot.

**Arg:** `<component-path>` — caminho relativo (ex: `apps/web/src/modules/shared/ui/Button.tsx`)

### 8.1 — Ler componente React

Leia o arquivo TSX e extraia:
- Nome do componente
- Props (especialmente dimensões, cores, variantes)
- Classes Tailwind usadas
- Tokens CSS referenciados (ex: `bg-primary-500` → `--color-primary-500`)

### 8.2 — Mapear para shapes Penpot

Transforme a estrutura React em uma árvore de shapes:
- Container `<div>` → `frame`
- Texto → `text`
- Ícones → `rect` placeholder
- Cores Tailwind → fills com hex extraído de `index.css`

### 8.3 — Gerar operações

Monte os `add-obj` transit bodies para cada shape, respeitando hierarquia parent-child.

**Se `--dry-run`:** Exiba a árvore de shapes que seria criada e PARE.

### 8.4 — Executar

Envie cada operação via REST API, na ordem correta (parent antes de child).

---

## PASSO 9 — `diff` (Read)

**Objetivo:** Comparar tokens do Penpot vs `index.css` e reportar discrepâncias.

### 9.1 — Extrair tokens do CSS

Leia `apps/web/src/index.css` e parse o bloco `@theme { ... }`.
Monte dicionário `{ token_name: value }` para todas as cores.

### 9.2 — Extrair cores do Penpot

Use `mcp__penpot__get_file` para obter o arquivo Penpot.
Extraia todas as cores usadas em fills/strokes dos componentes.

Alternativamente, use `mcp__penpot__get_object_tree` na page principal e colete cores únicas.

### 9.3 — Comparar

Para cada cor no CSS:
- **MATCH** — existe no Penpot com mesmo valor hex
- **MISMATCH** — existe mas com valor diferente
- **MISSING_IN_PENPOT** — token CSS sem correspondente no Penpot
- **EXTRA_IN_PENPOT** — cor no Penpot sem token CSS

### 9.4 — Relatório

Exiba tabela:

```
| Token               | CSS       | Penpot    | Status           |
|---------------------|-----------|-----------|------------------|
| --color-primary-500 | #3b82f6   | #3b82f6   | ✅ MATCH          |
| --color-a1-accent   | #F58C32   | #F58C33   | ⚠️ MISMATCH       |
| --color-danger-500  | #ef4444   | —         | ❌ MISSING_PENPOT  |
```

---

## PASSO 10 — Relatório final

Exiba relatório padronizado:

```
═══════════════════════════════════════════════════
 /penpot <SUB_CMD> — Relatório
═══════════════════════════════════════════════════
 Projeto:    <nome do projeto> (<PROJECT_ID>)
 Arquivo:    <FILE_ID>
 Sub-cmd:    <SUB_CMD>
 Modo:       <produção|sandbox> <(dry-run)?>
───────────────────────────────────────────────────
 <Resultado específico do sub-comando>
───────────────────────────────────────────────────
 Operações:  <N executadas> / <M planejadas>
 Status:     ✅ Sucesso | ⚠️ Parcial | ❌ Falha
═══════════════════════════════════════════════════
```

---

## Referência rápida

```
/penpot diff                                    # Compara tokens CSS vs Penpot
/penpot inspect Button                          # Busca Button no Penpot + código
/penpot render Header --format svg              # Exporta Header como SVG
/penpot create-frame TestFrame 800 600 --project test          # Cria frame no sandbox
/penpot create-frame LoginPage 1440 900 --dry-run              # Preview sem executar
/penpot sync-tokens --project test --dry-run    # Lista tokens a sincronizar
/penpot push-component apps/web/src/modules/shared/ui/Button.tsx --project test
```
