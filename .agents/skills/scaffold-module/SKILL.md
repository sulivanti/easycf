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

- **Caminho da User Story**: O caminho para o arquivo Markdown localizado em `docs/04_modules/user-stories/US-MOD-XXX.md`.

**REGRA DE BLOQUEIO (GATE DE APROVAÇÃO):**
Você deve ler o arquivo da User Story informada. Verifique o campo `Status:`.
Se o status **não for** `aprovada`, você **ESTÁ PROIBIDO** de gerar qualquer arquivo. Interrompa a execução e informe ao usuário que a US precisa estar aprovada (ela pode estar `em desenvolvimento`, `em revisao`, `para aprovação`, ou `reprovada`). Apenas proceda se estiver `aprovada`.

**REGRA ANTI-ENCADEAMENTO (HUMAN-IN-THE-LOOP):**
Se VOCÊ MESMO (agente de IA) acabou de terminar de escrever e salvar o arquivo da US na mesma interação (comportamento "agent chaining"), você **ESTÁ PROIBIDO** de realizar o Scaffold ou trocar o status para "aprovada" no meio do caminho. O processo deve parar após gerar a US e ficar aguardando nova validação estrita do Usuário Humano.

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
├── CHANGELOG.md                    ← Tabela inicial (Versão | Data | Responsável | Descrição)
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
   > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
   ```

   Isso não é delegado à leitura do `DOC-DEV-001` — é uma regra de execução desta skill. Nenhum arquivo gerado pelo scaffold pode nascer sem esse aviso. Essa tag é o contrato de rastreabilidade e proteção do arquivo desde o nascimento (conforme `DOC-DEV-001`).
4. **INJEÇÃO ATIVA DOS DADOS (PROIBIDO PLACEHOLDERS):** É expressamente PROIBIDO gerar arquivos copiando os placeholders vazios do template (como `- Regra: ...`, `<Nome>`, `<titulo>`, `[ ] Sim [ ] Não`). Você DEVE ativamente aplicar as informações lidas da **User Story fornecida** e preencher os artefatos com conteúdo rico e deduzido:
   - No **BR-{ID}.md**: Inverta o texto genérico pela Regra de Negócio real da US. Inclua os Critérios de Aceite em (Gherkin) listados de fato na US.
   - No **FR-{ID}.md**: Detalhe os Endpoints REST ou telas que serão impactados (conforme US) e defina explicitamente "Done Funcional".
   - No **DATA-{ID}.md**: Descreva ou infira as colunas que nascerão no banco e os possíveis Eventos de Domínio (`domain_events`) requeridos pela feature.
   - No **SEC-{ID}.md**: Preencha políticas de auditoria, restrição de rotas ou rate-limits citados explicitamente na US.
5. No campo `rastreia_para` presente no rodapé de cada arquivo (estipulado pelo DOC-DEV-001), amarre a todos os outros arquivos irmãos do mesmo nó e **inclua a referência à US de origem**.
6. No campo `referencias_exemplos`, preencha com o link relativo para a User Story de aprovação (ex: `[US-MOD-101](../../user-stories/US-MOD-101.md)`).
7. Conforme o `DOC-DEV-001` (fonte da verdade normativa), o estado inicial de todo arquivo gerado deve ser rigorosamente **DRAFT**. Os arquivos base **não devem ser editados diretamente** após a geração — qualquer evolução deve passar pela skill `create-amendment`.
8. Salve o arquivo em disco.

---

## 6. PASSO INTERMEDIÁRIO: Atualização dos Índices (update-markdown-file-index)

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

## 7. Passo Final: Comunicação

Após concluir, emita um sumário em markdown confirmando pro usuário:

1. Uma listagem com links da estrutura de pastas geradas em disco.
2. Afirme qual foi a baseline do `DOC-DEV-001` seguida em vigência.
3. Confirme que `mod.md` e `docs/INDEX.md` foram atualizados.
4. Sugira qual próximo arquivo primário o Desenvolvedor ou Product Manager deverá refinar primeiramente.
