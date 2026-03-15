# Skill: forge-module

Gerar a estrutura completa de pastas e arquivos iniciais para um novo módulo (MOD-XXX), servindo como boilerplate arquitetural governado seguindo o paradigma XP-Driven.

## Argumento

$ARGUMENTS deve conter o caminho da User Story (ex: `docs/04_modules/user-stories/features/US-MOD-020-F01.md`). Se não fornecido, pergunte ao usuário.

## Regras Fundamentais

1. O conteúdo dos arquivos gerados NÃO deve ser inferido. Deve ser extraído em tempo de execução da fonte da verdade: `docs/01_normativos/DOC-DEV-001_especificacao_executavel.md`.
2. **ZERO ALUCINAÇÃO:** É expressamente PROIBIDO gerar, inventar ou deduzir qualquer informação que não esteja explicitamente contida em `docs/01_normativos`.

## PASSO 1: Gate de Aprovação XP

Leia o arquivo da User Story informada. Verifique o campo `status_agil:`.
Se o status **não for** `READY`, você **ESTÁ PROIBIDO** de gerar qualquer arquivo. Interrompa e informe ao usuário que a US precisa estar `READY`.

## PASSO 2: Ingestão de Contexto Normativo (Obrigatório)

**PARE.** Antes de gerar qualquer arquivo, leia obrigatoriamente:

- `docs/01_normativos/DOC-DEV-001_especificacao_executavel.md`
- `docs/01_normativos/DOC-DEV-002_fluxo_agentes_e_governanca.md`

## PASSO 3: Criação da Estrutura Estratégica

Crie o diretório em `docs/04_modules/mod-{ID}-{nome}/` com a árvore padrão:

- `mod.md`, `CHANGELOG.md`
- `requirements/` com subpastas: `br/`, `fr/`, `data/`, `int/`, `sec/`, `ux/`, `nfr/`
- `adr/` (Architecture Decision Records)
- `tests/` (suíte inicial Vitest)
- `amendments/` com estrutura para futuras emendas

Stubs obrigatórios em estado DRAFT:

- `requirements/data/DATA-003.md` — Catálogo de Domain Events (tabela: `event_type`, `description`, `origin_command`, `emit_permission`, `view_rule`, `notify`, `sensitivity_level`)
- `requirements/sec/SEC-EventMatrix.md` — Matriz de Autorização de Eventos (tabela: `action`, `event_type`, `emit_perm`, `view`, `notify`)

Ambos com header de automação e metadados `estado_item: DRAFT`, `rastreia_para: US-MOD-{ID}, DOC-ARC-003`.

## PASSO 4: Geração dos Arquivos

1. Extraia o template de `DOC-DEV-001`.
2. Aviso obrigatório na primeira linha de cada arquivo gerado:

   ```markdown
   > ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
   > - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
   > - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
   ```

3. Aplique as informações da User Story: `rastreia_para` inclui irmãos e US, `estado_item` nasce como **DRAFT**.

## PASSO 5: Diagrama Mermaid (CHANGELOG)

Siga `DOC-DEV-002` seção 5 para gerar o pipeline colorido (`Etapa 4 - DRAFT`).

## PASSO 6: Índices

Invoque `/project:update-index` para:

1. Atualizar o `mod.md` interno
2. Atualizar o `docs/INDEX.md` global

## Passo Final: Comunicação

Emita um sumário listando a estrutura gerada, o normativo usado e o que refinar a seguir.
