# Agent Skills — Guia de Uso e Fluxo XP (Extreme Programming)

## 🗺️ O Pipeline Ágil (XP)

A arquitetura do EasyCodeFramework abraça a velocidade. Nós desmembramos o status gerencial do time (`status_agil`) da complexidade de `transition-specs`, permitindo fluidez orgânica até o momento do código.

```
[ IDEIA (TODO) ] → [ BDD/ESCopo (READY) ] → [ FORGE-MODULE ] → [ ENRIQUECIMENTO DRAFT (IN_PROGRESS) ] → [ SELADO (DONE) ]
```

---

## 1. `forge-module` — *A Forja XP (Scaffolding)*

**Quando usar:** Quando uma User Story recém-criada atinge a maturidade funcional e entra em `status_agil: READY`.

Ela substitui as antigas (e extintas) ferramentas `draft-user-story`, `transition-spec-status` e `scaffold-module`, fazendo tudo num fluxo contínuo.

**O que ela faz:**
1. Ela absorve o contexto do seu pedido e garante que a User Story atenda o DoR (Definition of Ready, ex: Gherkin e Escopo).
2. Tendo garantido que a US está `READY`, ela lê o normativo canônico `DOC-DEV-001`.
3. Ela imediatamente estrutura fisicamente toda a pasta do módulo `docs/04_modules/mod-XXX/` com seus arquivos de requisitos vazios (Stubs) marcados como `DRAFT`.
4. Todos os arquivos já nascem amarrados (`rastreia_para`) de volta à User Story original.

**Saída:** `docs/04_modules/mod-XXX/` gerado e atrelado no `docs/INDEX.md`.

> **Gatilho prático:** *"A partir da User Story X (Em READY), efetue a fundição completa do módulo."* ou *"Forge module da US-MOD-005"*

---

## 2. Autonomia do Agente (Enriquecimento DRAFT)

**Quando usar:** Logo em seguida ao `forge-module`, enquanto o módulo estiver em desenvolvimento (IN_PROGRESS).

A antiga skill de `update-specification` foi depreciada como bloqueador, passando seu poder de inferência de volta para o Agente de IA.
- Se o arquivo de requisitos possuir o aviso de `DRAFT`, o Agente é livre para **editar o texto do arquivo livremente** enquanto ajuda o desenvolvedor a implementar o código na IDE.

---

## 3. `create-amendment` — *Amendments Controlados (READY)*

**Quando usar:** Quando o módulo já estiver estabelecido e o desenvolvedor carimbou as especificações com a flag de estabilidade `estado_item: READY`. 

**Proteção Imutável:** Quando um stub abandona a fase DRAFT e vira READY, o arquivo é **selado**. Evoluções de arquitetura não podem mais alterar o texto mestre gerado anteriormente para preservar o rastreamento histórico. Toda evolução deverá gerar um "Anexo" (Amendment).

**Categorias de Evolução:**
- `M` (Melhoria)
- `R` (Revisão)
- `C` (Correção)

**O que a automação faz:**
Cria um documento sufixado (`FR-101-M02.md`) relacionando a alteração e atualizando o `CHANGELOG.md` do módulo.

> **Gatilho prático:** *"Criar emenda para adicionar a regra de notificação por email na FR-008 do MOD-005"*

---

## 4. `create-specification` — *Decisões Transversais (Tech Docs)*

**Quando usar:** Quando a necessidade **não é um módulo** atrelado à uma US, mas sim uma decisão cross-cutting (estratégia de caching, fluxos de CI/CD, documentação técnica de infra).

**Regra de Ouro:**
Se for uma feature de usuário (MOD-XXX), use `forge-module`. Se for arquitetura estática, use `create-specification`.

---

## 5. `create-oo-component-documentation` — *Engenharia Reversa (Pós-Código)*

**Quando usar:** Depois que o código real (Backend/APIs/Interfaces) estiver programado, para abstrair a documentação dele para referência usando o Arc42 e Diagramas C4.

**O que ela verifica:**
Audita Headers (RFC 9457), Correlation IDs, RBAC nativo e Tenants.

> **Gatilho prático:** *"Documentar o UserRepository.ts"*

---

## 6. `update-markdown-file-index` — *Indexação Segura*

**Quando usar:** Quando a evolução criar novos arquivos e você quiser refazer os sumários / roteiros das pastas e READMEs. A skill procura comentários mágicos `<!-- start index -->` para atualizar apenas o menu sem rasgar a página inteira.

---

### Resumo 

A nova arquitetura foca na produção rápida:
1. O desenvolvedor escreve o negócio.
2. O agente (`forge-module`) materializa a fundação física baseada no Documento Canônico `DOC-DEV-001`.
3. Ambos enriquecem os arquivos livremente em estado `DRAFT` na construção do código (`IN_PROGRESS`).
4. Quando tudo for entregue e testado (`DONE`), os requisitos viram `READY` e toda nova alteração demandará o comando `create-amendment`.
