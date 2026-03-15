# Revisao e Validacao de Decisoes Pendentes e Correcoes Estruturais

**Passe 3 -- Conferencia do Inventario de User Stories do Projeto Integrador A1 / ECF**

| Metadado | Valor |
|---|---|
| Data da Revisao | Marco 2026 |
| Documento Fonte | `Inventario_US_Plano_Acao_Integrador_A1.md` |
| Revisor | Arquitetura (Agente Rev) |
| Escopo | 14 Decisoes Pendentes (D01-D14) + 8 Correcoes Estruturais (C01-C08) |

---

## Secao 1: Decisoes Pendentes (D01-D14)

### D01 -- Rate Limit do MFA

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se o rate limit de tentativas de codigo TOTP no MFA deve ser por IP, por usuario, por temp_token ou hibrido. |
| **Feature Afetada** | US-MOD-000-F02 (MFA/TOTP) |
| **Contexto Atual** | O arquivo `US-MOD-000-F02.md` ja define explicitamente na Regra Critica 5: "Apos 5 tentativas invalidas com o mesmo temp_token, o token deve ser revogado e o usuario deve reiniciar o login. Rate limit de tentativas por temp_token (nao por IP)." O cenario Gherkin de brute-force tambem ja especifica 5+ tentativas por temp_token com retorno 429 e revogacao. |
| **Recomendacao** | **ACEITAR COMO ESTA** |
| **Justificativa** | A US-MOD-000-F02 ja incorporou a decisao (opcao C: temp_token) tanto nos cenarios Gherkin quanto nas regras criticas. A decisao ja esta de facto tomada e documentada no artefato tecnico. Basta formalizar como ADR para registro. |
| **Prioridade** | **MEDIA** -- ja resolvida no artefato, falta apenas formalizacao |

### D02 -- Contratos de Integracao Google/Microsoft (INT-000-01, INT-000-02)

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Os contratos de integracao com Google OAuth2 (INT-000-01) e Microsoft OAuth2 (INT-000-02) nao existem como artefatos fisicos no repositorio. |
| **Feature Afetada** | US-MOD-000-F03 (SSO Google + Microsoft) |
| **Contexto Atual** | O arquivo `US-MOD-000-F03.md` referencia INT-000-01 e INT-000-02 no cabecalho e na Regra Critica 9 (exigindo Timeout, Retry, Backoff/Jitter e Fallback conforme DOC-DEV-001 ss4.3). A DoR lista explicitamente "Contratos INT-000-01 e INT-000-02 criados com retry/timeout/fallback documentados" como prerequisito. Busca no repositorio confirma: **nenhum arquivo INT-000-01 ou INT-000-02 existe.** |
| **Recomendacao** | **ACEITAR COMO ESTA** (opcao A: criar antes) |
| **Justificativa** | A recomendacao do inventario (criar antes) e correta. A F03 ja documenta o que os contratos devem conter. Basta criar os arquivos fisicos em `04_modules/mod-000-foundation/requirements/int/` seguindo o template de integracao. Trabalho estimado: 2-3 horas. |
| **Prioridade** | **BLOQUEANTE** -- sem estes artefatos, a DoR da F03 nao e atendida |

### D03 -- Contrato MailService (INT-000-MAIL)

| Aspecto | Detalhe |
|---|---|
| **Descricao** | O contrato de integracao com servico de e-mail (INT-000-MAIL) nao existe como artefato fisico. |
| **Feature Afetada** | US-MOD-000-F04 (Recuperacao de Senha), US-MOD-002 (Cadastro de Usuarios) |
| **Contexto Atual** | A US-MOD-000-F04 define na Regra Critica 4 a interface `MailService.sendPasswordResetEmail(email, link)` com Timeout, Retry (3x), Backoff exponencial e DLQ. A US-MOD-000-F05 tambem referencia `MailService.sendWelcomeEmail` como fire-and-forget. O MOD-002 menciona envio de convite por e-mail. Busca no repositorio confirma: **nenhum arquivo INT-000-MAIL existe.** |
| **Recomendacao** | **ACEITAR COMO ESTA** (opcao A: criar interface + console adapter) |
| **Justificativa** | A abordagem de criar a interface abstrata agora com adapter de console para dev e a mais pragmatica. As US ja documentam o contrato funcional. O artefato INT-000-MAIL deve formalizar: interface TypeScript, politica de retry/timeout/DLQ, adapter de console para dev, e slot para provider real (SendGrid, SES, etc.) em producao. |
| **Prioridade** | **BLOQUEANTE** -- bloqueia F04 e MOD-002, ambos na Wave 1 |

