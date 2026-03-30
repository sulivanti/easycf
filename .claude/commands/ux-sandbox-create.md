# Skill: ux-sandbox-create

Recebe uma spec UX (`*-spec.md` + `*-ref.html`) e cria frames no Penpot sandbox.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `ux-sandbox-create`

> **Pipeline UX Sandbox:** Esta skill e o PASSO 1 do pipeline. Apos validacao visual, use `/ux-sandbox-fix` para correcoes e `/ux-apply-layout` para aplicar ao codebase.

## Argumento

$ARGUMENTS deve conter o **numero da spec** (ex: `10`) ou **path completo** (ex: `docs/03_especificacoes/ux/10-org-tree-spec.md`).

Flags opcionais:
- `--dry-run` — mostra operacoes planejadas sem executar no Penpot

---

## Gates

### Gate 1 — Spec file existe

```text
Resolver spec a partir de $ARGUMENTS:
├── Numero (ex: "10") → glob docs/03_especificacoes/ux/{N}-*-spec.md
├── Path completo     → verificar arquivo existe
└── Nenhum match      → ABORTE: "Spec nao encontrada. Use numero (ex: 10) ou path completo."
```

Guarde `SPEC_PATH` e `SPEC_NUMBER` (ex: `10`).

### Gate 2 — Ref HTML correspondente existe

```text
Derivar ref path: substituir "-spec.md" por "-ref.html" no SPEC_PATH
├── Existe   → Guarde REF_PATH
└── Nao      → ABORTE: "Ref HTML nao encontrado: {esperado}. Crie-o primeiro."
```

### Gate 3 — MCP Penpot disponivel

```text
Chamar mcp__penpot__list_projects
├── Sucesso → Prossiga
└── Falha   → ABORTE: "MCP Penpot indisponivel em dspp.jetme.com.br. Verifique conexao."
```

### Gate 4 — Frame nao duplicado no sandbox

```text
Extrair frame name do header da spec (ex: "10-OrgTree")
Chamar mcp__penpot__search_object com file_id sandbox e query=frame_name
├── Nao encontrado → Prossiga
├── Encontrado     → WARN: "Frame '{nome}' ja existe no sandbox. Re-criar? (s/n)"
│   ├── s → Prossiga (vai sobrescrever)
│   └── n → ABORTE
```

---

## PASSO 1 — Parse Spec

Leia `SPEC_PATH` e extraia:

1. **Metadata** do header:
   - `rota` (ex: `/organizacao`)
   - `modulo` (ex: `MOD-001`)
   - `frame_name` (ex: `10-OrgTree`)
   - `viewport` (ex: `1440 x 900`)
   - `font` (ex: `Plus Jakarta Sans`)

2. **Cores** (secao 3):
   - Mapa `{nome_semantico: hex}` (ex: `TREE SELECTED BG: #E3F2FD`)

3. **Tipografia** (secao 4):
   - Lista `{contexto, weight, size, color}` (ex: `"Estrutura de Unidades", 800, 16px, #111111`)

4. **Estrutura de elementos** (secoes 5-6):
   - Element tree hierarquico: frames, rects, texts com dimensoes e fills
   - Preservar hierarquia parent-child

5. **Componentes** (secao 8, se existir):
   - Componentes compartilhados referenciados (ex: `ReadOnlyField`, `SearchBar`)

6. **Variantes** (secao 9, se existir):
   - Lista de variantes/estados da tela (ex: `OrgTree`, `OrgForm-Edit`, `OrgForm-Create`)
   - Cada variante = 1 pagina no Penpot (regra: `feedback_penpot_pages.md`)

Guarde tudo em um objeto `SPEC_DATA`.

---

## PASSO 2 — Cross-ref HTML

Leia `REF_PATH` e:

1. Extrair CSS `:root` vars ou inline styles (cores hex usadas)
2. Comparar com cores da spec (`SPEC_DATA.cores`)
3. Flaggar divergencias:

```
| Cor           | Spec     | HTML     | Status    |
|---------------|----------|----------|-----------|
| PRIMARY_BG    | #2E86C1  | #2E86C1  | OK        |
| READONLY_BG   | #F8F8F6  | #F5F5F5  | DIVERGE   |
```

