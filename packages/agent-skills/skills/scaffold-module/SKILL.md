---
description: Gera a estrutura completa de um novo módulo (MOD-XXX) através da leitura e obediência estrita às regras dinâmicas do DOC-DEV-001 normativo. Triggers: "scaffold module", "criar módulo", "novo módulo", "iniciar MOD".
---

# Skill: scaffold-module

## Objetivo

Gerar a estrutura de pastas e os arquivos iniciais para um novo módulo (`MOD-XXX`), servindo como boilerplate arquitetural governado.

1. O conteúdo dos arquivos gerados (metadados obrigatórios, tabelas de controle de versão, formato Gherkin, dependências, etc) NÃO deve ser inferido e NÃO está descrito rígido neste arquivo. Ele deve ser extraído em tempo de execução da fonte da verdade (Single Source of Truth) da arquitetura de especificação do projeto.
2. **ZERO ALUCINAÇÃO:** É expressamente PROIBIDO gerar, inventar ou deduzir qualquer informação, campo, estrutura, fluxo ou regra que não esteja clara e explicitamente contida no contexto do diretório `docs/01_normativos`. As amarrações (rastreabilidade cruzada) devem se limitar aos pilares regulados na norma. Nada fora do escopo normativo pode nascer no artefato.

---

## 1. Gatilhos de Ativação

O agente deve invocar mentalmente esta skill se o usuário solicitar:

- "scaffold module"
- "criar novo módulo MOD-XXX"
- "iniciar spec do módulo de [nome]"
- "gerar estrutura MOD"

## 2. Parâmetro Obrigatório da Execução (A User Story)

Se o usuário não a fornecer no prompt de origem, você **deve questioná-lo antes de criar os arquivos**:

- **Caminho da User Story**: O caminho para o arquivo Markdown localizado em `docs/04_modules/user-stories/features/US-MOD-XXX.md`.

**REGRA DE BLOQUEIO (GATE DE APROVAÇÃO):**
Você deve ler o arquivo da User Story informada. Verifique o campo `estado_item:`.
Se o status **não for** `APPROVED` (ou `READY` em validações anteriores), você **ESTÁ PROIBIDO** de gerar qualquer arquivo. Interrompa a execução e informe ao usuário que a US precisa estar aprovada (ela pode estar `DRAFT`, `REFINING`, `READY`, etc). Apenas proceda se estiver `APPROVED` ou `READY`.

---

## 3. PASSO 1: Ingestão de Contexto Normativo (Obrigatório)

**PARE O QUE ESTÁ FAZENDO.** Antes de gerar pastas ou criar qualquer arquivo, você é estritamente **obrigado** a ler via ferramentas do sistema o documento normativo de especificações executáveis em:

`docs/01_normativos/DOC-DEV-001_especificacao_executavel.md`

Leia este documento por inteiro buscando descobrir:

- Qual é o *template* (tabela inicial de Warning de Automação/CI, metadados finais de rastreabilidade, owner, revision date).
- Como estruturar as seções (Regra, Exceção, Gherkin, Dependências, Gatilhos ADR, Campos de Banco de Dados, Transações, Eventos do Domínio).
- Quais são as nomenclaturas corretas.

---

## 4. PASSO 2: Criação da Estrutura Estratégica

Você deve criar um diretório em `docs/04_modules/mod-{ID}-{nome}/` simulando a árvore abaixo. **Atenção à nomenclatura dos itens base (terminados em `{ID}.md` e não em `{ID}01.md`)**.

```text
docs/04_modules/mod-{ID}-{nome}/
├── mod.md                          ← Índice e overview descritivo do módulo
├── CHANGELOG.md                    ← Tabela inicial (Versão | Data | Responsável | Descrição) + Diagrama Mermaid de pipeline
├── requirements/
│   ├── br/
│   │   └── BR-{ID}.md              ← Regra de Negócio base
│   ├── fr/
│   │   └── FR-{ID}.md              ← Requisito Funcional base
│   ├── data/
│   │   └── DATA-{ID}.md            ← Modelo de dados base
│   ├── int/
│   │   └── INT-{ID}.md             ← Integrações (se houver)
│   ├── sec/
│   │   └── SEC-{ID}.md             ← Segurança e compliance
│   ├── ux/
│   │   └── UX-{ID}.md              ← UX e jornadas
│   └── nfr/
│       └── NFR-{ID}.md             ← Requisitos não-funcionais
└── adr/
    └── ADR-{ID}.md                 ← Placeholder de Decisão (opcional/base)
```

---

## 5. PASSO 3: Geração Fiel dos Arquivos (Single Source of Truth Protocol)