### D04 -- Sobreposicao F05 (auto-registro) vs MOD-002 (cadastro admin)

| Aspecto | Detalhe |
|---|---|
| **Descricao** | A F05 (CRUD Usuarios + Auto-Registro) e o MOD-002 (Cadastro de Usuarios pelo Admin) compartilham responsabilidade sobre criacao de usuarios, com regras de seguranca conflitantes (publico vs protegido). |
| **Feature Afetada** | US-MOD-000-F05, US-MOD-002 |
| **Contexto Atual** | A US-MOD-000-F05 define `POST /api/v1/users` como endpoint publico de auto-registro. O MOD-002 define um fluxo de cadastro exclusivo para administradores autenticados com permissao. Ambos criam usuarios na mesma tabela `users`/`content_users` mas com regras de validacao, campos obrigatorios e fluxos de ativacao distintos. Nao existe ADR documentando a separacao. |
| **Recomendacao** | **ACEITAR COMO ESTA** (opcao B: endpoints separados) |
| **Justificativa** | A separacao em `POST /api/v1/users` (publico, auto-registro) e `POST /api/v1/admin/users` (protegido, cadastro admin) e a abordagem mais segura e limpa. Evita que middleware de autenticacao condicional complique a rota. Requer ADR formal documentando: (1) separacao de endpoints, (2) campos obrigatorios distintos por fluxo, (3) regras de ativacao por fluxo. |
| **Prioridade** | **BLOQUEANTE** -- sem ADR, ambas as US tem conflito semantico |

### D05 -- Hard Delete vs Soft Delete de Roles (PENDENTE-F06-001)

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se a exclusao de roles deve ser hard delete (remocao fisica) ou soft delete (INACTIVE + deletedAt). |
| **Feature Afetada** | US-MOD-000-F06 (Roles/RBAC) |
| **Contexto Atual** | A US-MOD-000-F06 ja define na Regra Critica 5: "Soft Delete de Roles: A exclusao preenche deletedAt e altera status=INACTIVE. Nao utiliza remocao fisica (hard delete) para preservar historico referencial de auditoria." O cenario Gherkin de exclusao tambem especifica soft delete. A DoR lista "PENDENTE-F06-001 resolvido" como prerequisito, mas o conteudo da US ja incorpora a decisao. O epico US-MOD-000 tambem define na Regra 10: "Soft-delete obrigatorio: hard deletes diretos sao proibidos em dados faturaveis/auditaveis sem acionar deleted_at." |
| **Recomendacao** | **ACEITAR COMO ESTA** |
| **Justificativa** | Decisao ja tomada e documentada tanto na F06 quanto no epico. Consistente com o padrao do projeto inteiro. Basta remover o PENDENTE-F06-001 da DoR (ou marca-lo como resolvido) e formalizar como ADR curta. |
| **Prioridade** | **BAIXA** -- ja resolvida, falta apenas remover a marca de pendencia |

