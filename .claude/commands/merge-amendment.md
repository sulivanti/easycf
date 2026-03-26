# Skill: merge-amendment

Aplica (merge) uma emenda aprovada no documento base, incorporando as alterações e selando o amendment como `MERGED`. Inverso do `/create-amendment`: enquanto este cria o amendment sem tocar o base, `/merge-amendment` aplica o conteúdo no base e encerra o ciclo.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `merge-amendment`

## Relação com o ciclo de amendments

| Etapa | Skill | O que faz |
|---|---|---|
| 1. Criar emenda | `/create-amendment` | Cria arquivo de amendment sem tocar o base |
| 2. Analisar cascata | `/cascade-amendment` | Identifica pilares afetados e cria amendments derivados |
| 3. Aplicar emenda | `/merge-amendment` (esta skill) | Incorpora conteúdo no base e sela o amendment |

## Argumento

$ARGUMENTS deve conter o caminho do arquivo de amendment (ex: `docs/04_modules/mod-000-foundation/amendments/sec/DOC-FND-000-M04.md`). Se não fornecido, pergunte ao usuário.

## Gates de Aprovação

### Gate 1 — Amendment Válido

Leia o arquivo de amendment e verifique:

```text
estado_item do amendment?
├── DRAFT        → Pergunte: "Amendment ainda em DRAFT. Deseja aplicar mesmo assim? (confirme para prosseguir)"
├── APPROVED     → Prossiga.
├── MERGED       → ABORTE. Diga: "Amendment já foi aplicado (MERGED)."
├── REJECTED     → ABORTE. Diga: "Amendment foi rejeitado — não pode ser aplicado."
└── Não existe   → ABORTE. Diga: "Arquivo de amendment não encontrado."
```

### Gate 2 — Documento Base

Leia o documento base (campo `Documento base:` no amendment):

```text
Documento base existe?
├── SIM          → Prossiga.
└── NÃO          → ABORTE. Diga: "Documento base não encontrado: {path}"
```

### Gate 3 — Dependências Cross-Módulo

Se o amendment envolve scopes, endpoints ou dependências que afetam outros módulos, consulte `docs/04_modules/DEPENDENCY-GRAPH.md` §3 (Bloqueios) para verificar se há impacto não documentado.

### Gate 4 — Stale Detection

Compare a versão do documento base no momento da criação do amendment vs a versão atual:

```text
Versão do base quando amendment foi criado (campo "Data:" no amendment)
vs versão atual do base (campo "version:" no base)?
├── Mesma versão   → Prossiga.
├── Base foi bumped → AVISE: "O documento base foi atualizado desde a criação deste amendment
│                     (versão {antiga} → {atual}). Pode haver conflitos. Revise o Detalhamento
│                     do amendment contra o base atual antes de aplicar."
│                     Peça confirmação para prosseguir.
└── Impossível determinar → Prossiga com aviso genérico.
```

### Gate 5 — Amendments Concorrentes

Verifique se existem outros amendments DRAFT ou APPROVED para o mesmo documento base.
Para normativos: busque em `docs/01_normativos/amendments/{DOC-ID}/`.
Para requisitos de módulo: busque em `docs/04_modules/mod-NNN/amendments/{pilar}/`.

```text
Outros amendments ativos para o mesmo base?
├── Nenhum         → Prossiga.
├── 1+ encontrados → AVISE: "Existem {N} amendments pendentes para o mesmo documento base:
│                     {lista}. Aplicar este pode conflitar com os demais."
│                     Peça confirmação para prosseguir.
```

### Gate 6 — Cascade Check

Se "Impacto nos Pilares" lista ações concretas em outros pilares/módulos (qualquer natureza M/C/R):

```text
1. Busque amendments derivados (campo "Derivado de:" apontando para este amendment,
   ou rastreia_para contendo o ID deste amendment)
2. Decisão:
   ├── Derivados encontrados → AVISE: "Existem {N} amendments derivados.
   │   Recomenda-se mergear o pai primeiro, depois os derivados."
   ├── Nenhum derivado + ações concretas listadas → AVISE:
   │   "Impacto em {pilares} sem amendments derivados encontrados.
   │    Considere executar /cascade-amendment {path} antes de mergear."
   │   Peça confirmação para prosseguir.
   └── Impacto apenas informativo (sem ações concretas) → Prossiga sem aviso.
```

## Ciclo de Vida do Amendment

```text
DRAFT → APPROVED → MERGED
  │        │
  │        └── REJECTED (fim)
  └── MERGED (merge direto, com confirmação)
```

| Estado | Quem muda | Condição |
|--------|-----------|----------|
| DRAFT | `/create-amendment` | Criação automática |
| APPROVED | Owner/revisor | Revisão manual (edição direta do campo `estado_item`) |
| MERGED | `/merge-amendment` | Aplicação no base |
| REJECTED | Owner/revisor | Edição direta — amendment descartado |

### Naming Convention

**Para requisitos de módulo:** `{Pilar}-{ID}-{Natureza}{Sequencial}.md`

