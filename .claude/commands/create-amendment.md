# Skill: create-amendment

Cria uma emenda (amendment) governada para detalhar, corrigir ou revisar especificações existentes sem ferir o arquivo base original. Conforme DOC-DEV-001 §0.3, documentos com `estado_item: READY` não devem ser editados diretamente — alterações passam por amendments.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `create-amendment`

> **Ciclo de vida:** Stubs em `DRAFT` são enriquecidos diretamente. Esta skill é ativada **somente** quando o documento alvo já atingiu `READY` (ou `ACEITA` para ADRs). Se o arquivo está em `DRAFT`, edite-o diretamente — não use esta skill.

## Relação com outras skills

| Estado do documento | Skill correta |
|---|---|
| `DRAFT` | `/update-specification` (edição direta) |
| `READY` ou `ACEITA` | `/create-amendment` (esta skill) |

O `/update-specification` detecta o estado e delega automaticamente para esta skill quando o documento é `READY`. Você também pode invocar `/create-amendment` diretamente.

### Ciclo completo de amendments

| Etapa | Skill | O que faz |
|---|---|---|
| 1. Criar emenda | `/create-amendment` (esta skill) | Cria arquivo de amendment sem tocar o base |
| 2. Analisar cascata | `/cascade-amendment` | Identifica pilares afetados e cria amendments derivados |
| 3. Aplicar emenda | `/merge-amendment` | Incorpora conteúdo no base e sela o amendment |

> A etapa 2 é recomendada quando "Impacto nos Pilares" lista ações concretas em outros pilares/módulos (qualquer natureza M/C/R). Para amendments self-contained, pule direto para o merge.

## Argumento

$ARGUMENTS pode conter:

1. **ID do requisito + pilar + natureza** (ex: `FR-001 melhoria "adicionar endpoint restore"`)
2. **Referência a uma spec** (ex: `com base na spec docs/03_especificacoes/spec-fix-domain-events-tenant-id.md`)

Se vem de uma spec (caso 2):
- Leia a spec completa, em particular "Appendix A: Plano de Execução" e "Arquivos modificados"
- Identifique os módulos afetados e os pilares (FR, DATA, SEC, etc.)
- Crie **um amendment por módulo** afetado, referenciando a spec no campo `rastreia_para`
- Cada amendment deve conter apenas as mudanças relativas ao seu módulo

Se não fornecido, pergunte ao usuário:

- **Caminho da User Story** (arquivo em `user-stories/features/`), spec, ou motivação textual
- **Pilar:** `br`, `fr`, `data`, `int`, `sec`, `ux`, `nfr`, `adr`
- **Natureza:** `M` (Melhoria), `R` (Revisão), `C` (Correção)

## Gates de Aprovação

### Gate 1 — Documento Alvo

Leia o arquivo base e verifique:

```text
estado_item do arquivo base?
├── DRAFT        → ABORTE. Diga: "Arquivo em DRAFT — edite diretamente, sem amendment."
├── READY        → Prossiga com o amendment.
├── ACEITA (ADR) → Prossiga com o amendment.
└── Não existe   → ABORTE. Diga: "Arquivo base não encontrado."
```

### Gate 2 — User Story (quando aplicável)

Se a motivação vem de uma User Story:

```text
status_agil da User Story?
├── READY ou DONE     → Prossiga.
├── TODO              → ABORTE. Diga: "US ainda em TODO — aguarde READY."
├── IN_PROGRESS       → ABORTE. Diga: "US em desenvolvimento — aguarde conclusão."
└── REJECTED          → ABORTE. Diga: "US rejeitada — não cabe amendment."
```

Se a motivação é uma correção factual (ex: dado errado no doc), o Gate 2 pode ser pulado.

## PASSO 1: Descoberta e Sequenciamento

1. **Identifique o tipo de documento alvo:**

```text
Documento base está em docs/01_normativos/?
├── SIM (é um normativo transversal — DOC-PADRAO-*, DOC-UX-*, DOC-GNP-*, DOC-ARC-*, etc.)
│   → Caminho: docs/01_normativos/amendments/{DOC-ID}/
│   → Nome: {DOC-ID}-{Natureza}{Seq}.md (ex: DOC-PADRAO-001-M01.md)
│   → Link no template: ../../{filename}.md
│   → PASSO 3: Atualize docs/01_normativos/amendments/INDEX.md (adicione linha na tabela)
│   → PASSO 4: Atualize docs/01_normativos/amendments/CHANGELOG.md (PASSO 4a abaixo)
└── NÃO (é um requisito de módulo — FR-*, BR-*, SEC-*, etc.)
    → Comportamento atual inalterado (passos 2-4 abaixo)
```

2. **Para requisitos de módulo:** Identifique o módulo: `docs/04_modules/mod-{NNN}-{nome}/`
3. Navegue até (ou crie se não existir): `amendments/{pilar}/`
4. Liste arquivos existentes para calcular próximo número sequencial
5. Defina nome: `{Pilar}-{ID}-{Natureza}{Sequencial}.md` (ex: `FR-001-M01.md`, `BR-001-C02.md`)

> **Regra de criação de diretório:** Se `amendments/` ou `amendments/{pilar}/` não existirem, crie-os. Para normativos: se `docs/01_normativos/amendments/{DOC-ID}/` não existir, crie-o.

## PASSO 2: Criação do Arquivo de Emenda (ZERO ALUCINAÇÃO)