### D06 -- Wildcards em Escopos (PENDENTE-F12-003)

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se o sistema suportara wildcards em escopos de permissao (ex: `finance:*:*`) para admins globais. |
| **Feature Afetada** | US-MOD-000-F12 (Catalogo de Permissoes) |
| **Contexto Atual** | A US-MOD-000-F12 documenta explicitamente o PENDENTE-F12-003 com recomendacao "Opcao A por ora: manter simples; wildcards sao extensao futura." O regex do padrao de escopos na F06 (`^[a-z_]+:[a-z_]+:[a-z_]+$`) nao aceita `*`, o que torna wildcards incompativeis com a validacao atual. |
| **Recomendacao** | **ACEITAR COMO ESTA** (opcao A: sem wildcards) |
| **Justificativa** | Manter simples na Fase 1 e a abordagem correta. Wildcards adicionam complexidade significativa ao middleware `requireScope`, exigem mudanca de regex e logica de matching. Pode ser adicionado como extensao futura quando houver demanda real de admin global. Formalizar como ADR com gatilho de revisao futuro. |
| **Prioridade** | **BAIXA** -- decisao clara, ja documentada na US |

### D07 -- Schema v1 do Screen Manifest Nao Existe

| Aspecto | Detalhe |
|---|---|
| **Descricao** | O schema JSON para validacao dos Screen Manifests YAML precisa existir para que F15 (CI validator) e todos os manifests UX possam ser validados. |
| **Feature Afetada** | US-MOD-000-F15 (CI Gates), US-MOD-001-F01, US-MOD-001-F03, todos os Screen Manifests |
| **Contexto Atual** | **DECISAO JA RESOLVIDA NO REPOSITORIO.** O arquivo `docs/05_manifests/schemas/screen-manifest.v1.schema.json` **existe** no repositorio. Alem disso, 5 Screen Manifests YAML ja foram criados: `ux-auth-001.login.yaml`, `ux-shell-001.app-shell.yaml`, `ux-dash-001.main.yaml`, `ux-user-001.users-list.yaml`, `ux-user-002.user-detail-edit.yaml`. |
| **Recomendacao** | **ACEITAR COMO ESTA** -- marcar como resolvida |
| **Justificativa** | O inventario foi escrito antes da criacao destes artefatos. O schema v1 ja existe e 5 manifests ja o utilizam. D07 pode ser encerrada. |
| **Prioridade** | **BAIXA** -- ja resolvida |

### D08 -- DOC-PADRAO-005 (Storage) Nao Formalizado

| Aspecto | Detalhe |
|---|---|
| **Descricao** | O normativo DOC-PADRAO-005 sobre Storage e Upload precisava ser formalizado antes de F16 poder avancar. |
| **Feature Afetada** | US-MOD-000-F16 (Storage e Upload Centralizado) |
| **Contexto Atual** | **DECISAO JA RESOLVIDA NO REPOSITORIO.** O arquivo `docs/01_normativos/DOC-PADRAO-005_Storage_e_Upload.md` **existe** com Status READY, versao 1.0.0. Define principios fundamentais, modelo de tabela `storage_objects`, fluxo Two-Step com Presigned URLs, provider-agnostico. A DoR da F16 lista "Normativa DOC-PADRAO-005 formalizada em 01_normativos" -- este item ja esta atendido. |
| **Recomendacao** | **ACEITAR COMO ESTA** -- marcar como resolvida |
| **Justificativa** | O normativo existe e esta em status READY. D08 pode ser encerrada. |
| **Prioridade** | **BAIXA** -- ja resolvida |

### D09 -- F17 (Apple ID) -- Aprovacao Separada ou Junto ao Epico

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se a F17 (Sign in with Apple) deve ser aprovada junto com o epico MOD-000 ou em fase separada. |
| **Feature Afetada** | US-MOD-000-F17 (Sign in with Apple) |
| **Contexto Atual** | A US-MOD-000-F17 ja foi criada com status DRAFT. No epico US-MOD-000, a F17 aparece na tabela de sub-historias com status `APPROVED` (curiosamente, a unica feature ja aprovada). A F17 depende de contrato INT-000-03 (que nao existe), migration para campo `apple_sub`, e chave privada `.p8` da Apple. A recomendacao do inventario (opcao B: separada, fase 2) e razoavel pois Apple ID nao e bloqueante para Wave 1 (login corporativo funciona com Google + Microsoft). |
| **Recomendacao** | **EMENDAR** -- separar em fase 2, mas corrigir status no epico |
| **Justificativa** | A F17 esta marcada como APPROVED no epico, o que e inconsistente: (1) o epico inteiro ainda esta DRAFT, (2) a F17 tem pendencias de DoR nao atendidas (INT-000-03, migration, vars de ambiente). Recomendacao: (a) corrigir status da F17 no epico para DRAFT, (b) mover F17 para fase 2 pos-Wave 1, (c) nao bloquear a aprovacao do epico MOD-000 por causa dela. |
| **Prioridade** | **ALTA** -- a inconsistencia de status precisa ser corrigida |

