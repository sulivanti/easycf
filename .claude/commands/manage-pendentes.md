# Skill: manage-pendentes

Gerencia o ciclo de vida completo de pendências (PENDENTE-XXX) dentro de módulos. Permite criar, listar, analisar, decidir, implementar e reportar pendências seguindo o modelo TEMPLATE-PENDENTE.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json`
> **Modelo:** `docs/04_modules/@incorporar/TEMPLATE-PENDENTE.md`

## Argumento

$ARGUMENTS deve conter a **intenção** seguida dos parâmetros.

O identificador primário é `PEN-XXX` (ex: `PEN-002`), que resolve automaticamente o módulo (`MOD-002`) e o arquivo (`pen-002-pendente.md`). No `create`, aceita-se também `MOD-XXX` (pois o arquivo pode ainda não existir).

| Intenção | Comando | Exemplo |
|---|---|---|
| Listar | `list PEN-XXX` | `/manage-pendentes list PEN-002` |
| Criar | `create PEN-XXX` ou `create MOD-XXX` | `/manage-pendentes create PEN-002` |
| Analisar | `analyze PEN-XXX PENDENTE-XXX` | `/manage-pendentes analyze PEN-002 PENDENTE-001` |
| Decidir | `decide PEN-XXX PENDENTE-XXX opção=X` | `/manage-pendentes decide PEN-002 PENDENTE-001 opção=A` |
| Implementar | `implement PEN-XXX PENDENTE-XXX` | `/manage-pendentes implement PEN-002 PENDENTE-001` |
| Cancelar | `cancel PEN-XXX PENDENTE-XXX` | `/manage-pendentes cancel PEN-002 PENDENTE-001` |
| Relatório | `report PEN-XXX` | `/manage-pendentes report PEN-002` |

Se não fornecido ou incompleto, pergunte ao usuário.

---

## PASSO 1: Resolver Módulo e Arquivo

1. Extraia `{NNN}` do argumento — aceite tanto `PEN-XXX` quanto `MOD-XXX` (o número é o mesmo: PEN-002 → MOD-002 → `mod-002-*/`)
2. Resolva o caminho do módulo: `docs/04_modules/mod-{NNN}-{nome}/`
3. Leia o `mod.md` para extrair `mod_id` e `estado_item`
4. Localize o arquivo de pendências: `requirements/pen-{NNN}-pendente.md`
   - Se **não existe** e a intenção é `create`: será criado no PASSO adequado
   - Se **não existe** e a intenção é outra: aborte com `"Nenhuma pendência registrada para este módulo. Use /manage-pendentes create PEN-XXX para criar a primeira."`

## PASSO 2: Ingestão de Contexto

Leia **obrigatoriamente** e **apenas**:

1. O arquivo `pen-{NNN}-pendente.md` do módulo (se existir)
2. O `mod.md` do módulo (já lido no PASSO 1)

> **Nota:** Esta skill já contém todas as regras operacionais (ciclo de vida, classificação, formato). O arquivo `SKILL-PROMPT-PENDENTE.md` é referência para o AGN-DEV-10 durante `/enrich`, **não** precisa ser lido aqui.

**Contexto adicional por intenção:**

| Intenção | Ler também |
|---|---|
| `create` | Arquivo(s) de origem da lacuna (BR, FR, SEC, etc.) indicados pelo usuário |
| `analyze` | Artefatos em `rastreia_para` da pendência + ADRs dos módulos referenciados |
| `decide` | Nada extra — decisão vem do usuário |
| `implement` | Arquivo alvo do artefato de saída + `estado_item` para decidir mecanismo |
| `cancel` | Nada extra — motivo vem do usuário |
| `report` | Nada extra — dados estão no pen-{NNN}-pendente.md |
| `list` | Nada extra |

**NÃO** leia documentos além dos listados. Economia de contexto é crítica.

---

## PASSO 3: Executar Intenção

### 3.1 — `list`

1. Leia o pen-{NNN}-pendente.md
2. Se o Painel de Controle está vazio (sem linhas de pendência), exiba: `"Nenhuma pendência ativa registrada para MOD-XXX."`
3. Exiba o **Painel de Controle** (tabela-resumo do topo do arquivo)
4. Adicione contagem: `Total: N | Abertas: X | Decididas: Y | Implementadas: Z | Bloqueantes: W`

---

### 3.2 — `create`

#### Gate de Governança

```text
estado_item do módulo?
├── DRAFT  → Prossiga.
├── READY  → Prossiga (pendências podem ser criadas em módulos READY — resolução via amendment).
└── Não existe → ABORTE: "Módulo não encontrado. Execute /forge-module primeiro."
```

#### Modo interativo (invocado pelo usuário)

Pergunte ao usuário (ou inferir do contexto se fornecido):

1. **Questão:** Qual a pergunta central?
2. **Origem:** Em qual artefato/seção foi detectada? (BR-XXX, FR-XXX, etc.)
3. **Contexto adicional** (opcional): Informação que ajude a classificar

#### Modo programático (invocado por outro agente)

Quando invocado por `/enrich-agent` (AGN-DEV-10) ou `/validate-all`, os parâmetros são passados diretamente — **sem wizard**. O agente chamador fornece: questão, origem, artefatos impactados e contexto. A classificação é automática sem confirmação do usuário. O campo `origem` reflete quem detectou: `ENRICH`, `VALIDATE` ou `FORGE`.

#### Classificação automática

Com base na origem e contexto, classifique:

- **Domínio:** Inferir da seção de origem (SKILL-PROMPT §2)
- **Tipo:** Inferir do contexto — `LACUNA` (falta info), `CONTRADIÇÃO` (docs conflitam), `DEC-TEC` (escolha técnica), `DEC-BIZ` (escolha de negócio), `DEP-EXT` (aguarda outro módulo)
- **Severidade:** Sugerir com base no impacto, confirmar com o usuário

Apresente a classificação sugerida e peça confirmação antes de prosseguir.

#### Gerar pendência

1. Calcule próximo ID sequencial lendo o arquivo existente (ou PENDENTE-001 se primeiro)
2. Gere mínimo 2 opções com Prós/Contras
3. Sugira recomendação baseada em:
   - Padrões existentes no projeto (DOC-FND-000, DOC-GNP-00)
   - Decisões similares em outros módulos (ADRs existentes)
   - Boas práticas da stack (Node/TS/Vite/React)
4. Preencha `acao_sugerida` consultando tabela tipo → skills (SKILL-PROMPT §3.1). Se `DEC-BIZ` sem skill aplicável, **omitir**
5. Se o arquivo `pen-{NNN}-pendente.md` **não existe**, crie-o com:
   - Header de automação
   - H1: `# PEN-{NNN} — Questões Abertas do [Nome do Módulo]`
   - Metadados do arquivo (estado_item, owner, data_ultima_revisao, rastreia_para)
   - Painel de Controle
   - Bloco da pendência
