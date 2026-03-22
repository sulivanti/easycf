# US-MOD-003-F03 — Formulário de Nó Organizacional (UX)

**Status Ágil:** `READY`
**Versão:** 1.0.0 | **Data:** 2026-03-15 | **Módulo:** MOD-003
**operationIds consumidos:** `org_units_create`, `org_units_update`, `org_units_list`, `org_units_get`

## Metadados de Governança

- **status_agil:** READY | **owner:** arquitetura
- **rastreia_para:** US-MOD-003, US-MOD-003-F01, DOC-UX-012, DOC-ARC-003

---

## 1. A Solução

Como **administrador organizacional**, quero um formulário para criar novos nós na hierarquia (selecionando o pai) e editar nós existentes (nome e descrição), com o nível sendo derivado automaticamente e o código sendo imutável após criação.

---

## 2. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Formulário de Nó Organizacional — UX-ORG-002

  # ── Modo Criar ───────────────────────────────────────────────
  Cenário: Criar N1 raiz sem pai
    Dado que o admin acessa /organizacao/novo
    E marca "Criar como raiz (N1)"
    Quando preenche código "GC-001" e nome "Grupo Alpha"
    E clica em "Criar unidade"
    Então POST /org-units é chamado com { codigo: "GC-001", nome: "Grupo Alpha" } (sem parent_id)
    E após 201, redireciona para /organizacao?highlight=:id

  Cenário: Criar filho com pai pré-selecionado via URL
    Dado que o admin acessa /organizacao/novo?parent=uuid-n3
    Então o campo "Nó Pai" já está preenchido com o nó N3 correspondente
    E o indicador de nível exibe "N4 — Subunidade Organizacional"
    E o checkbox "Criar como raiz" NÃO está visível

  Cenário: Nível derivado automaticamente ao selecionar pai
    Dado que o admin seleciona um nó N2 como pai
    Então o campo Nível exibe instantaneamente "N3 — Macroárea"
    E o LevelIndicator exibe o breadcrumb dos ancestrais + "[Novo nó]"
    E nenhuma chamada de API é feita (derivação client-side)

  Cenário: Código em uppercase automático
    Dado que o admin digita "gc-001" no campo código
    Então o campo exibe "GC-001" automaticamente (uppercased)

  Cenário: Aviso de imutabilidade do código
    Dado que o admin está preenchendo o campo código
    Então um aviso exibe: "O código não pode ser alterado após a criação."

  Cenário: Erro 409 — código duplicado exibido inline
    Dado que POST /org-units retorna 409
    Então o erro aparece INLINE sob o campo código: "Este código já está em uso."
    E NÃO exibe toast

  Cenário: Criação bem-sucedida
    Dado que todos os campos obrigatórios estão válidos
    Quando clica em "Criar unidade"
    Então o botão entra em isLoading
    E o header Idempotency-Key é enviado
    E após 201, Toast: "Unidade 'GC-001 — Grupo Alpha' criada."
    E redirect para /organizacao?highlight=:id após 1.5s

  # ── Modo Editar ──────────────────────────────────────────────
  Cenário: Código e Nó Pai são readonly no modo edição
    Dado que o admin acessa /organizacao/novo?edit=uuid
    Então o campo Código exibe o valor mas está desabilitado com tooltip "Imutável"
    E o campo Nó Pai exibe o nome do pai mas está desabilitado com tooltip "Hierarquia imutável"

  Cenário: Edição de nome bem-sucedida
    Dado que o admin altera o nome no modo edição
    Quando clica em "Salvar alterações"
    Então PATCH /org-units/:id é chamado com { nome: "Novo Nome" }
    E após 200, Toast: "Unidade 'GC-001' atualizada."
    E redirect para /organizacao

  Cenário: Desativar via modo edição (toggle de status)
    Dado que o admin alterna o status para INACTIVE no formulário de edição
    E o nó não tem filhos ativos
    Quando salva
    Então PATCH /org-units/:id é chamado com { status: "INACTIVE" }

  Cenário: Desativar com filhos ativos — inline bloqueado
    Dado que o admin tenta alterar status para INACTIVE
    Mas o nó tem filhos ativos
    Então ao tentar salvar, retorna 422
    E o erro aparece inline: "Não é possível desativar um nó com subunidades ativas."

  # ── Validações Gerais ─────────────────────────────────────────
  Cenário: Campos obrigatórios em branco bloqueiam submit
    Dado que código ou nome estão vazios
    Então o botão "Criar unidade" permanece disabled

  Cenário: Cancelar descarta sem chamar API
    Dado que o admin preencheu campos mas clica "Cancelar"
    Então nenhuma chamada de API é feita
    E retorna para /organizacao
```

---

## 3. DoR ✅ / DoD

**DoR:** Manifest UX-ORG-002 criado, F01 (API) em READY, query params documentados.
**DoD:** Modo criar e editar testados, código uppercase automático, nivel derivado client-side, LevelIndicator em tempo real, deep link ?parent= funcional, erros 409 inline, idempotência.

## 4. Regras Críticas

1. **Nível**: derivado client-side do pai selecionado — backend valida, frontend apenas exibe
2. **Código**: imutável após criação — readonly no modo edição com tooltip
3. **Nó pai**: imutável após criação — readonly no modo edição
4. **`?parent=` na URL**: pré-seleciona o pai e exibe nível derivado imediatamente
5. **Idempotency-Key**: UUID v4 gerado no mount, enviado em `submit_create`
6. **Erros 409**: inline no campo código, nunca em toast
7. **Após sucesso**: `?highlight=:id` na URL da árvore para destacar o nó criado/editado

## 5. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Dois modos, nível derivado, código imutável, deep link, LevelIndicator. |