### D10 -- 4 Screen Manifests Declarados Mas Nao Criados

| Aspecto | Detalhe |
|---|---|
| **Descricao** | O inventario declara que UX-AUTH-001, UX-SHELL-001, UX-DASH-001 e UX-USR-001 nao tinham YAMLs criados. |
| **Feature Afetada** | US-MOD-001-F01, US-MOD-001-F03, US-MOD-002 |
| **Contexto Atual** | **PARCIALMENTE RESOLVIDA.** Verificacao no repositorio mostra que 3 dos 4 manifests **ja existem**: `ux-auth-001.login.yaml`, `ux-shell-001.app-shell.yaml`, `ux-dash-001.main.yaml`. Alem disso, existem `ux-user-001.users-list.yaml` e `ux-user-002.user-detail-edit.yaml` (que cobrem parte do UX-USR-001). O manifesto formal "UX-USR-001" como cadastro de usuarios pelo admin (MOD-002) pode ja estar coberto pelos manifests ux-user existentes, mas precisa verificacao de escopo. |
| **Recomendacao** | **EMENDAR** -- verificar cobertura dos manifests ux-user para MOD-002 |
| **Justificativa** | 3 de 4 manifests ja existem. O quarto (UX-USR-001 para cadastro admin) pode estar coberto pelos manifests ux-user-001 (lista) e ux-user-002 (detalhe/edicao). Necessario verificar se o escopo de cadastro admin esta contemplado ou se e preciso um manifest adicional com foco na tela de criacao de usuario pelo administrador. |
| **Prioridade** | **MEDIA** -- maioria ja resolvida, falta validacao de cobertura |

### D11 -- MOD-002: CPF/Documento e Obrigatorio?

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se CPF/documento de identificacao e campo obrigatorio, opcional ou configuravel por tenant no cadastro de usuarios. |
| **Feature Afetada** | US-MOD-002 (Cadastro de Usuarios) |
| **Contexto Atual** | O MOD-002 lista "Documento" como campo opcional na secao 7 (Campos Esperados no Formulario). A US-MOD-000-F05 define `cpfCnpj` como campo da tabela `content_users` com constraint `UNIQUE` mas sem indicacao clara de obrigatoriedade. A secao "Observacoes para Refinamento" do MOD-002 confirma: "Confirmar necessidade de CPF/documento e regras de mascaramento." |
| **Recomendacao** | **ACEITAR COMO ESTA** (opcao C: configuravel por tenant) |
| **Justificativa** | A opcao de configurabilidade por tenant e a mais flexivel e alinhada com a arquitetura multi-tenant do projeto. Permite que cada tenant defina se CPF e obrigatorio conforme sua realidade (LGPD, pais, tipo de negocio). Alinha-se com o conceito de enquadradores contextuais do Caderno 03 (MOD-005). |
| **Prioridade** | **ALTA** -- afeta modelo de dados e validacoes do MOD-002 |

### D12 -- MOD-002: Politica de Ativacao de Usuario

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se o cadastro de usuario pelo admin usa senha temporaria, convite por e-mail ou ambos. |
| **Feature Afetada** | US-MOD-002 (Cadastro de Usuarios) |
| **Contexto Atual** | O MOD-002 descreve ambos os fluxos nas secoes 2 e 3 (Cenarios Gherkin): "Cadastro com senha definida no ato" (cenario 8) e "Enviar convite de ativacao por e-mail" (cenario 7). A secao "Observacoes para Refinamento" confirma: "Definir se havera ativacao por e-mail ou senha temporaria." |
| **Recomendacao** | **ACEITAR COMO ESTA** (opcao C: ambos) |
| **Justificativa** | O MOD-002 ja documenta ambos os fluxos nos cenarios Gherkin. Suportar ambos e a abordagem mais completa e ja esta alinhada com o que o artefato descreve. A politica ativa pode ser configuravel por tenant ou por decisao do PO. Depende de D03 (INT-000-MAIL) para o fluxo de convite. |
| **Prioridade** | **MEDIA** -- os cenarios ja cobrem ambos os fluxos |