Se houver divergencias, WARN no chat mas nao bloqueie — a spec tem prioridade.

---

## PASSO 3 — Resolver Manifest (informacional)

Buscar screen manifest correspondente em `docs/05_manifests/screens/`:

```text
1. Ler header da spec → campo "Manifest" (ex: "ux-org-001.org-tree.yaml")
2. Se encontrado → Glob: docs/05_manifests/screens/{manifest_name}
3. Se nao encontrado no header → Glob por nome semantico da tela:
   docs/05_manifests/screens/*{nome_tela_sem_numero}*.yaml
   (ex: spec "10-org-tree" → glob "*org-tree*")
├── Encontrado → Ler e listar componentes declarados. Informacional.
└── Nao encontrado → INFO: "Manifest nao encontrado. Nao bloqueante."
```

> **Nota:** Manifests usam IDs semanticos (ex: `ux-org-001.org-tree.yaml`), NAO numeros de spec. Nunca usar `*{spec_number}*` como glob.

---

## PASSO 4 — Auth REST e obter revn

Login Penpot e obter revisao atual do sandbox file.

**IDs do sandbox** (de `penpot.md` PASSO 1):
- Project ID: `73c70309-a5e2-8120-8007-c782061dd797`
- File ID: `73c70309-a5e2-8120-8007-c7820d832ea2`

### 4.1 — Login

```bash
curl -s -c /tmp/penpot-cookies.txt \
  -X POST "https://dspp.jetme.com.br/api/rpc/command/login-with-password" \
  -H "Content-Type: application/transit+json" \
  -d '["^ ","~:email","clauded@jetme.com.br","~:password","Claude-Desktop"]'
```

Se HTTP != 200 → ABORTE: "Falha no login REST do Penpot."

### 4.2 — Obter revn

```bash
curl -s -b /tmp/penpot-cookies.txt \
  -X POST "https://dspp.jetme.com.br/api/rpc/command/get-file" \
  -H "Content-Type: application/transit+json" \
  -H "Accept: application/transit+json" \
  -d '["^ ","~:id","~u73c70309-a5e2-8120-8007-c7820d832ea2","~:features",["~#set",["fdata/path-data","design-tokens/v1","variants/v1","layout/grid","components/v2","fdata/shape-data-type","styles/v2","flex/v2","grid/v2","booleans/v2"]]]'
```

Extrair `revn` do response. Se falhar, use `revn = 0`.

---

## PASSO 5 — Criar Pages

Uma pagina Penpot por variante (regra: cada tela = propria pagina).

Para cada variante em `SPEC_DATA.variantes` (ou pagina unica se nao ha variantes):

### 5.1 — Gerar page UUID

```python
import uuid; page_id = str(uuid.uuid4())
```

### 5.2 — Montar change `add-page`

```
["^ ",
  "~:type", "~:add-page",
  "~:id", "~u{PAGE_ID}",
  "~:name", "{SPEC_NUMBER}-{VarianteName}"
]
```

### 5.3 — Enviar changes

Usar `send_changes` pattern de `scripts/penpot-create-org-screens.py`:

```
["^ ",
  "~:id", "~u{FILE_ID}",
  "~:session-id", "~u{FILE_ID}",
  "~:revn", {REVN},
  "~:vern", 0,
  "~:features", ["~#set",["fdata/path-data","design-tokens/v1","variants/v1","layout/grid","components/v2","fdata/shape-data-type","styles/v2","flex/v2","grid/v2","booleans/v2"]],
  "~:changes", [{add-page-changes}]
]
```

Incrementar `REVN` apos sucesso.

**Se `--dry-run`:** Listar paginas que seriam criadas e nao enviar.

---

## PASSO 6 — Gerar transit ops para elementos

Caminhar element tree depth-first e mapear para operacoes `add-obj`.

### 6.1 — Helpers (mesmo pattern de `scripts/penpot-create-org-screens.py`)

Use os seguintes helpers para gerar transit bodies:

- **`make_frame(id, name, x, y, w, h, fill)`** → frame top-level
- **`make_rect(id, name, x, y, w, h, fill, parent, frame, ...)`** → retangulo com fill, strokes, radius
- **`make_text(id, name, x, y, w, h, text, font_size, font_weight, color, parent, frame, ...)`** → texto com fonte
- **`stroke_border(color, width, alignment)`** → stroke solido
- **`stroke_dashed(color, width)`** → stroke tracejado
- **`add_obj(id, parent, frame, obj, page_id)`** → change para adicionar objeto
- **`add_page_change(page_id, name)`** → change para adicionar pagina

