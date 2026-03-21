# Skill: {nome-da-skill}

{Descrição concisa em uma frase do que a skill faz.}

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `{nome-da-skill}`

<!-- Se a skill tem relação hierárquica com outras, documente aqui -->
<!-- Exemplo: "Esta skill é invocada pelo /validate-all como passo 2." -->

## Argumento

$ARGUMENTS deve conter {descrição dos parâmetros obrigatórios}. Se não fornecido, pergunte ao usuário.

{Se houver flags opcionais, liste-as:}

Flags opcionais:
- `--dry-run` — {descrição} (obrigatório para skills destrutivas)
- `--flag` — {descrição}

---

<!-- ============================================================ -->
<!-- GATES: Validações que DEVEM passar antes de executar.         -->
<!-- Remova esta seção se a skill não tem pré-condições.           -->
<!-- ============================================================ -->

## Gates

### Gate 1 — {Nome do gate}

```text
{condição}?
├── {valor} → {ação}
├── {valor} → {ação}
└── {valor} → ABORTE: "{mensagem}"
```

### Gate 2 — {Nome do gate} (se necessário)

{mesma estrutura}

---

<!-- ============================================================ -->
<!-- PASSOS: Fluxo principal de execução.                         -->
<!-- Use ## PASSO N — {Título} para cada etapa.                   -->
<!-- Subpassos usam ### (nunca ####).                             -->
<!-- ============================================================ -->

## PASSO 1 — {Título}

{Descrição do que fazer neste passo.}

## PASSO 2 — {Título}

{Descrição.}

## PASSO N — Relatório

Emita no chat:

```
## {nome-da-skill} — Resultado

### Resumo
- {métricas relevantes}

### Próximos passos
- {ações sugeridas}
```

---

<!-- ============================================================ -->
<!-- ERROR HANDLING: Como lidar com falhas.                        -->
<!-- Remova se a skill é read-only e não tem modos de falha.      -->
<!-- ============================================================ -->

## Error Handling

| Erro | Causa | Ação |
|---|---|---|
| {descrição do erro} | {causa provável} | {o que fazer} |

---

<!-- ============================================================ -->
<!-- NOTAS: Informações complementares.                           -->
<!-- Remova se não há notas relevantes.                           -->
<!-- ============================================================ -->

## Notas

- {Nota sobre comportamento, limitações, ou interação com outras skills.}
