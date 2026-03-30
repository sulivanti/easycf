# Skill: ux-apply-layout

Aplica layout UX validado no sandbox ao codebase React via amendments. NUNCA edita codigo direto.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `ux-apply-layout`

> **Pipeline UX Sandbox:** Esta skill e o PASSO 3 (final) do pipeline. Prerequisitos: `/ux-sandbox-create` + `/ux-sandbox-fix` (se necessario). Invoca internamente `/create-amendment`.

## Argumento

$ARGUMENTS deve conter o **numero da spec** (ex: `10`) ou **path completo** (ex: `docs/03_especificacoes/ux/10-org-tree-spec.md`).

Flags opcionais:
- `--dry-run` — mostra amendment que seria criado sem efetivamente cria-lo
- `--skip-penpot-check` — pula verificacao de frames no sandbox

---

## Gates

### Gate 1 — Spec file existe

```text
Resolver spec a partir de $ARGUMENTS:
├── Numero (ex: "10") → glob docs/03_especificacoes/ux/{N}-*-spec.md
├── Path completo     → verificar arquivo existe
└── Nenhum match      → ABORTE: "Spec nao encontrada. Use numero (ex: 10) ou path completo."
```

Guarde `SPEC_PATH`, `SPEC_NUMBER`, `REF_PATH` (substituir -spec.md por -ref.html).

### Gate 2 — Modulo identificado

```text
Ler header da spec → campo "Modulo" (ex: "MOD-003")
├── MOD-NNN encontrado → Derivar MOD_DIR: docs/04_modules/mod-{NNN}-{nome}/
│   ├── MOD_DIR existe → Guarde MOD_ID, MOD_DIR
│   └── Nao existe     → ABORTE: "Diretorio do modulo {MOD_ID} nao encontrado."
└── Nao encontrado     → ABORTE: "Header da spec nao contem campo Modulo."
```

### Gate 3 — UX requirement existe

```text
Buscar UX requirement em {MOD_DIR}/requirements/ux/UX-*.md
├── Encontrado → Guarde UX_REQ_PATH e UX_REQ_ID (ex: "UX-001")
└── Nao encontrado → ABORTE: "Nenhum UX requirement encontrado em {MOD_DIR}/requirements/ux/."
```

### Gate 4 — Estado do UX requirement

```text
Ler estado_item do UX_REQ_PATH:
├── READY  → Prossiga com amendment (esta skill)
├── DRAFT  → ABORTE: "UX requirement em DRAFT. Use /update-specification para enriquecer."
├── MERGED → WARN: "UX req ja foi mergeado. Criar novo amendment sobre versao atual? (s/n)"
└── Outro  → ABORTE: "Estado {estado} nao suportado para apply-layout."
```

### Gate 5 — Sandbox validado (se nao --skip-penpot-check)

```text
Se --skip-penpot-check → Pular este gate
Senao:
  Extrair frame name do header da spec
  Chamar mcp__penpot__search_object no sandbox (file_id: 73c70309-a5e2-8120-8007-c7820d832ea2)
  ├── Frame encontrado → OK, sandbox validado
  └── Nao encontrado   → WARN: "Frame nao encontrado no sandbox. Aplicar mesmo assim? (s/n)"
      ├── s → Prossiga
      └── n → ABORTE: "Execute /ux-sandbox-create {N} primeiro."
```

---

## PASSO 1 — Analisar spec

Ler `SPEC_PATH` e `REF_PATH` completos. Extrair:

### 1.1 — Componentes (secao 8 ou estrutura geral)

Para cada componente/elemento na spec, classificar:

| Componente | Classificacao | Criterio |
|---|---|---|
| NEW | Nao existe no codebase | Grep `export.*{Nome}` retorna vazio |
| UPDATE | Existe mas layout difere | Componente existe, props ou estrutura mudam |
| EXISTING | Existe e nao muda | Componente existe e e reutilizado as-is |

### 1.2 — Layout ASCII art

Construir representacao ASCII do layout principal, como em `UX-001-M01.md`:

```
ContentArea (WxH, fill #XXX)
  PainelA (Wpx, fill #YYY, border-right 1px #ZZZ)
    ElementoA + ElementoB + ...
  PainelB (flex, fill #WWW, padding Npx)
    CardA + CardB + ...
```

### 1.3 — Tokens e tipografia