6. Se o arquivo **já existe**, adicione:
   - Nova linha no Painel de Controle
   - Novo bloco `## PENDENTE-XXX` ao final (antes dos metadados de rodapé, se houver)
   - Atualize `data_ultima_revisao` no header
   - Bump versão MINOR no header de automação

#### Campos obrigatórios (todos preenchidos na criação)

```yaml
id: PENDENTE-XXX
status: ABERTA
severidade: BLOQUEANTE | ALTA | MÉDIA | BAIXA
dominio: BIZ | ARC | SEC | DATA | UX | INFRA | INT
tipo: DEC-TEC | DEC-BIZ | LACUNA | CONTRADIÇÃO | DEP-EXT
origem: FORGE | ENRICH | VALIDATE | MANUAL | REVIEW
criado_em: YYYY-MM-DD          # data de hoje
criado_por: ""                  # nome do agente ou humano
modulo: MOD-XXX
rastreia_para: []               # IDs dos artefatos impactados
tags: []                        # labels livres
sla_data: —                     # ou data concreta se sprint definida
dependencias: []                # IDs de outras pendências que bloqueiam esta
```

#### Formato de saída (bloco markdown)

Seguir exatamente o template do SKILL-PROMPT §4:

```markdown
## PENDENTE-XXX — [Título descritivo]

- **status:** ABERTA
- **severidade:** [valor]
- **domínio:** [valor]
- **tipo:** [valor]
- **origem:** [valor]
- **criado_em:** YYYY-MM-DD
- **criado_por:** [agente/humano]
- **modulo:** MOD-XXX
- **rastreia_para:** [lista de IDs]
- **tags:** [lista]
- **sla_data:** —
- **dependencias:** []

### Questão

[Frase clara e direta.]

### Impacto

[O que fica bloqueado ou comprometido sem decisão.]

### Opções

**Opção A — [Título]:**
[Descrição.]
- Prós: [benefícios]
- Contras: [riscos/custos]

**Opção B — [Título]:**
[Descrição.]
- Prós: [benefícios]
- Contras: [riscos/custos]

### Recomendação

[Opção + justificativa.]

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/{skill} {args}` | [O que a skill faz] | [Condição ou momento] |

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** —
> **Decidido por:** — em —
> **Justificativa:** —
> **Artefato de saída:** —
> **Implementado em:** —
```

---

### 3.3 — `analyze`

1. Localize a pendência pelo ID no arquivo
2. Se não encontrada, aborte: `"PENDENTE-XXX não encontrado em pen-{NNN}-pendente.md."`
3. Leia os artefatos em `rastreia_para` da pendência
4. Busque decisões similares em ADRs dos módulos referenciados em `rastreia_para` (ex: se referencia MOD-000, leia `mod-000-foundation/adr/`). Para busca ampla em todos os módulos, o usuário deve passar flag `--deep`
5. Enriqueça as opções com:
   - Análise de trade-offs técnicos
   - Impacto em outros módulos
   - Riscos identificados
6. Atualize a recomendação se necessário
7. Se status é `ABERTA`, mova para `EM_ANÁLISE` e atualize:
   - Emoji no Painel: ⬜ → 🔄
   - `data_ultima_revisao`
   - Bump versão PATCH
8. Apresente o resultado ao usuário

---

### 3.4 — `decide`

1. Localize a pendência pelo ID
2. Valide que está em `ABERTA` ou `EM_ANÁLISE` — se não, aborte: `"PENDENTE-XXX está em {status}. Só é possível decidir pendências ABERTA ou EM_ANÁLISE."`
3. Registre no bloco `### Resolução`:

```markdown
> **Decisão:** Opção [X] — [título]
> **Decidido por:** [nome do usuário] em YYYY-MM-DD
> **Justificativa:** [por que esta e não as outras]
> **Artefato de saída:** —
> **Implementado em:** —
```

4. Mova status para `DECIDIDA`:
   - Atualize campo `status` no bloco
   - Atualize emoji no Painel: → 🟢
   - Adicione campos: `decidido_em`, `decidido_por`, `opcao_escolhida`, `justificativa_decisao`
5. Bump versão MINOR
6. Se houver `acao_sugerida`, pergunte: `"Deseja executar as ações sugeridas agora?"`

---

### 3.5 — `implement`

1. Localize a pendência pelo ID
2. Valide que está em `DECIDIDA` — se não, aborte: `"PENDENTE-XXX está em {status}. Só é possível implementar pendências DECIDIDA."`
3. Identifique o mecanismo de implementação:

| Estado do doc afetado | Mecanismo |
|---|---|
| `estado_item: DRAFT` | Edição direta no arquivo |
| `estado_item: READY` | `/create-amendment` (base intacta, emenda em amendments/) |
| Decisão arquitetural nova | Criar ADR-XXX |
| Mudança de código | Gerar branch + PR template |

4. Execute ou delegue:
   - Se `/create-amendment`: invoque a skill com os parâmetros adequados
   - Se edição direta: aplique a mudança e registre
   - Se ADR: crie o arquivo em `adr/`