### 6.2 — Mapeamento spec → shapes

Para cada elemento no element tree da spec:

| Elemento spec | Shape Penpot | Helper |
|---|---|---|
| Frame/Container com dimensoes | `frame` | `make_frame` |
| Retangulo/Card/Badge/Input | `rect` | `make_rect` |
| Texto (label, titulo, valor) | `text` | `make_text` |
| Separador/Linha | `rect` (h:1) | `make_rect` |
| Icone placeholder | `rect` com fill semantico | `make_rect` |

### 6.3 — Ordem de execucao

1. Frames top-level primeiro (parent=ROOT)
2. Filhos diretos de cada frame
3. Netos recursivamente (depth-first)

Cada `add-obj` change refere `parent-id` e `frame-id` corretos.

### 6.4 — Batch de changes

Agrupar ate 50 `add-obj` por chamada `update-file` para evitar timeouts.

**Se `--dry-run`:** Exibir tabela:

```
| # | Tipo  | Nome                | Parent         | x   | y   | w   | h   | Fill    |
|---|-------|---------------------|----------------|-----|-----|-----|-----|---------|
| 1 | frame | ContentArea         | ROOT           | 0   | 0   | 1200| 836 | #F5F5F3 |
| 2 | rect  | PainelArvore        | ContentArea    | 0   | 0   | 380 | 836 | #FFFFFF |
| 3 | text  | TituloPainel        | PainelArvore   | 20  | 20  | 340 | 24  | #111111 |
```

E PARE aqui sem executar.

---

## PASSO 7 — Verificar criacao

### 7.1 — Search

Para cada frame top-level criado, chamar `mcp__penpot__search_object`:
- `file_id`: `73c70309-a5e2-8120-8007-c7820d832ea2`
- `query`: nome do frame

Confirmar que todos os frames existem.

### 7.2 — Screenshot

Para cada page/variante, chamar `mcp__penpot__export_object`:
- `file_id`: sandbox file ID
- `object_id`: ID do frame top-level
- `format`: `png`
- `scale`: `2`

Exibir screenshots ao usuario para validacao visual.

---

## PASSO 8 — Relatorio

Emita no chat:

```
## ux-sandbox-create — Resultado

### Spec
- **Arquivo:** {SPEC_PATH}
- **Frame:** {frame_name}
- **Viewport:** {viewport}

### Frames criados
| Pagina | Frame | Objetos | Status |
|--------|-------|---------|--------|
| {page} | {frame}| {N}    | OK     |

### Metricas
- Pages criadas: {N}
- Objetos totais: {N}
- Divergencias spec/HTML: {N}

### Proximos passos
- Valide visualmente os screenshots acima
- Se ajustes necessarios: `/ux-sandbox-fix {SPEC_NUMBER}`
- Se layout OK: `/ux-apply-layout {SPEC_NUMBER}`
```

---

## Error Handling

| Erro | Causa | Acao |
|---|---|---|
| Spec nao encontrada | Numero ou path invalido | Listar specs disponiveis em `docs/03_especificacoes/ux/` |
| Login Penpot falhou | Credenciais ou servidor offline | Verificar `dspp.jetme.com.br` acessivel |
| revn desatualizado | Edicao concorrente no sandbox | Re-obter revn e retry |
| Timeout em update-file | Batch muito grande | Reduzir batch para 25 ops |
| Frame ja existe | Execucao anterior | Oferecer re-criar ou usar `/ux-sandbox-fix` |

---

## Notas

- O sandbox Penpot e o projeto `Penpot-Claude` — seguro para escrita sem confirmacao extra.
- Cada variante/estado da tela vai em pagina propria (nunca empilhar frames numa pagina so).
- Os helpers transit+json sao identicos aos de `scripts/penpot-create-org-screens.py` — use-os como referencia.
- Se a spec referencia componentes compartilhados (AppShell, Sidebar), renderize-os como placeholders simplificados (retangulos com nome) para contexto visual, sem replicar toda a complexidade.