Extrair da spec:
- Cores usadas: nome semantico + hex
- Tipografia: contexto + weight + size + color
- Radius, spacing, shadows relevantes

---

## PASSO 2 — Analisar React atual

### 2.1 — Identificar page component

A partir da `rota` da spec (ex: `/organizacao`):

1. Buscar em `apps/web/src/routes/` o arquivo de rota correspondente
2. Identificar o page component importado
3. Ler o page component completo

### 2.2 — Comparar layout

Comparar estrutura JSX atual com element tree da spec:

```
| Aspecto        | React Atual         | Spec                | Gap          |
|----------------|---------------------|---------------------|--------------|
| Layout         | Lista flat          | Split-panel         | NOVO         |
| Detail panel   | Nao existe          | Cards + metricas    | NOVO         |
| Form           | Pagina separada     | Panel inline        | RESTRUTURAR  |
| SearchBar      | No header           | Dentro do tree      | MOVER        |
```

Guardar gaps como `LAYOUT_GAPS`.

---

## PASSO 3 — Ler manifest (informacional)

```text
1. Ler header da spec → campo "Manifest" (ex: "ux-org-001.org-tree.yaml")
2. Se encontrado → Glob: docs/05_manifests/screens/{manifest_name}
3. Se nao encontrado no header → Glob por nome semantico:
   docs/05_manifests/screens/*{nome_tela_sem_numero}*.*
   (ex: spec "10-org-tree" → glob "*org-tree*")
├── Encontrado → Comparar componentes declarados vs spec. Flaggar divergencias.
└── Nao encontrado → INFO: "Manifest nao encontrado. Nao bloqueante."
```

> **Nota:** Manifests usam IDs semanticos (ex: `ux-org-001.org-tree.yaml`), NAO numeros de spec.

---

## PASSO 4 — Compor Detalhamento do amendment

Seguir formato de `UX-001-M01.md` (exemplo real). O detalhamento deve conter:

### 4.1 — Secoes DN

Para cada grupo logico de mudancas, criar secao `### DN — Titulo`:

- **D1 — Layout principal:** ASCII art do layout com dimensoes, fills, borders
- **D2..DN — Componentes novos/modificados:** Detalhamento de cada componente
  - Nome e tipo (card, panel, modal, etc.)
  - Dimensoes e posicao
  - Sub-elementos com tipografia e cores exatas
  - Comportamento (scroll, hover, active states)

### 4.2 — Formato de cada componente

```markdown
### DN — NomeComponente (novo componente | atualizado)

O {Componente} DEVE {comportamento}:

\```
ComponenteContainer (WxH, fill #XXX, radius Npx, border ...)
  Header (WxH, ...)
    Icone (WxH, fill #XXX) + Titulo (Npx Wpx #XXX)
  Body (flex:1, padding Npx)
    {sub-elementos}
  Footer (WxH, ...)
    BotaoA (secondary) + BotaoB (primary fill #XXX)
\```

- Propriedade: valor exato
- Comportamento: descricao
```

### 4.3 — Componente compartilhado

Se a spec define componentes reutilizaveis (ex: `ReadOnlyField`), documentar:
- Path sugerido: `apps/web/src/modules/shared/ui/{Nome}.tsx`
- Props: lista de props com tipos
- Diferenca visual vs componentes existentes similares

---

## PASSO 5 — Compor Impacto nos Pilares

Analisar spec e layout gaps para determinar impacto em outros pilares:

### 5.1 — DATA

```text
Componentes novos requerem campos nao existentes no schema?
├── SIM → DATA-{ID}-M{N} necessario: listar campos novos
└── NAO → Sem impacto DATA
```

### 5.2 — FR

```text
Componentes novos requerem endpoints nao existentes?
├── SIM → FR-{ID}-M{N} necessario: listar endpoints novos
└── NAO → Sem impacto FR
```

### 5.3 — Manifests

```text
Screen manifest precisa de atualizacao?
├── SIM → Listar componentes a adicionar/modificar no manifest
└── NAO → Sem impacto manifests
```

### 5.4 — Outros pilares

Verificar: BR (regras novas?), SEC (scopes novos?), NFR (performance?).

Compor secao "Impacto nos Pilares" no formato:

```markdown
## Impacto nos Pilares

- **DATA:** {impacto ou "Sem impacto"}
- **FR:** {impacto ou "Sem impacto"}
- **UX (manifests):** {impacto ou "Sem impacto"}
- **BR:** {impacto ou "Sem impacto"}
- **SEC:** {impacto ou "Sem impacto"}
```

---

## PASSO 6 — Criar amendment

### 6.1 — Montar parametros

Preparar argumentos para `/create-amendment`:
- **Pilar:** `ux`
- **Natureza:** `M` (Melhoria — novo layout e nova estrutura)
- **Documento base:** `{UX_REQ_PATH}`
- **Motivacao:** "Alinhar componentes React de {rota} com designs validados no Penpot ({frame_name} {score}%). {resumo dos gaps principais}."
- **rastreia_para:** `{SPEC_PATH}`, `{REF_PATH}`, frame Penpot `{frame_name}`, manifest (se existir)
- **Detalhamento:** Conteudo composto nos PASSOs 4-5

**Se `--dry-run`:** Exibir preview do amendment completo e PARE aqui.

```
## ux-apply-layout — Preview (--dry-run)

### Amendment que seria criado:
- ID: {UX_REQ_ID}-M{NN}
- Path: {MOD_DIR}/amendments/ux/{UX_REQ_ID}-M{NN}.md
- Documento base: {UX_REQ_PATH}

### Detalhamento preview:
{conteudo D1..DN}

### Impacto nos Pilares:
{conteudo}
```

### 6.2 — Invocar /create-amendment

Internamente, execute o workflow de `/create-amendment` com os parametros montados:
- O create-amendment cuida de: numeracao sequencial, criacao do arquivo, amarracao no manifesto, bump no CHANGELOG
- NAO duplique a logica — delegue completamente

### 6.3 — Verificar resultado

Confirmar que o arquivo de amendment foi criado no path esperado.

---

## PASSO 7 — Relatorio

Emita no chat:

```
## ux-apply-layout — Resultado

### Amendment criado
- **ID:** {amendment_id}
- **Path:** {amendment_path}
- **Documento base:** {UX_REQ_ID} ({UX_REQ_PATH})
- **Natureza:** M (Melhoria)

### Componentes
| Componente | Classificacao | Acao |
|---|---|---|
| {nome} | NEW | Criar componente |
| {nome} | UPDATE | Modificar layout |
| {nome} | EXISTING | Reutilizar |

### Impacto nos Pilares
- DATA: {status}
- FR: {status}
- Manifests: {status}

### Pipeline status
- /ux-sandbox-create {N} — OK (frames no Penpot)
- /ux-sandbox-fix {N} — {OK | N/A}
- /ux-apply-layout {N} — OK (amendment criado)
- Proximo: {acao}
```

### Proximo passo

```text
Amendment tem impacto transversal (outros pilares)?
├── SIM → "Execute /cascade-amendment {amendment_path} para criar amendments derivados"
└── NAO → "Execute /merge-amendment {amendment_path} para aplicar no documento base"
```

Apos merge, o pipeline continua com `/codegen` para gerar codigo.

---

## Error Handling

| Erro | Causa | Acao |
|---|---|---|
| Spec nao encontrada | Numero ou path invalido | Listar specs disponiveis |
| Modulo nao identificado | Header da spec sem campo Modulo | Pedir ao usuario que indique MOD-NNN |
| UX req em DRAFT | Nao foi enriquecido ainda | Sugerir `/enrich {MOD_DIR}` ou `/update-specification` |
| Amendment ja existe com mesmo escopo | Execucao anterior | Verificar amendments existentes e oferecer incrementar sequencial |
| /create-amendment falhou | Gate interno falhou | Reportar erro do create-amendment |

---

## Notas

- Esta skill NUNCA edita codigo React diretamente (regra: `feedback_no_direct_edits.md`). Toda alteracao passa por amendment → merge → codegen.
- O detalhamento do amendment deve ter qualidade suficiente para que `/codegen` gere codigo correto sem ambiguidade.
- Use valores exatos da spec (hex, px, weights) — nao arredonde ou simplifique.
- Se a spec tem multiplas variantes (ex: OrgTree + OrgForm), inclua todas no mesmo amendment (mesma UX requirement).
- O campo `rastreia_para` e critico para auditoria — sempre inclua spec, ref.html, e frame Penpot.
