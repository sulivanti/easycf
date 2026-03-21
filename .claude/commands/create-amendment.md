# Skill: create-amendment

Cria uma emenda (amendment) governada para detalhar, corrigir ou revisar especificações existentes sem ferir o arquivo base original. Conforme DOC-DEV-001 §0.3, documentos com `estado_item: READY` não devem ser editados diretamente — alterações passam por amendments.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `create-amendment`

> **Ciclo de vida:** Stubs em `DRAFT` são enriquecidos diretamente. Esta skill é ativada **somente** quando o documento alvo já atingiu `READY` (ou `ACEITA` para ADRs). Se o arquivo está em `DRAFT`, edite-o diretamente — não use esta skill.

## Relação com `/update-specification`

| Estado do documento | Skill correta |
|---|---|
| `DRAFT` | `/update-specification` (edição direta) |
| `READY` ou `ACEITA` | `/create-amendment` (esta skill) |

O `/update-specification` detecta o estado e delega automaticamente para esta skill quando o documento é `READY`. Você também pode invocar `/create-amendment` diretamente.

## Argumento

$ARGUMENTS deve conter o ID do requisito, pilar e natureza (ex: `FR-001 melhoria "adicionar endpoint restore"`). Se não fornecido, pergunte ao usuário:

- **Caminho da User Story** (arquivo em `user-stories/features/`) ou motivação textual
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

1. Identifique o módulo: `docs/04_modules/mod-{NNN}-{nome}/`
2. Navegue até (ou crie se não existir): `amendments/{pilar}/`
3. Liste arquivos existentes para calcular próximo número sequencial
4. Defina nome: `{Pilar}-{ID}-{Natureza}{Sequencial}.md` (ex: `FR-001-M01.md`, `BR-001-C02.md`)

> **Regra de criação de diretório:** Se `amendments/` ou `amendments/{pilar}/` não existirem, crie-os.

## PASSO 2: Criação do Arquivo de Emenda (ZERO ALUCINAÇÃO)

Consulte `docs/01_normativos/DOC-DEV-001_especificacao_executavel.md` e o normativo do pilar correspondente. Crie o arquivo com:

```markdown
> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento base em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: {Pilar}-{ID}-{Natureza}{Sequencial}

- **Documento base:** [{Pilar}-{ID}](../../requirements/{pilar}/{Pilar}-{ID}.md)
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

## PASSO 3: Amarração Ascendente (somente em mod.md e CHANGELOG)

1. **No `mod.md` do módulo:** Adicione o amendment no bloco de índice (`<!-- start index -->`) ou crie seção `## 8. Amendments` se não existir
2. **NÃO edite o arquivo base READY** — a rastreabilidade é feita via mod.md e CHANGELOG, não via injeção no arquivo selado

## PASSO 4: Changelog

1. Abra `CHANGELOG.md` na raiz do módulo
2. Bump semântico na tabela de versões:
   - `M` (Melhoria) → bump **Minor** (0.x.0)
   - `C` (Correção) → bump **Patch** (0.0.x)
   - `R` (Revisão) → bump **Patch** (0.0.x)
3. Adicione linha na tabela com versão, data, responsável e descrição
4. Atualize o estágio no diagrama Mermaid se necessário (conforme DOC-DEV-002 §5)

## PASSO 5: Atualização do Índice

Invoque `/project:update-index` para atualizar `mod.md` com o novo amendment.

## Passo Final: Comunicação

Responda ao usuário com:
- Link do arquivo de emenda criado
- Bump semântico aplicado
- Confirmação de que o arquivo base READY **não foi tocado**
- Lista de pilares impactados (se houver)
