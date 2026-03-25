# Skill: cascade-amendment

Analisa o "Impacto nos Pilares" de um amendment e identifica/cria amendments derivados para os pilares e módulos afetados. Roda entre `/create-amendment` e `/merge-amendment`.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `cascade-amendment`

## Relação com o ciclo de amendments

| Etapa | Skill | O que faz |
|---|---|---|
| 1. Criar emenda | `/create-amendment` | Cria arquivo de amendment sem tocar o base |
| 2. Analisar cascata | `/cascade-amendment` (esta skill) | Identifica pilares afetados e cria amendments derivados |
| 3. Aplicar emenda | `/merge-amendment` | Incorpora conteúdo no base e sela o amendment |

## Quando usar

Após criar um amendment (qualquer natureza M/C/R) cuja seção "Impacto nos Pilares" liste ações concretas em outros pilares ou módulos. O `/create-amendment` sugere automaticamente esta skill quando detecta impacto transversal.

> **Nota:** Não é obrigatório para amendments self-contained (impacto apenas no próprio pilar). O `/merge-amendment` Gate 6 avisa se cascade foi pulado quando havia impacto transversal.

## Argumento

$ARGUMENTS deve conter:
1. Caminho do arquivo de amendment (obrigatório)
2. Flag `--execute` (opcional): cria os amendments derivados automaticamente. Sem ela, apenas emite relatório.

## PASSO 1: Leitura e Parsing do Amendment Pai

1. Leia o arquivo de amendment completo
2. Valide: `estado_item` deve ser DRAFT ou APPROVED (não MERGED/REJECTED)
3. Extraia:
   - ID do amendment (campo título)
   - Natureza (M/C/R)
   - Seção "Impacto nos Pilares" completa
   - Seção "Detalhamento" completa (para derivar conteúdo)
   - Campo `rastreia_para` (para propagar)

## PASSO 2: Classificação de Impactos

Para cada pilar/módulo listado em "Impacto nos Pilares":

### 2.1 Identificação

1. Identifique o pilar (FR, BR, SEC, DATA, INT, UX, NFR, ADR)
2. Identifique o(s) módulo(s) afetados:
   - Campo "Módulos impactados" se presente
   - Inferência pelo prefixo do pilar (FR-000 → mod-000, SEC-001 → mod-001)
   - Se normativo transversal → pode afetar múltiplos módulos
3. Resolva o caminho do documento-alvo:
   - Para pilares de módulo: `docs/04_modules/mod-{NNN}-{name}/requirements/{pilar}/{PILAR}-{NNN}.md`
   - Para normativos: `docs/01_normativos/{filename}.md`

### 2.2 Classificação da ação

Analise o texto da "Ação requerida" para classificar:

```text
Texto contém:
├── "Atualizar", "Adicionar", "Criar", "Modificar", "Corrigir", "Alinhar", "Incorporar"
│   → FORMAL: precisa de amendment próprio no pilar
├── "Verificar", "Avaliar", "Confirmar", "Revisar", "Considerar"
│   → REVIEW: revisão humana necessária (sem amendment automático)
└── "Nenhum impacto", "Já referencia", "Inalterado", "Remover workarounds"
    → INFORMATIONAL: sem ação necessária
```

### 2.3 Verificação do estado do doc-alvo

Para cada impacto FORMAL:

```text
estado_item do doc-alvo?
├── DRAFT  → Não precisa de amendment (editar diretamente)
│            Registre como: "DIRETO — editar {PILAR}-{NNN} via /update-specification"
├── READY  → Precisa de amendment formal
│            Registre como: "FORMAL — /create-amendment {PILAR}-{NNN}"
└── Não existe → Registre como: "AUSENTE — doc {PILAR}-{NNN} não encontrado"
```

### 2.4 Herança de natureza

A natureza do amendment derivado HERDA do pai, com ajuste:

| Pai | Ação no pilar derivado | Natureza derivada |
|-----|------------------------|-------------------|
| M (Melhoria) | Qualquer | M |
| C (Correção) | Mesma correção propagada | C |
| C (Correção) | Adiciona algo novo | M |
| R (Revisão) | Reestruturação no pilar | R |
| R (Revisão) | Adiciona conteúdo novo | M |

> **Regra:** Se a ação no pilar derivado é "adicionar" algo que não existia antes, a natureza é M mesmo que o pai seja R ou C.

## PASSO 3: Relatório de Cascata

Emita tabela com TODOS os impactos:

```markdown
## Relatório de Cascata — {amendment-pai-ID}

| # | Pilar | Módulo | Doc Alvo | Estado Doc | Tipo | Nat. | Ação |
|---|-------|--------|----------|------------|------|------|------|
| 1 | NFR | mod-000 | NFR-000 | READY | FORMAL | M | /create-amendment NFR-000 M "..." |
| 2 | FR | mod-000 | FR-000 | READY | FORMAL | M | /create-amendment FR-000 M "..." |
| 3 | SEC | mod-000 | SEC-000 | DRAFT | DIRETO | — | /update-specification SEC-000 "..." |
| 4 | BR | mod-001 | BR-001 | READY | REVIEW | — | Verificar se hierarquia RBAC impactada |
| 5 | DATA | mod-000 | DATA-000 | READY | INFO | — | Nenhuma mudança no schema |

### Resumo
- **FORMAL:** {N} amendments derivados necessários
- **DIRETO:** {N} edições diretas (docs DRAFT)
- **REVIEW:** {N} revisões humanas
- **INFORMATIONAL:** {N} sem ação

Execute com `--execute` para criar os amendments FORMAL automaticamente.
```

## PASSO 4: Execução (somente com --execute)

### 4.1 Para cada entrada FORMAL com doc-alvo READY

Invoque internamente `/create-amendment` com:
- **Pilar e ID:** do doc-alvo (ex: NFR-000)
- **Natureza:** conforme §2.4
- **Motivação:** composta de:
  - Referência ao amendment pai
  - Texto da "Ação requerida" do pai para este pilar
- **rastreia_para:** inclui o amendment pai + referências do pai relevantes a este pilar
- **Novo campo no header:**
  ```markdown
  - **Derivado de:** [{parent-ID}]({link relativo ao amendment pai})
  ```

### 4.2 Detalhamento do derivado

O Detalhamento é construído assim:

```markdown
## Detalhamento

> **Contexto:** Este amendment deriva de [{parent-ID}]({link}).
> Consulte o amendment pai para o contexto completo da alteração.

### Alterações neste pilar

{conteúdo extraído — ver regras abaixo}
```

**Regras de extração do conteúdo:**

1. **Se o Detalhamento do pai tem seções que mencionam explicitamente este pilar**
   (ex: "Alteração no OpenAPI" para INT, "Novo schema" para DATA):
   → Copie essas seções verbatim

2. **Se o pai menciona o pilar apenas na "Ação requerida" sem detalhe específico:**
   → Transcreva a ação como requisito:
   ```markdown
   **Ação derivada:** {texto da "Ação requerida"}

   <!-- TODO: detalhar as alterações específicas neste pilar -->
   ```

3. **Se o pai é uma Correção (C) e o pilar precisa da mesma correção:**
   → Copie o dado corrigido e indique o valor antigo vs novo:
   ```markdown
   **Correção propagada:** {descrição da correção}
   - Valor anterior: {x}
   - Valor correto: {y}
   - Referência: {parent-ID} §{seção}
   ```

### 4.3 Para entradas DIRETO (doc DRAFT)

Não cria amendment. Emite instrução:

```
Pilar {X} do {MOD-NNN}: doc em DRAFT — editar diretamente.
Comando sugerido: /update-specification {PILAR}-{NNN} "Alinhamento com {parent-ID}: {ação}"
```

## PASSO 5: Atualização do Amendment Pai

Se amendments derivados foram criados (modo --execute):

1. Adicione seção ao final do amendment pai (antes de "Resolução do Merge" se existir):

```markdown
---

## Amendments Derivados

| ID | Pilar | Módulo | Natureza | Estado |
|---|---|---|---|---|
| {derivado-ID} | {pilar} | {mod-NNN} | {M/C/R} | DRAFT |
```

2. Se houve entradas DIRETO (docs DRAFT), registre também:

```markdown
### Edições Diretas (docs DRAFT)

| Pilar | Módulo | Doc | Ação |
|---|---|---|---|
| {pilar} | {mod-NNN} | {PILAR}-{NNN} | /update-specification {PILAR}-{NNN} "..." |
```

## Passo Final: Comunicação

Responda com:
- Tabela completa de cascata (todos os impactos classificados)
- Amendments derivados criados (se --execute), com links
- Edições diretas sugeridas (docs DRAFT)
- Revisões humanas pendentes (REVIEW)
- Próximos passos recomendados:
  1. Revisar derivados criados (enriquecer Detalhamento se contém `<!-- TODO -->`)
  2. Ordem de merge: pai primeiro (normativo/origem), depois derivados (pilares)
  3. `/validate-all` nos módulos impactados após todos os merges
- Se `rastreia_para` do pai inclui PENDENTE-NNN:
  lembrar de verificar/atualizar o status da pendência