### D13 -- MOD-002: Identificador Unico do Usuario

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se o identificador unico do usuario e email, login separado ou email como login. |
| **Feature Afetada** | US-MOD-002 (Cadastro de Usuarios) |
| **Contexto Atual** | A tabela `users` definida na US-MOD-000-F05 tem `email` como UNIQUE e `codigo` como identificador amigavel de negocio. O MOD-002 usa email como campo obrigatorio e valida unicidade por email. O fluxo de login (F01) usa email como credencial. |
| **Recomendacao** | **ACEITAR COMO ESTA** (opcao C: email como login) |
| **Justificativa** | O email ja e UNIQUE na tabela `users`, ja e usado como credencial de login na F01, e ja e o campo de vinculacao no SSO (F03, F17). Introduzir um "login" separado adicionaria complexidade sem beneficio claro. O campo `codigo` (ex: `usr-00042`) ja serve como identificador amigavel de negocio para fins internos. |
| **Prioridade** | **MEDIA** -- ja implementado de facto, falta apenas formalizacao |

### D14 -- Cadernos 01-05 Viram Modulos Tecnicos ou Ficam como Referencia?

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Definir se os Cadernos conceituais 01-05 devem gerar modulos tecnicos (MOD-003 a MOD-007) ou permanecer apenas como referencia conceitual. |
| **Feature Afetada** | Todos os modulos novos (MOD-003 a MOD-007), escopo total do projeto |
| **Contexto Atual** | O inventario propoe 36 novas US distribuidas em 5 modulos novos (MOD-003 a MOD-007) com 31 features e 13 telas UX. Nenhum destes modulos existe no repositorio. A pasta `04_modules/` so possui referencias a MOD-000 e MOD-001 na tabela de modulos existentes. |
| **Recomendacao** | **ESCALAR** (necessita decisao PO + Arquitetura) |
| **Justificativa** | Esta e a decisao de maior impacto do inventario. Criar MOD-003 a MOD-007 multiplica o escopo do projeto por 3.5x (de 21 US existentes para 70). A decisao deve considerar: (1) cronograma e capacidade do time, (2) prioridade de negocio dos Cadernos, (3) possibilidade de abordagem incremental (criar MOD-003 primeiro, depois avaliar os demais). Recomendacao tecnica: criar os modulos de forma incremental, comecando por MOD-003 (Estrutura Organizacional) que e prerequisito para MOD-004 e MOD-005. |
| **Prioridade** | **BLOQUEANTE** -- define o escopo total do projeto e o planejamento de Waves 2-5 |

---

## Secao 2: Correcoes Estruturais (C01-C08)

### C01 -- Aplicar Taxonomia Unificada de Status

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Padronizar os status de US/features: DRAFT > READY > IN_REVIEW > APPROVED > AMENDED > REJECTED. |
| **Estado Atual no Repo** | Inconsistencia: O epico US-MOD-000 usa `DRAFT` no metadado `status_agil` mas lista sub-historias como `READY` e uma como `APPROVED` (F17). As features individuais usam `DRAFT` no campo `status_agil` dos metadados, mas na tabela do epico aparecem como `READY`. Ha divergencia entre metadados da feature e tabela do epico. |
| **Verificacao** | **CONFIRMADA NECESSARIA** |
| **Acao Recomendada** | (1) Definir taxonomia canonica em DOC-DEV-001. (2) Atualizar TODOS os arquivos de US/features para consistencia entre `status_agil` nos metadados e tabela do epico pai. (3) Corrigir F17 (APPROVED no epico vs DRAFT no arquivo). |