Consulte `docs/01_normativos/DOC-DEV-001_especificacao_executavel.md` e o normativo do pilar correspondente. Crie o arquivo com:

```markdown
> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: {ID do amendment}

- **Documento base:** [{ID}]({link relativo ao doc base})
  <!-- Para normativos: ../../{filename}.md -->
  <!-- Para requisitos de módulo: ../../requirements/{pilar}/{Pilar}-{ID}.md -->
- **estado_item:** DRAFT
- **Natureza:** {M|C|R} ({Melhoria|Correção|Revisão})
- **Data:** {Data Atual}
- **owner:** {owner}
- **Motivação:** {Resumo da alteração e por quê}
- **rastreia_para:** {IDs relacionados — US, outros requisitos}

---

## Detalhamento

{Conteúdo formatado conforme norma do pilar — regras, exemplos, Gherkin, etc.}

---

## Impacto nos Pilares

- **Pilares afetados:** {lista de pilares que podem precisar de atualização}
- **Ação requerida:** {descrição do que precisa mudar em outros pilares, se aplicável}
```

> **IMPORTANTE:** O arquivo base (READY) **NÃO é editado**. Todo o conteúdo novo fica no amendment.

## PASSO 3: Amarração Ascendente

### PASSO 3a (Normativos): Atualizar INDEX de Amendments

> Se o amendment é de um normativo (`docs/01_normativos/`): execute este passo ao invés do PASSO 3b.

1. Abra (ou crie se não existir) `docs/01_normativos/amendments/INDEX.md`
2. Adicione uma linha na tabela com:
   - Amendment ID (link relativo ao arquivo: `{DOC-ID}/{DOC-ID}-{Natureza}{Seq}.md`)
   - Documento base (ID)
   - Natureza (M/C/R)
   - Estado: `DRAFT`
   - Data de criação
   - Resumo (da Motivação, max 80 chars). Se `rastreia_para` inclui PENDENTE-NNN, adicione `(resolve PENDENTE-NNN)` ao final
3. **NÃO edite o arquivo base READY** — a rastreabilidade é feita via INDEX.md e pelo bump de versão no normativo (no merge)

### PASSO 3b (Requisitos de módulo): Amarração no Manifesto

1. **No manifesto do módulo (`<dirname>.md`):** Adicione o amendment no bloco de índice (`<!-- start index -->`) ou crie seção `## 8. Amendments` se não existir
2. **NÃO edite o arquivo base READY** — a rastreabilidade é feita via manifesto do módulo e CHANGELOG, não via injeção no arquivo selado

## PASSO 4: Changelog

### PASSO 4a (Normativos): CHANGELOG de Amendments Normativos

> Se o amendment é de um normativo (`docs/01_normativos/`): execute este passo ao invés do PASSO 4b.

1. Abra `docs/01_normativos/amendments/CHANGELOG.md`
2. Bump semântico na tabela de versões (mesmas regras abaixo)
3. Adicione linha com versão, data, `create-amendment`, e descrição incluindo o ID do normativo e resumo da motivação

### PASSO 4b (Requisitos de módulo): CHANGELOG do Módulo

1. Abra `CHANGELOG.md` na raiz do módulo
2. Bump semântico na tabela de versões:
   - `M` (Melhoria) → bump **Minor** (0.x.0)
   - `C` (Correção) → bump **Patch** (0.0.x)
   - `R` (Revisão) → bump **Patch** (0.0.x)
3. Adicione linha na tabela com versão, data, responsável e descrição
4. Atualize o estágio no diagrama Mermaid se necessário (conforme DOC-DEV-002 §5)

## PASSO 5: Atualização do Índice

> Se normativo: o índice já foi atualizado no PASSO 3a. Não invoque `/update-index`.

Para requisitos de módulo: invoque `/project:update-index` para atualizar o manifesto do módulo com o novo amendment.

## Passo Final: Comunicação e Próximo Passo

Responda ao usuário com:
- Link do(s) arquivo(s) de emenda criado(s)
- Bump semântico aplicado (módulos) ou CHANGELOG de normativos atualizado
- INDEX.md de normativos atualizado (se aplicável)
- **Binding reverso:** Se o amendment normativo é consumido por módulos específicos (ex: CA-07 usado por UX-001-C01), lembre o usuário de incluir `Deps normativas: {IDs}` no CHANGELOG do módulo consumidor ao fazer o codegen
- Confirmação de que o arquivo base READY **não foi tocado**
- Lista de pilares impactados (se houver)
- Se `rastreia_para` inclui PENDENTE-NNN: lembre o usuário de verificar o status da pendência
- **Cascata:** Se "Impacto nos Pilares" lista ações concretas em outros pilares/módulos (qualquer natureza M/C/R), sugira: "Execute `/cascade-amendment {caminho-do-amendment}` para analisar e criar amendments derivados nos pilares afetados."

### Próximo passo no pipeline

Sempre indique o próximo passo concreto:

```text
Amendments têm cascata?
├── SIM → "Execute /cascade-amendment {paths} para criar amendments derivados"
├── NÃO (self-contained) → "Execute /merge-amendment {paths} para aplicar nos documentos base"
```

Se vieram de uma spec, inclua o pipeline completo:
```
✅ /create-specification — Spec criada
✅ /create-amendment — {N} amendment(s) criado(s)
➡️ /merge-amendment {paths} — próximo passo
⬚ Implementação código — após merge
⬚ /git release — após implementação
```