| Componente | Valores | Exemplo |
|------------|---------|---------|
| Pilar | `BR`, `FR`, `DATA`, `SEC`, `INT`, `UX`, `NFR`, `ADR` | `FR` |
| ID | ID do requisito base | `001` |
| Natureza | `M` (Melhoria), `C` (Correção), `R` (Revisão) | `M` |
| Sequencial | Incremento por pilar/ID | `01`, `02` |

Exemplos: `FR-001-M01.md`, `BR-001-C02.md`, `DOC-FND-000-M04.md`

**Para normativos transversais** (`docs/01_normativos/`): `{DOC-ID}-{Natureza}{Sequencial}.md`

| Componente | Valores | Exemplo |
|------------|---------|---------|
| DOC-ID | ID completo do normativo | `DOC-PADRAO-001` |
| Natureza | `M`, `C`, `R` | `M` |
| Sequencial | Incremento por DOC-ID | `01`, `02` |

Exemplos: `DOC-PADRAO-001-M01.md`, `DOC-UX-011-C01.md`, `DOC-GNP-00-M01.md`
Path: `docs/01_normativos/amendments/{DOC-ID}/`

## PASSO 1: Análise do Amendment

1. Leia o arquivo de amendment completo
2. Identifique:
   - **Natureza:** M (Melhoria), C (Correção), R (Revisão)
   - **Seção(ões) do base afetadas** (indicadas no Detalhamento)
   - **Pilares impactados** (seção "Impacto nos Pilares")
3. Leia o documento base nas seções relevantes

## PASSO 2: Aplicação no Documento Base

1. **Edite o documento base** incorporando as alterações descritas no amendment
2. Siga o estilo e formato existente no documento base — não altere estrutura
3. Se o amendment adiciona itens a uma tabela/catálogo, insira na posição correta (ordem alfabética, por módulo, etc.)
4. **Bump de versão** no documento base:
   - `M` (Melhoria) → bump **Minor** (1.x.0)
   - `C` (Correção) → bump **Patch** (1.0.x)
   - `R` (Revisão) → bump **Patch** (1.0.x)
5. Atualize `data_ultima_revisao` no documento base

## PASSO 3: Selar o Amendment

1. Altere `estado_item` no amendment: `DRAFT` ou `APPROVED` → `MERGED`
2. Adicione bloco de resolução no final (se não existir):

```markdown
---

## Resolução do Merge

> **Merged por:** {responsável} em {data}
> **Versão base após merge:** {nova versão}
> **Alterações aplicadas:** {resumo curto}
```

## PASSO 4: Registro de Auditoria

### PASSO 4a (Normativos): Atualizar INDEX de Amendments

> Se o amendment é de um normativo (path inicia com `docs/01_normativos/amendments/`): execute este passo ao invés do PASSO 4b.

1. Abra `docs/01_normativos/amendments/INDEX.md`
2. Localize a linha do amendment na tabela
3. Atualize o campo Estado: `DRAFT` ou `APPROVED` → `MERGED`
4. Se `rastreia_para` do amendment inclui PENDENTE-NNN, avise: "Verifique se PENDENTE-NNN em `pen-{MOD}-pendente.md` foi atualizado para IMPLEMENTADA."

### PASSO 4b (Requisitos de módulo): CHANGELOG do Módulo

1. Abra `CHANGELOG.md` na raiz do módulo
2. Adicione entrada com versão, data, responsável e referência ao amendment:
   - Ex: `| 1.7.0 | 2026-03-20 | arquitetura | Merge DOC-FND-000-M04: 6 scopes MCP adicionados ao catálogo §2.2 |`

## PASSO 5: Verificação

1. Execute o linter: `node .agents/scripts/lint-docs.js`
2. Se houver erros, corrija antes de finalizar

## Passo Final: Comunicação e Próximo Passo

Responda ao usuário com:
- Amendment aplicado (link)
- Documento base atualizado (link + nova versão)
- INDEX.md de normativos atualizado (se aplicável)
- Pilares impactados (se houver ação pendente em outros pilares)
- Se `rastreia_para` inclui PENDENTE-NNN: avise para verificar se a pendência foi atualizada para IMPLEMENTADA
- Se existem amendments derivados: liste-os com estado e sugira ordem de merge (derivados após o pai)
- Resultado do linter

### Próximo passo no pipeline

Sempre indique o próximo passo concreto:

```text
Amendment veio de uma spec?
├── SIM → Leia a spec referenciada (campo rastreia_para) e sugira:
│         "Implementar as correções de código conforme a spec {path}.
│          Arquivos afetados: {lista do Appendix A}.
│          Após implementação: /git release"
└── NÃO → "Amendments merged. Se há código a alterar, implemente conforme
│          o Detalhamento do amendment. Após implementação: /git release"
```

Se o merge conclui o último amendment de uma spec, mostre o pipeline completo:
```
✅ /create-specification — Spec criada
✅ /create-amendment — Amendment(s) criado(s)
✅ /merge-amendment — Aplicado(s) nos documentos base
➡️ Implementação código — {N} arquivos a editar
⬚ /git release — após implementação e build OK
```