### C02 -- Adicionar nivel_arquitetura ao MOD-002

| Aspecto | Detalhe |
|---|---|
| **Descricao** | O MOD-002 nao declara nivel de arquitetura. Recomendado: nivel 1. |
| **Estado Atual no Repo** | O campo `nivel_arquitetura` **ja existe** no MOD-002 com valor `1`. |
| **Verificacao** | **JA FEITA** |
| **Acao Recomendada** | Nenhuma. C02 pode ser encerrada. |

### C03 -- Criar Epico Pai Formal para MOD-002

| Aspecto | Detalhe |
|---|---|
| **Descricao** | O MOD-002 referencia EPIC-MOD-002 que nao existe. Criar com DoR/DoD e regra de cascata. |
| **Estado Atual no Repo** | O arquivo `US-MOD-002.md` em `epics/` funciona como epico de facto mas nao segue a estrutura formal com cascata de aprovacao como US-MOD-000. Os metadados referenciam `EPIC-MOD-002` mas o arquivo nao existe com esse nome. |
| **Verificacao** | **CONFIRMADA NECESSARIA** -- com ressalva |
| **Acao Recomendada** | (1) Reestruturar US-MOD-002.md para incluir DoR/DoD do epico e regra de cascata (similar ao US-MOD-000). (2) Corrigir referencia de `EPIC-MOD-002` para `US-MOD-002` nos metadados. (3) Eventualmente separar features do MOD-002 em arquivos individuais. |

### C04 -- Adicionar Metadados Padronizados em Todas as 20+ US

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Adicionar campos: status_agil, owner, nivel_arquitetura, wave_entrega, epico_pai, manifests_vinculados, pendencias. |
| **Estado Atual no Repo** | As features ja possuem bloco "Metadados de Governanca" com status_agil, owner, data_ultima_revisao, rastreia_para, nivel_arquitetura, referencias_exemplos, evidencias. **Faltam**: wave_entrega, epico_pai (como campo explicitamente nomeado), manifests_vinculados, pendencias. |
| **Verificacao** | **CONFIRMADA NECESSARIA** -- parcialmente implementada |
| **Acao Recomendada** | (1) Definir bloco canonico de metadados no README de 04_modules. (2) Adicionar campos faltantes a todas as US existentes. (3) Atualizar template de criacao de novas US. |

### C05 -- Resolver F11 como Infra ECF (Nao Sub-Historia do MOD-000)

| Aspecto | Detalhe |
|---|---|
| **Descricao** | A F11 (GET /info) e nivel 0 e nao depende do epico MOD-000. Deve ser implementada imediatamente como infra do framework. |
| **Estado Atual no Repo** | O arquivo `US-MOD-000-F11.md` **ja documenta** esta separacao: "Por ser infraestrutura do framework (nivel 0), esta US nao requer aprovacao do epico MOD-000 para ser implementada." Porem, na tabela de sub-historias do epico, F11 ainda aparece como sub-historia. |
| **Verificacao** | **CONFIRMADA NECESSARIA** -- inconsistencia entre declaracao e posicionamento |
| **Acao Recomendada** | (1) Adicionar nota no epico que F11 nao depende da cascata. (2) Priorizar implementacao imediata (4 cenarios, nivel 0, sem dependencias). (3) Atualizar tabela do epico. |

### C06 -- Criar Fichas de Rastreabilidade Cadernos > US

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Cada secao dos Cadernos 01-05 deve ter codigo, US de destino, status de cobertura. |
| **Estado Atual no Repo** | O inventario lista origens com "Caderno 01 sec2", etc., mas nenhuma ficha formal de rastreabilidade existe. |
| **Verificacao** | **CONFIRMADA NECESSARIA** |
| **Acao Recomendada** | Este documento (Pass 2) cumpre parcialmente este requisito. Formalizar como artefato permanente em `docs/Pacote_Estruturado_Projeto_Integrador/`. |

### C07 -- Adicionar Campos de Observabilidade nos domain_events

