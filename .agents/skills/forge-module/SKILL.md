---
name: forge-module
description: Fórja a estrutura completa de um novo módulo (MOD-XXX) através da leitura e obediência estrita às regras dinâmicas do DOC-DEV-001. Triggers: "forge module", "scaffold module", "criar módulo", "iniciar MOD".
---

# Skill: forge-module

## Objetivo

Gerar a estrutura de pastas e os arquivos iniciais para um novo módulo (`MOD-XXX`), servindo como boilerplate arquitetural governado seguindo o paradigma XP-Driven.

1. O conteúdo dos arquivos gerados (metadados obrigatórios, tabelas de controle de versão, formato Gherkin, dependências, etc) NÃO deve ser inferido e NÃO está descrito rígido neste arquivo. Ele deve ser extraído em tempo de execução da fonte da verdade (Single Source of Truth) da arquitetura de especificação do projeto (`DOC-DEV-001_especificacao_executavel.md`).
2. **ZERO ALUCINAÇÃO:** É expressamente PROIBIDO gerar, inventar ou deduzir qualquer informação, campo, estrutura, fluxo ou regra que não esteja clara e explicitamente contida no contexto do diretório `docs/01_normativos`.

---

## 1. Gatilhos de Ativação

O agente deve invocar mentalmente esta skill se o usuário solicitar:

- "forge module"
- "scaffold module"
- "criar novo módulo MOD-XXX"

## 2. Parâmetro Obrigatório da Execução (A User Story)

Se o usuário não a fornecer no prompt de origem, você **deve questioná-lo antes de criar os arquivos**:

- **Caminho da User Story**: O caminho para o arquivo Markdown localizado em `docs/04_modules/user-stories/features/US-MOD-XXX.md`.

**REGRA DE BLOQUEIO (GATE DE APROVAÇÃO XP):**
Você deve ler o arquivo da User Story informada. Verifique o campo `status_agil:`.
Se o status **não for** `READY`, você **ESTÁ PROIBIDO** de gerar qualquer arquivo. Interrompa a execução e informe ao usuário que a US precisa estar `READY`.

---

## 3. PASSO 1: Ingestão de Contexto Normativo (Obrigatório)

**PARE O QUE ESTÁ FAZENDO.** Antes de gerar pastas ou criar qualquer arquivo, você é estritamente **obrigado** a ler via ferramentas do sistema o documento normativo de especificações executáveis em:

`docs/01_normativos/DOC-DEV-001_especificacao_executavel.md` e `docs/01_normativos/DOC-DEV-002_fluxo_agentes_e_governanca.md`.

---

## 4. PASSO 2: Criação da Estrutura Estratégica

Você deve criar um diretório em `docs/04_modules/mod-{ID}-{nome}/` simulando a árvore padrão: `mod.md`, `CHANGELOG.md`, `requirements/br`, `fr`, `data`, `int`, `sec`, `ux`, `nfr`, `adr/` e a base executável `tests/`.
> **Atenção XP-Driven:** O subdiretório `tests/` é gerado para abrigar a suíte inicial Vitest atrelada ao módulo, eliminando a dependência histórica de arquivos markdown `TST`. O agente deve induzir o TDD a partir dele.

Além das subpastas, o forge **DEVE** gerar os seguintes stubs obrigatórios em estado DRAFT:

- `requirements/data/DATA-003.md` — Catálogo de Domain Events (template mínimo com tabela vazia para enriquecimento pelo AGN-DEV-04). Campos da tabela: `event_type`, `description`, `origin_command`, `emit_permission`, `view_rule`, `notify`, `sensitivity_level`.
- `requirements/sec/SEC-EventMatrix.md` — Matriz de Autorização de Eventos Emit/View/Notify (template mínimo com tabela vazia para enriquecimento pelo AGN-DEV-06). Campos da tabela: `action`, `event_type`, `emit_perm`, `view`, `notify`.

Ambos **DEVEM** incluir o header de automação padrão (seção 5, item 2) e metadados `estado_item: DRAFT`, `rastreia_para: US-MOD-{ID}, DOC-ARC-003`.

> **Referência:** DOC-GPA-001 §5.4, PKG-DEV-001 AGN-DEV-04 e AGN-DEV-06.

---

## 5. PASSO 3: Geração Fiel dos Arquivos

1. Extraia o template de `DOC-DEV-001`.
2. O aviso OBRIGATÓRIO (primeira linha do arquivo gerado) deve ser:

   ```markdown
   > ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
   > - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
   > - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
   ```

3. Aplique as informações da **User Story**:
   - `rastreia_para`: inclua os irmãos e a US.
   - `estado_item` do arquivo técnico DEVE nascer como **DRAFT**.
4. Salve em disco.

---

## 6. PASSO 4: Diagrama Mermaid (CHANGELOG)

Siga `DOC-DEV-002` seção 5 para gerar o pipeline colorido (`Etapa 4 - DRAFT`).

---

## 7. PASSO 5: Índices

Invoque o agente orgânico ou a skill `update-markdown-file-index` para:

1. Atualizar o `mod.md` interno
2. Atualizar o `docs/INDEX.md` global.

---

## 8. Passo Final: Comunicação

Emita um sumário listando a estrutura gerada, o normativo usado e o que refinar a seguir.