5. Preencha `artefato_saida` com o ID gerado
6. Preencha `implementado_em` com a data de hoje
7. Mova status para `IMPLEMENTADA`:
   - Atualize emoji no Painel: → ✅
   - Strikethrough no título do Painel: `~~[título]~~`
8. Bump versão MINOR
9. Atualize o índice do módulo se novos arquivos foram criados

---

### 3.7 — `cancel`

1. Localize a pendência pelo ID
2. Valide que está em `ABERTA`, `EM_ANÁLISE` ou `DECIDIDA` — se não, aborte: `"PENDENTE-XXX está em {status}. Só é possível cancelar pendências ABERTA, EM_ANÁLISE ou DECIDIDA."`
3. Peça motivo ao usuário (no modo programático, motivo é passado como parâmetro)
4. Adicione campo `motivo_cancelamento` ao bloco da pendência
5. Mova status para `CANCELADA`:
   - Atualize campo `status` no bloco
   - Atualize emoji no Painel: → ❌
   - Strikethrough no título do Painel: `~~[título]~~`
6. Bump versão MINOR

---

### 3.8 — `report`

1. Leia o pen-{NNN}-pendente.md
2. Conte itens por status e severidade
3. Emita relatório no formato:

```markdown
## Relatório de Pendências — MOD-XXX (YYYY-MM-DD)

**Total:** N | **Abertas:** X | **Decididas:** Y | **Implementadas:** Z | **Bloqueantes:** W

### Por Severidade
🔴 BLOQUEANTE: N (N abertas)
🟠 ALTA: N (N abertas)
🟡 MÉDIA: N (N abertas)
🟢 BAIXA: N (N abertas)

### Por Domínio
ARC: N | SEC: N | BIZ: N | DATA: N | UX: N | INT: N | INFRA: N

### SLA
✅ Dentro do prazo: N (XX%)
⚠️ Próximas do vencimento (< 3 dias): N
❌ Vencidas: N

### Ações necessárias
1. [PENDENTE-XXX] BLOQUEANTE sem responsável — atribuir imediatamente
2. [PENDENTE-YYY] SLA vencido — escalar para Owner
```

---

## PASSO 4: Atualizar Índice

Se o arquivo `pen-{NNN}-pendente.md` foi **criado** (não existia antes):

1. Adicione entrada no `mod.md` do módulo na seção de índice:
   ```markdown
   - [PEN-{NNN}](requirements/pen-{NNN}-pendente.md) — Questões Abertas do [Nome do Módulo]
   ```
2. Adicione `PEN-{NNN}` ao campo `rastreia_para` do `mod.md` se ainda não presente.

---

## PASSO 5: Relatório de Execução

Emita no chat:

```
## manage-pendentes — {intenção}

**Módulo:** MOD-XXX
**Arquivo:** requirements/pen-{NNN}-pendente.md

### Ação executada
- {descrição do que foi feito}

### Resultado
- {PENDENTE-XXX}: {status anterior} → {status novo} (se mudou)

### Próximos passos sugeridos
- {o que fazer em seguida, se aplicável}
```

---

## Notas

- Esta skill **modifica** o arquivo `pen-{NNN}-pendente.md`. Diferente de `/validate-all` que é read-only.
- O arquivo `pen-{NNN}-pendente.md` é **sempre a fonte de verdade**. Sistemas de chamados externos são views sincronizadas.
- Emojis de status: ⬜ ABERTA, 🔄 EM_ANÁLISE, 🟢 DECIDIDA, ✅ IMPLEMENTADA, ❌ CANCELADA, ♻️ REABERTA
- Emojis de severidade: 🔴 BLOQUEANTE, 🟠 ALTA, 🟡 MÉDIA, 🟢 BAIXA
- **ZERO ALUCINAÇÃO:** Não invente dados. Lacunas → registre como `missing_info`.
- Ao criar pendências automaticamente (via `/enrich` ou `/validate-all`), use `origem: ENRICH` ou `origem: VALIDATE`. Quando o usuário cria manualmente, use `origem: MANUAL`.