| Aspecto | Detalhe |
|---|---|
| **Descricao** | Adicionar campos: enquadrador_id, rotina_id+versao, movimento_controlado_id, agente_mcp_id, estagio_id, nivel_organizacional nos domain events. |
| **Estado Atual no Repo** | Estes campos sao necessarios apenas quando os modulos MOD-003 a MOD-007 forem implementados (Waves 2-5). A estrutura atual de domain events suporta correlation_id, causation_id, entity_type, entity_id, sensitivity_level. |
| **Verificacao** | **NAO APLICAVEL** -- prematura para o estado atual |
| **Acao Recomendada** | Adiar para quando MOD-003+ forem efetivamente criados. Cada modulo novo define seus campos adicionais via amendment ao DATA-003. Revisitar na Wave 2. |

### C08 -- Declarar Dependencia F16 no MOD-002

| Aspecto | Detalhe |
|---|---|
| **Descricao** | O MOD-002 menciona avatar mas nao lista F16 (Storage) como dependencia. |
| **Estado Atual no Repo** | MOD-002 lista dependencias de "Modulo de autenticacao/autorizacao", "Servico de envio de e-mail", etc., mas **nao menciona Storage/Upload**. A F05 define `avatarUrl` em `content_users`. |
| **Verificacao** | **CONFIRMADA NECESSARIA** |
| **Acao Recomendada** | (1) Adicionar "Modulo de Storage e Upload (F16/DOC-PADRAO-005)" nas Dependencias do MOD-002. (2) Definir se avatar e escopo do cadastro admin (MOD-002) ou apenas da edicao de perfil (F08). |

---

## Resumo Executivo

### Decisoes por Prioridade

| Prioridade | Quantidade | IDs |
|---|---|---|
| **BLOQUEANTE** | 4 | D02, D03, D04, D14 |
| **ALTA** | 2 | D09, D11 |
| **MEDIA** | 4 | D01, D10, D12, D13 |
| **BAIXA** | 4 | D05, D06, D07, D08 |
| **Total** | **14** | |

> **Nota:** D07 e D08 ja estao resolvidas no repositorio. D01, D05 e D06 ja estao de facto decididas nos artefatos, faltando apenas formalizacao.

### Correcoes por Status

| Status | Quantidade | IDs |
|---|---|---|
| **CONFIRMADA NECESSARIA** | 5 | C01, C03, C04, C05, C06 |
| **JA FEITA** | 1 | C02 |
| **NAO APLICAVEL** | 1 | C07 |
| **CONFIRMADA (parcial)** | 1 | C08 |
| **Total** | **8** | |

### Bloqueantes Criticos para Inicio da Criacao de US

Os seguintes itens **devem** ser resolvidos antes de iniciar a criacao de novas User Stories:

1. **D02 + D03**: Criar os contratos de integracao INT-000-01, INT-000-02, INT-000-MAIL como artefatos fisicos. Sem eles, F03 e F04 nao atendem a DoR.

2. **D04**: Produzir ADR formal documentando a separacao de endpoints entre auto-registro (F05) e cadastro admin (MOD-002).

3. **D14**: Obter decisao do PO + Arquitetura sobre a criacao dos modulos MOD-003 a MOD-007. Define se o projeto tera 21 ou 70 User Stories.

4. **C01**: Resolver inconsistencia de status entre metadados das features e tabela do epico.

5. **D09/C01 relacionado**: Corrigir status da F17 no epico (APPROVED vs DRAFT).

### Itens Ja Resolvidos (Podem ser Encerrados)

- **D07** -- Schema v1 do Screen Manifest ja existe
- **D08** -- DOC-PADRAO-005 ja formalizado (READY)
- **C02** -- nivel_arquitetura ja existe no MOD-002
- **D01, D05, D06** -- Decisoes ja incorporadas nos artefatos, faltando apenas ADR formal

---

*Documento de conferencia gerado em 2026-03-13 -- Pass 3 (Decisoes Pendentes e Correcoes Estruturais)*