Para a escrita de CADA UM dos arquivos que estão dentro das sub-pastas `/requirements/`, `/adr/` ou até mesmo o `mod.md` raiz:

1. Vá até a seção específica dele dentro da leitura do `DOC-DEV-001` que você executou.
2. Extraia o "esqueleto / template" ditado lá. Preste atenção aos itens que a norma diz que são **Obrigatórios**. **Correção Vital:** Para o documento `DATA`, certifique-se de incluir a tag `# DATA-{ID} — {Nome}` no topo, logo abaixo da tabela de automação.
3. **OBRIGATÓRIO — AVISO DE AUTOMAÇÃO (PRIMEIRA LINHA DO ARQUIVO):** A **primeira linha de conteúdo** de cada arquivo gerado (antes de qualquer outra seção ou heading) DEVE ser exatamente:

   ```markdown
   > ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
   > - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente (fase de enriquecimento de stub).
   > - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment` para evoluções.
   ```

   Isso não é delegado à leitura do `DOC-DEV-001` — é uma regra de execução desta skill. Nenhum arquivo gerado pelo scaffold pode nascer sem esse aviso. Essa tag define o ciclo de vida do arquivo desde o nascimento (conforme `DOC-DEV-001`).
4. Aplique as informações extraídas logicamente da **User Story fornecida**.
5. No campo `rastreia_para` presente no rodapé de cada arquivo (estipulado pelo DOC-DEV-001), amarre a todos os outros arquivos irmãos do mesmo nó e **inclua a referência à US de origem**.
6. No campo `referencias_exemplos`, preencha com o link relativo para a User Story de aprovação (ex: `[US-MOD-101](../../user-stories/features/US-MOD-101.md)`).
7. O estado inicial de todo arquivo gerado deve ser rigorosamente **DRAFT**.
   **CICLO DE VIDA DOS STUBS — REGRA CRÍTICA:**
   - **Fase DRAFT (enriquecimento):** O agente **PODE e DEVE** editar os arquivos gerados diretamente para preencher seu conteúdo técnico a partir das User Stories aprovadas. Isso é chamado de "enriquecimento de stub" e é a etapa seguinte obrigatória ao scaffold.
   - **Fase READY (estabilidade):** Após o arquivo ser promovido a `READY` via `transition-spec-status`, toda modificação passa **obrigatoriamente** pela skill `create-amendment`. Nunca por edição direta.
8. Salve o arquivo em disco.

---

## 6. PASSO 4: Geração do Diagrama Mermaid de Pipeline no CHANGELOG.md

Após gerar todos os arquivos, **atualize o `CHANGELOG.md`** do módulo recém-criado para incluir a seção de estágio atual e o diagrama Mermaid de pipeline.

> **As regras de coloração, a lógica de decisão de estágio e o template Mermaid canônico estão definidos no normativo:**
> **`docs/01_normativos/DOC-DEV-002_fluxo_agentes_e_governanca.md` — Seção 5.**
> Leia e siga esse documento. **Não duplique as regras aqui.**

No momento do scaffold, o módulo nasce na **etapa 8** (stubs gerados). Aplique a lógica da **seção 5.3** para colorir o diagrama e escreva o texto da seção `## Estágio Atual` conforme os exemplos da **seção 5.3** do normativo.

---

## 7. PASSO INTERMEDIÁRIO: Atualização dos Índices (update-markdown-file-index)

Antes de comunicar ao usuário, **invoque a skill `update-markdown-file-index`** duas vezes:

1. **Atualizar o `mod.md` do módulo recém-criado:**
   - Arquivo alvo: `docs/04_modules/mod-{ID}-{nome}/mod.md`
   - Pasta a indexar: `docs/04_modules/mod-{ID}-{nome}/requirements/`
   - Isso garante que o `mod.md` liste todos os arquivos de requisito gerados.

2. **Atualizar o `docs/INDEX.md` global:**
   - Arquivo alvo: `docs/INDEX.md`
   - Pasta a indexar: `docs/04_modules/`
   - Isso garante que o índice raiz reflita o novo módulo criado.

---

## 8. Passo Final: Comunicação

Após concluir, emita um sumário em markdown confirmando pro usuário:

1. Uma listagem com links da estrutura de pastas geradas em disco.
2. Afirme qual foi a baseline do `DOC-DEV-001` seguida em vigência.
3. Confirme que `mod.md` e `docs/INDEX.md` foram atualizados.
4. Sugira qual próximo arquivo primário o Desenvolvedor ou Product Manager deverá refinar primeiramente.
