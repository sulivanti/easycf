**INVENTARIO COMPLETO DE USER STORIES**

Projeto Integrador A1 / ECF

Lista de US + Pontos de Decisao + Plano de Acao

  ---------------------- ------------------------------------------------
  **Metadado**           **Valor**

  Data                   Marco 2026

  Escopo                 Todas as US necessarias para implantar 100% da
                         documentacao

  US Existentes          20 features (F01-F17 MOD-000 + F01-F03
                         MOD-001) + MOD-002

  US Novas Propostas     31 novas US para cobrir gaps dos Cadernos 01-05

  US Candidatas Caderno  20 (US-001 a US-020) - sem artefato tecnico
  05                     

  Total Inventariado     51+ User Stories mapeadas neste documento

  Pontos de Decisao      14 decisoes pendentes identificadas
  ---------------------- ------------------------------------------------

PARTE 1 - Inventario Completo de User Stories

Este inventario lista TODAS as User Stories necessarias para implantar a
documentacao completa do projeto, incluindo: features existentes
(MOD-000, MOD-001, MOD-002), US novas para cobrir os Cadernos
conceituais (MOD-003 a MOD-007), e telas UX para cada modulo.

1.1 MOD-000 - Foundation (Existentes: 17 Features)

**Epico pai:** US-MOD-000 \| Status: DRAFT v0.5.0 \| Bloqueio de cascata
ATIVO

  -------- -------- ------------------------------------------- ------------------------ ------------- ----------- ------------ ------------------------
  **\#**   **ID**   **Tema**                                    **Endpoints**            **Gherkin**   **Nivel**   **Status**   **Bloqueios/Decisoes**

  1        F01      Auth Nativa                                 POST /auth/login,        10 cenarios   2           DRAFT        Nenhum - PRONTA
                    (Login/Logout/Sessao/Kill-Switch/Refresh)   /logout, /refresh, GET                                          
                                                                /auth/me, /sessions,                                            
                                                                DELETE /sessions                                                

  2        F02      MFA/TOTP (RFC 6238)                         POST /auth/mfa/verify    7 cenarios    2           DRAFT        D01: Rate limit por IP
                                                                                                                                vs temp_token

  3        F03      SSO Google + Microsoft (OAuth2)             GET /auth/google,        6 cenarios    2           DRAFT        D02: Contratos
                                                                /microsoft + callbacks                                          INT-000-01 e INT-000-02
                                                                                                                                nao criados

  4        F04      Recuperacao de Senha (token UUID, TTL 1h)   POST                     8 cenarios    1           DRAFT        D03: Contrato
                                                                /auth/forgot-password,                                          INT-000-MAIL nao criado
                                                                /reset-password                                                 

  5        F05      CRUD Usuarios + Auto-Registro + Soft Delete POST/GET/DELETE          4 cenarios    1           DRAFT        D04: Sobreposicao com
                                                                /api/v1/users                                                   MOD-002 (ADR necessaria)

  6        F06      Roles/RBAC por Escopos + Cache Redis        POST/PUT/DELETE          6 cenarios    2           DRAFT        D05: PENDENTE-F06-001
                                                                /api/v1/roles                                                   (hard vs soft delete
                                                                                                                                roles)

  7        F07      Filiais Multi-Tenant (CRUD + Kill-Switch    POST/PUT/DELETE/GET      5 cenarios    2           DRAFT        Nenhum - PRONTA
                    Org)                                        /api/v1/tenants                                                 

  8        F08      Perfil Autenticado (/auth/me + edicao)      GET /auth/me, PUT        6 cenarios    1           DRAFT        Nenhum - PRONTA
                                                                /users/:id                                                      

  9        F09      Vinculacao Usuario-Filial com Role          POST/PUT/PATCH/DELETE    6 cenarios    2           DRAFT        Nenhum - PRONTA
                                                                /tenants/:id/users                                              

  10       F10      Alteracao de Senha Autenticada              PUT                      10 cenarios   2           DRAFT        Nenhum - PRONTA
                                                                /auth/change-password                                           

  11       F11      GET /info (Metadados do Sistema)            GET /info                4 cenarios    0           DRAFT        DESBLOQUEAVEL - nao
                                                                                                                                depende do epico

  12       F12      Catalogo de Permissoes (CRUD escopos        GET/POST/PUT/DELETE      12 cenarios   2           DRAFT        D06: PENDENTE-F12-003
                    pre-definidos)                              /api/v1/permissions                                             (wildcards
                                                                                                                                finance:\*:\*)

  13       F13      Utilitario Telemetria UI (UIActionEnvelope) Pacote frontend          2 cenarios    1           DRAFT        Nenhum - PRONTA

  14       F14      Middleware CorrelationId E2E                Middleware Fastify       2 cenarios    1           DRAFT        Nenhum - PRONTA

  15       F15      CI Gates (Screen Manifest Validator)        CLI script               1 cenario     0           DRAFT        D07: Schema v1 do
                                                                                                                                Manifest NAO EXISTE

  16       F16      Storage e Upload Centralizado (Presigned    POST /uploads/presign,   4 cenarios    1           DRAFT        D08: DOC-PADRAO-005 nao
                    URLs)                                       /confirm, GET                                                   formalizado
                                                                /signed-url                                                     

  17       F17      Sign in with Apple (OIDC/JWKS)              GET /auth/apple, POST    7 cenarios    2           DRAFT        D09: Aprovacao separada
                                                                /auth/apple/callback                                            ou junto ao epico?
  -------- -------- ------------------------------------------- ------------------------ ------------- ----------- ------------ ------------------------

**Resumo MOD-000:** 7 prontas (F01,F07,F08,F09,F10,F13,F14) \| 1
desbloqueavel (F11) \| 9 com decisoes pendentes

1.2 MOD-000 - Features NOVAS Propostas (F18-F22)

Features adicionais necessarias para cobrir gaps do Caderno 01 que
pertencem ao dominio de Foundation:

  -------- ------------ ------------------------------------------- ------------- -------------------- ------------------
  **\#**   **ID         **Tema**                                    **Origem      **Justificativa**    **Complexidade**
           Proposto**                                               (Caderno)**                        

  18       F18          Segregacao de Funcoes (regras de            Caderno 01 -  F06 faz RBAC mas nao Media
                        incompatibilidade entre papeis)             Principio     impede que mesmo     
                                                                    obrigatorio 3 usuario tenha papeis 
                                                                                  conflitantes         
                                                                                  (operar+aprovar)     

  19       F19          Compartilhamento Controlado de Acesso com   Caderno 01 -  Nao existe mecanismo Alta
                        Vigencia                                    Componente 7  para ampliar         
                                                                                  visibilidade alem do 
                                                                                  escopo com regra     
                                                                                  formal e temporaria  

  20       F20          Cadastro de Contas Tecnicas e Agentes       Caderno 01 -  F01 trata identidade Media
                        Associados                                  Secao 7       humana. Faltam       
                                                                                  contas tecnicas e    
                                                                                  agentes como         
                                                                                  identidades          
                                                                                  separadas            

  21       F21          Governanca de Acesso                        Caderno 01 -  Nao existe fluxo     Alta
                        (Solicitacao/Aprovacao/Revisao/Revogacao)   Secao 8       formal de            
                                                                                  solicitacao e        
                                                                                  aprovacao de acesso  

  22       F22          Ownership e Responsabilidade por Registro   Caderno 01 -  F05/F08 nao possuem  Media
                                                                    Camada 4 da   conceito de          
                                                                    Regra-mae     ownership que        
                                                                                  interfere em         
                                                                                  visibilidade         
  -------- ------------ ------------------------------------------- ------------- -------------------- ------------------

1.3 MOD-001 - Backoffice Admin (Existentes: 3 Features)

**Epico pai:** US-MOD-001 \| Status: DRAFT v0.1.0 \| Abordagem UX-First

  -------- ------------- ----------------- --------------- ------------- ------------ -----------------
  **\#**   **ID**        **Tema**          **Manifests**   **Gherkin**   **Status**   **Bloqueios**

  1        MOD-001-F01   Shell de          UX-AUTH-001 +   6 cenarios    DRAFT        D10: Manifests
                         Autenticacao e    UX-SHELL-001                               YAML nao criados
                         Layout Base                                                  

  2        MOD-001-F02   Telemetria de UI  Todos os 3      5 cenarios    DRAFT        Depende de
                         e Rastreabilidade manifests                                  F13+F14 prontos
                         do Shell                                                     

  3        MOD-001-F03   Dashboard         UX-DASH-001     5 cenarios    DRAFT        D10: Manifest
                         Administrativo                                               YAML nao criado
                         Executivo                                                    
  -------- ------------- ----------------- --------------- ------------- ------------ -----------------

1.4 MOD-002 - Cadastro de Usuarios (Existente: 1 US)

**Status:** DRAFT \| 13 cenarios Gherkin \| 15 regras criticas \| 12 RFs
\| 8 RNFs

  -------- ------------ ---------------- --------------------- ---------------------
  **\#**   **ID**       **Tema**         **Decisoes            **Acoes Necessarias**
                                         Pendentes**           

  1        US-MOD-002   Cadastro de      D11: CPF obrigatorio? Criar Screen Manifest
                        Usuarios pelo    \| D12: Politica      UX-USR-001 \|
                        Administrador    ativacao (senha vs    Resolver sobreposicao
                                         convite)? \| D13:     com F05 (ADR) \|
                                         Identificador unico   Criar epico pai
                                         (email/login)?        formal
  -------- ------------ ---------------- --------------------- ---------------------

1.5 MOD-003 - Estrutura Organizacional (NOVO - 5 Features)

**Origem:** Caderno 01 (EP01) + Caderno 05 (US-001, US-002) \| Cobertura
atual: ZERO

  -------- ------------- ----------------- ------------------ ------------------ -----------------
  **\#**   **ID          **Tema**          **Descricao**      **Entidades**      **Caderno Ref**
           Proposto**                                                            

  1        MOD-003-F01   CRUD Niveis N1 a  Cadastrar, editar, org_levels,        01 sec2
                         N5                ativar/inativar os org_units          
                                           5 niveis                              
                                           hierarquicos                          
                                           (Grupo, Unidade,                      
                                           Macroarea,                            
                                           Subunidade,                           
                                           Entidade Juridica)                    

  2        MOD-003-F02   Vinculos          Manter relacoes    org_unit_links     01 sec2
                         Organizacionais   entre niveis,                         
                                           vinculo subunidade                    
                                           x entidade                            
                                           juridica,                             
                                           multiplos                             
                                           estabelecimentos                      

  3        MOD-003-F03   Consulta e        Arvore             N/A (queries)      01 sec2
                         Navegacao         organizacional                        
                         Hierarquica       navegavel, filtro                     
                                           por nivel, busca                      
                                           por codigo                            

  4        MOD-003-F04   Governanca da     Historico de       org_unit_history   01 sec8
                         Estrutura         alteracoes,                           
                         (Versionamento)   vigencia de                           
                                           mudancas,                             
                                           auditoria da                          
                                           arvore                                

  5        MOD-003-F05   Vinculo Usuario x Delimitar escopo   user_org_scope     01 sec4
                         Estrutura         base de atuacao do                    
                         Organizacional    usuario pela                          
                                           posicao na arvore                     
  -------- ------------- ----------------- ------------------ ------------------ -----------------

1.6 MOD-004 - Workflow Engine (NOVO - 7 Features)

**Origem:** Caderno 02 (EP03, EP04) + Caderno 05 (US-005 a US-008) \|
Cobertura atual: ZERO

  -------- ------------- -------------- -------------------- ------------------ -----------------
  **\#**   **ID          **Tema**       **Descricao**        **Entidades**      **Caderno Ref**
           Proposto**                                                           

  1        MOD-004-F01   Cadastro de    CRUD de ciclos       cycles,            02 sec3
                         Ciclos e       (processo-mae) e     macro_stages       
                         Macroetapas    macroetapas com                         
                                        ordenacao                               

  2        MOD-004-F02   Cadastro de    CRUD de estagios     stages,            02 sec3-4
                         Estagios e     dentro de            stage_roles        
                         Papeis por     macroetapas +                           
                         Estagio        vinculo com papeis                      
                                        funcionais                              

  3        MOD-004-F03   Configuracao   Regras de transicao  transitions, gates 02 sec4
                         de Gates e     entre estagios,                         
                         Transicoes     condicoes,                              
                                        evidencias exigidas,                    
                                        gates formais                           

  4        MOD-004-F04   Instanciacao   Criar instancia      cycle_instances    02 sec5
                         de Ciclo       concreta de um                          
                         (Abertura de   ciclo, vincular a                       
                         Caso)          objeto de negocio                       

  5        MOD-004-F05   Movimentacao   Avancar/retroceder   stage_history,     02 sec5
                         de Estagio e   estagio, registrar   case_events        
                         Registro de    eventos sem mudanca                     
                         Eventos        de estagio                              

  6        MOD-004-F06   Gestao de      Atribuir,            case_assignments   02 sec5
                         Responsaveis   reatribuir, delegar                     
                         por Caso       responsabilidade por                    
                                        instancia/estagio                       

  7        MOD-004-F07   Governanca do  Solicitar gate,      gate_instances     02 sec5
                         Avanco         aprovar/reprovar,                       
                         (Instancia de  bloquear avanco,                        
                         Gate)          registrar parecer                       
  -------- ------------- -------------- -------------------- ------------------ -----------------

1.7 MOD-005 - Parametrizacao e Rotinas (NOVO - 8 Features)

**Origem:** Caderno 03 (EP05, EP06) + Caderno 05 (US-009 a US-012) \|
Cobertura atual: ZERO \| MAIOR GAP

  -------- ------------- ----------------- ------------------- ------------------------ -----------------
  **\#**   **ID          **Tema**          **Descricao**       **Entidades**            **Caderno Ref**
           Proposto**                                                                   

  1        MOD-005-F01   Cadastro de       CRUD de             context_framers,         03 sec3-5
                         Enquadradores     enquadradores com   framer_types             
                         Contextuais       tipo (Operacao,                              
                                           Classe Produto,                              
                                           Tipo Doc, Contexto                           
                                           Processo)                                    

  2        MOD-005-F02   Cadastro de       Catalogo de objetos target_objects,          03 sec5
                         Objetos-Alvo e    e campos sobre os   target_fields            
                         Campos-Alvo       quais rotinas podem                          
                                           incidir                                      

  3        MOD-005-F03   Regras de         Associar            incidence_rules          03 sec5
                         Incidencia        enquadrador a                                
                         (Enquadrador x    objeto com                                   
                         Objeto)           condicao,                                    
                                           prioridade e                                 
                                           vigencia                                     

  4        MOD-005-F04   Cadastro de       CRUD de rotina com  routines, routine_items  03 sec6
                         Rotinas e Itens   tipo, versao,                                
                                           vigencia + itens                             
                                           detalhados (campo,                           
                                           acao, condicao,                              
                                           default)                                     

  5        MOD-005-F05   Rotinas de Campo, Regras que alteram  routine_field_rules      03 sec4,7
                         Obrigatoriedade e visibilidade,                                
                         Default           obrigatoriedade e                            
                                           valores iniciais                             

  6        MOD-005-F06   Rotinas de        Restricao de        routine_domain_rules,    03 sec4,7
                         Dominio e         valores aceitos +   routine_validations      
                         Validacao         validacoes cruzadas                          
                                           com                                          
                                           alertas/bloqueios                            

  7        MOD-005-F07   Rotinas de        Exigencia de        routine_evidence_rules   03 sec4,7
                         Evidencia e Gate  anexos, aprovacoes                           
                                           formais, validacoes                          
                                           de completude                                

  8        MOD-005-F08   Motor de          Resolver conflitos  incidence_history,       03 sec5
                         Priorizacao e     quando multiplos    priority_engine          
                         Historico de      enquadradores                                
                         Incidencia        incidem + registrar                          
                                           versao aplicada                              
  -------- ------------- ----------------- ------------------- ------------------------ -----------------

1.8 MOD-006 - Integracoes e Aprovacoes (NOVO - 6 Features)

**Origem:** Caderno 04 (EP07, EP08) + Caderno 05 (US-013 a US-017) \|
Cobertura atual: ZERO

  -------- ------------- ----------------- ------------------------- -----------------
  **\#**   **ID          **Tema**          **Descricao**             **Caderno Ref**
           Proposto**                                                

  1        MOD-006-F01   Cadastro de       CRUD de rotinas de        04 sec2-3
                         Rotinas de        integracao com API,       
                         Integracao        endpoint, metodo, auth,   
                         Dinamica          timeout, versao           

  2        MOD-006-F02   Mapeamento        Campo origem x destino,   04 sec2
                         Integrador x      tipo, transformacao,      
                         Protheus          condicao, obrigatoriedade 

  3        MOD-006-F03   Execucao e Log de Disparar rotina,          04 sec3
                         Chamadas API      persistir                 
                                           payload/retorno/status,   
                                           protocolo,                
                                           reprocessamento           

  4        MOD-006-F04   Regras de         Definir quais operacoes   04 sec4-5
                         Controle de       exigem aprovacao antes de 
                         Gravacao          efetivar                  
                         (Movimentos                                 
                         Controlados)                                

  5        MOD-006-F05   Fluxo de          Gerar movimento, submeter 04 sec4-5
                         Aprovacao e       a aprovador, decidir,     
                         Alcada            executar apos liberacao   

  6        MOD-006-F06   Historico e       Registrar solicitacao,    04 sec5
                         Rastreabilidade   decisao, execucao, falha, 
                         de Movimentos     override, cancelamento    
  -------- ------------- ----------------- ------------------------- -----------------

1.9 MOD-007 - Automacao Governada / MCP (NOVO - 5 Features)

**Origem:** Caderno 04 (EP09) + Caderno 05 (US-018 a US-020) \|
Cobertura atual: ZERO

  -------- ------------- ---------------- ------------------------- -----------------
  **\#**   **ID          **Tema**         **Descricao**             **Caderno Ref**
           Proposto**                                               

  1        MOD-007-F01   Cadastro de      CRUD de agentes como      04 sec6
                         Agentes MCP      contas tecnicas           
                                          governadas com papel,     
                                          escopo e vigencia         

  2        MOD-007-F02   Catalogo de      CRUD de acoes             04 sec6
                         Acoes MCP        automatizadas com tipo    
                                          (consultar, preparar,     
                                          submeter, executar,       
                                          monitorar)                

  3        MOD-007-F03   Politicas de     Definir se acao executa   04 sec6
                         Execucao MCP     diretamente, gera         
                                          movimento controlado ou   
                                          apenas evento             

  4        MOD-007-F04   Execucao e       Registrar payload,        04 sec6
                         Eventos MCP      contexto, resultado,      
                                          vinculo externo,          
                                          sucesso/recusa/erro       

  5        MOD-007-F05   Separacao        Vincular agente a usuario 04 sec7
                         Usuario Humano x sem heranca automatica de 
                         Agente Associado autoridade decisoria      
  -------- ------------- ---------------- ------------------------- -----------------

1.10 Telas UX - Screen Manifests Necessarios

Cada tela abaixo precisa de Screen Manifest YAML + Feature Story com
Gherkin:

  -------- -------------- ----------------------------- ------------ ------------- ---------- ----------------------
  **\#**   **Manifest     **Tela**                      **Modulo**   **Depende     **Wave**   **Status**
           ID**                                                      de**                     

  1        UX-AUTH-001    Login + Recuperacao de Senha  MOD-001      F01, F04      Wave 1     Declarado - YAML nao
                                                                                              criado

  2        UX-SHELL-001   Application Shell             MOD-001      F01, F08      Wave 1     Declarado - YAML nao
                          (Sidebar/Header/Breadcrumb)                                         criado

  3        UX-DASH-001    Dashboard Pos-Login           MOD-001      F08           Wave 1     Declarado - YAML nao
                                                                                              criado

  4        UX-USR-001     Cadastro de Usuarios (Admin)  MOD-002      F05, F06, F12 Wave 1     NAO EXISTE

  5        UX-TNT-001     Gestao de Filiais             MOD-000      F07, F09      Wave 2     NAO EXISTE

  6        UX-PRM-001     Catalogo de Permissoes e      MOD-000      F06, F12      Wave 2     NAO EXISTE
                          Roles                                                               

  7        UX-ORG-001     Estrutura Organizacional      MOD-003      MOD-003-F01 a Wave 2     NAO EXISTE
                          N1-N5                                      F05                      

  8        UX-WFL-001     Configuracao de Workflow      MOD-004      MOD-004-F01 a Wave 3     NAO EXISTE
                          (Ciclos/Estagios)                          F03                      

  9        UX-WFL-002     Execucao e Acompanhamento de  MOD-004      MOD-004-F04 a Wave 3     NAO EXISTE
                          Casos                                      F07                      

  10       UX-PAR-001     Parametrizacao e Rotinas      MOD-005      MOD-005-F01 a Wave 3     NAO EXISTE
                                                                     F08                      

  11       UX-INT-001     Integracoes e Mapeamentos     MOD-006      MOD-006-F01 a Wave 4     NAO EXISTE
                                                                     F03                      

  12       UX-APR-001     Aprovacoes e Movimentos       MOD-006      MOD-006-F04 a Wave 4     NAO EXISTE
                          Controlados                                F06                      

  13       UX-MCP-001     Gestao de Agentes e Automacao MOD-007      MOD-007-F01 a Wave 5     NAO EXISTE
                                                                     F05                      
  -------- -------------- ----------------------------- ------------ ------------- ---------- ----------------------

1.11 Totalizacao do Inventario

  ------------------------ ---------------- ------------- ---------- --------------------
  **Modulo**               **Existentes**   **Novas       **Telas    **Total**
                                            Propostas**   UX**       

  MOD-000 Foundation       17 (F01-F17)     5 (F18-F22)   2 (TNT,    24
                                                          PRM)       

  MOD-001 Backoffice Admin 3 (F01-F03)      0             3 (AUTH,   6
                                                          SHELL,     
                                                          DASH)      

  MOD-002 Cadastro         1                0             1 (USR)    2
  Usuarios                                                           

  MOD-003 Estrutura        0                5 (F01-F05)   1 (ORG)    6
  Organizacional                                                     

  MOD-004 Workflow Engine  0                7 (F01-F07)   2 (WFL)    9

  MOD-005                  0                8 (F01-F08)   1 (PAR)    9
  Parametrizacao/Rotinas                                             

  MOD-006                  0                6 (F01-F06)   2 (INT,    8
  Integracoes/Aprovacoes                                  APR)       

  MOD-007 Automacao/MCP    0                5 (F01-F05)   1 (MCP)    6

  TOTAL                    21               36            13         70
  ------------------------ ---------------- ------------- ---------- --------------------

PARTE 2 - Pontos de Decisao e Correcoes

Cada item abaixo deve ser resolvido ANTES de iniciar a Wave
correspondente. Decisoes nao tomadas bloqueiam features especificas.

  -------- -------------------- --------------- ------------------------ -------------- -------------- ------------- ----------
  **ID**   **Decisao**          **Opcoes**      **Recomendacao**         **Impacto**    **Bloqueia**   **Dono**      **Wave**

  D01      Rate limit do MFA:   A\) IP \| B)    C\) temp_token (conforme Seguranca      F02            Arquitetura   0
           por IP, por usuario  Usuario \| C)   F02 ja sugere 5          brute-force                                 
           ou por temp_token?   temp_token \|   tentativas/token)        MFA                                         
                                D) Hibrido                                                                           

  D02      Contratos de         A\) Criar antes A\) Criar antes com      DoR da F03 nao F03            Arquitetura   0
           integracao           \| B)           timeout/retry/fallback   atendido                                    
           Google/Microsoft nao Implementar                                                                          
           existem (INT-000-01, junto                                                                                
           INT-000-02)                                                                                               

  D03      Contrato MailService A\) Criar agora A\) Criar interface +    Afeta F04,     F04, MOD-002   Arquitetura   0
           (INT-000-MAIL) nao   \| B) Usar      console adapter agora,   MOD-002                                     
           existe               console em dev  provider real depois                                                 

  D04      Sobreposicao F05     A\) Mesmo       B\) POST /api/v1/users   Conflito de    F05, MOD-002   Arq + PO      0
           (auto-registro       endpoint \| B)  (publico) + POST         regras de                                   
           publico) vs MOD-002  Endpoints       /api/v1/admin/users      seguranca                                   
           (cadastro admin)     separados \| C) (protegido)                                                          
                                Adiar MOD-002                                                                        

  D05      Hard delete vs soft  A\) Soft delete A\) Soft delete          Integridade    F06            Arquitetura   0
           delete de roles      (INACTIVE +     (consistente com todo o  referencial                                 
           (PENDENTE-F06-001)   deletedAt) \|   projeto)                 RBAC                                        
                                B) Hard delete                                                                       

  D06      Wildcards em         A\) Nenhum      A\) Sem wildcards por    Complexidade   F12            Arquitetura   0
           escopos -            wildcard \| B)  ora (manter simples,     do                                          
           finance:\*:\*        Wildcard        extensao futura)         requireScope                                
           (PENDENTE-F12-003)   modulo:\*:\*                                                                         
                                para admins                                                                          

  D07      Schema v1 do Screen  A\) Criar       A\) Schema minimo (7     Bloqueia F15,  F15, MOD-001   UX Lead       0
           Manifest nao existe  schema minimo   secoes conforme proposta todos os                                    
                                \| B) Schema    v3) e iterar             manifests,                                  
                                completo \| C)                           todo UX                                     
                                Sem schema                                                                           

  D08      DOC-PADRAO-005       A\) Formalizar  A\) Formalizar - F16 e   Upload de      F16            Arquitetura   0
           (Storage) nao        agora \| B)     prerequisito de avatar   arquivos em                                 
           formalizado          Adiar F16       (MOD-002) e evidencias   todo o sistema                              
                                                (MOD-005)                                                            

  D09      F17 (Apple ID) -     A\) Junto \| B) B\) Separada - nao e     Timeline da    F17            PO            0
           aprovacao separada   Separada (fase  bloqueante para Wave 1   Wave 1                                      
           ou junto ao epico?   2)                                                                                   

  D10      4 Screen Manifests   Acao unica:     Criar UX-AUTH-001,       Bloqueia toda  MOD-001,       UX Lead       0
           declarados mas nao   criar os 4      UX-SHELL-001,            a camada UX    MOD-002                      
           criados              YAMLs           UX-DASH-001, UX-USR-001                                              

  D11      MOD-002:             A\) Sim \| B)   C\) Configuravel (alinha LGPD,          MOD-002        PO + Juridico 0
           CPF/documento e      Opcional \| C)  com enquadradores do     formulario,                                 
           obrigatorio?         Configuravel    Caderno 03)              modelo de                                   
                                por tenant                               dados                                       

  D12      MOD-002: Politica de A\) Senha       C\) Ambos (fluxos ja     UX e backend   MOD-002        PO            0
           ativacao de usuario  temporaria \|   descritos na US)         do cadastro                                 
                                B) Convite                                                                           
                                email \| C)                                                                          
                                Ambos                                                                                

  D13      MOD-002:             A\) Email \| B) C\) Email como login (ja Modelo de      MOD-002        PO            0
           Identificador unico  Login separado  e UNIQUE em users)       dados                                       
           do usuario           \| C) Email                                                                          
                                como login                                                                           

  D14      Cadernos 01-05:      A\) Criar       A\) Criar os modulos     Escopo total   Todos          PO + Arq      0
           viram modulos        MOD-003 a       (sem eles, o projeto     do projeto                                  
           tecnicos ou ficam    MOD-007 \| B)   cobre apenas auth/RBAC)                                              
           como referencia?     Apenas                                                                               
                                referencia                                                                           
                                conceitual                                                                           
  -------- -------------------- --------------- ------------------------ -------------- -------------- ------------- ----------

2.2 Correcoes Estruturais Necessarias

  -------- ------------------- -------------------------- -------------------- --------------
  **\#**   **Correcao**        **Detalhamento**           **Impacto**          **Quando**

  C01      Aplicar taxonomia   DRAFT \> READY \>          Consistencia de      Wave 0
           unificada de status IN_REVIEW \> APPROVED \>   governanca           
           em todas as US      AMENDED \> REJECTED.                            
                               Atualmente cada modulo usa                      
                               convencao diferente.                            

  C02      Adicionar           MOD-002 nao declara nivel. Alinhamento com      Wave 0
           nivel_arquitetura   Recomendado: nivel 1       DOC-ESC-001          
           ao MOD-002          (CRUD + domain events +                         
                               LGPD).                                          

  C03      Criar epico pai     MOD-002 referencia         Governanca de        Wave 0
           formal para MOD-002 EPIC-MOD-002 que nao       aprovacao            
                               existe. Criar com DoR/DoD                       
                               e regra de cascata.                             

  C04      Adicionar metadados Campos: status_agil,       Rastreabilidade      Wave 0
           padronizados em     owner, nivel_arquitetura,                       
           todas as 20+ US     wave_entrega, epico_pai,                        
                               manifests_vinculados,                           
                               pendencias                                      

  C05      Resolver F11 como   F11 e nivel 0 e            Desbloqueio imediato Wave 0
           infra ECF (nao      explicitamente diz que nao                      
           sub-historia do     depende do epico. Deve ser                      
           MOD-000)            implementado                                    
                               imediatamente.                                  

  C06      Criar fichas de     Cada secao dos Cadernos    Ponte                Wave 0
           rastreabilidade     01-05 deve ter codigo, US  conceitual-tecnico   
           Cadernos \> US      de destino, status de                           
                               cobertura.                                      

  C07      Adicionar campos de enquadrador_id,            Suportar Cadernos    Wave 2
           observabilidade nos rotina_id+versao,          03-04                
           domain_events       movimento_controlado_id,                        
                               agente_mcp_id, estagio_id,                      
                               nivel_organizacional                            

  C08      Declarar            MOD-002 menciona avatar    Completude de DoR    Wave 0
           dependencia F16 no  mas nao lista F16                               
           MOD-002             (Storage) como                                  
                               dependencia.                                    
  -------- ------------------- -------------------------- -------------------- --------------

PARTE 3 - Plano de Acao para Criar Cada US

3.1 Metodologia de Criacao de US

Cada User Story deve ser criada seguindo o template do Caderno 05, com
as 6 perguntas obrigatorias: quem executa, sobre qual objeto, em qual
contexto, sob qual regra, qual efeito esperado e como a evidencia sera
preservada.

**Estrutura padrao de cada US:**

-   Metadados de Governanca (bloco padronizado com 10 campos)

```{=html}
<!-- -->
```
-   Contexto e Problema

```{=html}
<!-- -->
```
-   Solucao em Linguagem de Negocio

```{=html}
<!-- -->
```
-   Criterios de Aceite em Gherkin (minimo 3 cenarios)

```{=html}
<!-- -->
```
-   Regras Criticas / Restricoes Especiais

```{=html}
<!-- -->
```
-   Definition of Ready (DoR)

```{=html}
<!-- -->
```
-   Definition of Done (DoD)

```{=html}
<!-- -->
```
-   Manifests Vinculados (quando houver UI)

```{=html}
<!-- -->
```
-   Dependencias explicitas

3.2 Wave 0 - Desbloqueio (Semana 1-2)

**Objetivo:** Resolver TODAS as 14 decisoes, aprovar o epico MOD-000,
criar infra UX.

  ------------ -------------------------- ------------------------ ------------- ---------------------
  **Semana**   **Acao**                   **Entregavel**           **Dono**      **Prerequisito**

  S1-D1        Sessao de decisao:         6 ADRs documentadas      Arquitetura   Nenhum
               resolver D01 a D06 (6                                             
               decisoes tecnicas)                                                

  S1-D2        Sessao de decisao:         4 decisoes documentadas  PO            Nenhum
               resolver D09, D11, D12,                                           
               D13 (4 decisoes de                                                
               produto)                                                          

  S1-D3        Revisar US-MOD-000 com     US-MOD-000 status        Arq + PO      D01-D06 resolvidas
               gate de 10 criterios e     APPROVED                               
               aprovar                                                           

  S1-D4        Implementar F11 (GET       Endpoint /info           Dev           Nenhum
               /info) - desbloqueavel     funcional + testes                     
               imediato                                                          

  S1-D5        Formalizar DOC-PADRAO-005  2 normativos publicados  Arq + UX      Nenhum
               (Storage) e Schema v1 do                                          
               Manifest (D07, D08)                                               

  S2-D1        Criar 4 Screen Manifests   4 YAMLs validados contra UX Lead +     Schema v1 pronto
               YAML (AUTH, SHELL, DASH,   schema v1                Frontend      
               USR)                                                              

  S2-D2        Implementar                Script de validacao      Arquitetura   Schema v1 pronto
               validate-screen-manifest   funcional no CI                        
               (F15 parcial)                                                     

  S2-D3        Criar epico pai formal     EPIC-MOD-002.md com      PO            D11-D13 resolvidas
               para MOD-002 (C03)         DoR/DoD                                

  S2-D4        Aplicar metadados          US atualizadas no        Squad         Taxonomia definida
               padronizados em todas as   repositorio                            
               20+ US (C04)                                                      

  S2-D5        Criar contratos            3 contratos com          Arquitetura   Nenhum
               INT-000-01, INT-000-02,    timeout/retry/fallback                 
               INT-000-MAIL (D02, D03)                                           

  S2-D6        Criar fichas de            Planilha de cobertura    Analista      Nenhum
               rastreabilidade Cadernos   publicada                              
               \> US (C06)                                                       
  ------------ -------------------------- ------------------------ ------------- ---------------------

3.3 Wave 1 - Foundation + UX Base (Semana 3-10)

**Objetivo:** Scaffoldar as 17 features do MOD-000 + 3 do MOD-001 +
MOD-002. Entregar Login, Shell, Dashboard e Cadastro de Usuarios
funcionais.

Fase 1A: Features Backend Prontas (Semana 3-5)

Scaffoldar as 7 features sem pendencias + F11 ja implementado:

  ----------- ---------------- --------------------------------- -----------------
  **Ordem**   **Feature**      **Justificativa da Ordem**        **Estimativa**

  1           F01 - Auth       Base de tudo - sem login nada     5-8 pts
              Nativa           funciona                          

  2           F07 - Filiais    Necessario para F09 e tenant      5 pts
              Multi-Tenant     isolation                         

  3           F13 - Telemetria Pacote frontend necessario antes  3 pts
              UI               das telas                         

  4           F14 -            Prerequisito de rastreabilidade   3 pts
              CorrelationId    E2E                               
              Middleware                                         

  5           F08 - Perfil     Consumido pelo Dashboard          5 pts
              Autenticado      (MOD-001-F03)                     

  6           F09 - Vinculacao Necessario para RBAC completo     5 pts
              Usuario-Filial                                     

  7           F10 - Alteracao  Necessario para force_pwd_reset   5 pts
              de Senha                                           
  ----------- ---------------- --------------------------------- -----------------

Fase 1B: Features com Decisoes Resolvidas (Semana 5-7)

  ----------- ------------------ --------------------------------- -----------------
  **Ordem**   **Feature**        **Dependencia Resolvida na Wave   **Estimativa**
                                 0**                               

  8           F06 - RBAC/Roles   D05 (soft delete)                 8 pts

  9           F12 - Catalogo     D06 (sem wildcards)               8 pts
              Permissoes                                           

  10          F05 - CRUD         D04 (endpoints separados)         5 pts
              Usuarios                                             

  11          F04 - Recuperacao  D03 (contrato MAIL)               5 pts
              Senha                                                

  12          F02 - MFA/TOTP     D01 (rate limit por token)        5 pts

  13          F16 -              D08 (DOC-PADRAO-005)              8 pts
              Storage/Upload                                       

  14          F03 - SSO          D02 (contratos INT)               8 pts
              Google/Microsoft                                     
  ----------- ------------------ --------------------------------- -----------------

Fase 1C: UX-First + MOD-001 + MOD-002 (Semana 6-10)

  ----------- ------------------- ------------------------- --------------------
  **Ordem**   **Feature/Tela**    **Manifests**             **Estimativa**

  15          MOD-001-F01 - Shell UX-AUTH-001 +             8 pts
              Auth + Layout       UX-SHELL-001              

  16          MOD-001-F02 -       Todos os 3 manifests      5 pts
              Telemetria Shell                              

  17          MOD-001-F03 -       UX-DASH-001               5 pts
              Dashboard                                     

  18          MOD-002 - Cadastro  UX-USR-001                8 pts
              Usuarios (Admin)                              

  19          F17 - Apple ID (se  N/A                       5 pts
              aprovada D09=A)                               
  ----------- ------------------- ------------------------- --------------------

3.4 Wave 2 - Organizacao e Acesso Avancado (Semana 11-18)

**Objetivo:** Criar MOD-003, complementar MOD-000 com F18-F22, iniciar
MOD-004.

Criacao de US - MOD-003 (5 novas US a escrever)

  ------------- --------------------- --------------------- -------------------------
  **US**        **Template de         **Gherkin Minimo**    **Entidades de Dados**
                Redacao**                                   

  MOD-003-F01   Como admin            CRUD N1-N5 (criar,    org_levels(id, codigo,
                organizacional, quero editar,               name, type, parent_id,
                cadastrar niveis      ativar/inativar) +    status, tenant_id)
                N1-N5, para           validacao de          
                representar           unicidade de codigo + 
                pertencimento         soft delete           
                corporativo.                                

  MOD-003-F02   Como admin, quero     Criar vinculo +       org_unit_links(id,
                vincular subunidade a listar vinculos +     org_unit_id,
                entidade juridica,    desvincular + validar legal_entity_id,
                para separar          multiplos             valid_from, valid_to)
                organizacao de CNPJ.  estabelecimentos      

  MOD-003-F03   Como usuario, quero   Buscar por codigo +   Queries sobre
                navegar na arvore     expandir niveis +     org_levels +
                organizacional, para  filtrar por tipo +    org_unit_links
                entender onde cada    exportar arvore       
                unidade pertence.                           

  MOD-003-F04   Como auditor, quero   Listar alteracoes +   org_unit_history(id,
                ver historico de      filtrar por periodo + org_unit_id, changed_by,
                alteracoes na         detalhar versao       changed_at, old_values,
                estrutura, para       anterior              new_values)
                rastrear mudancas.                          

  MOD-003-F05   Como gestor, quero    Vincular + alterar    user_org_scope(user_id,
                vincular usuario a    vinculo + listar      org_unit_id, valid_from,
                posicao na estrutura, usuarios por          valid_to, status)
                para delimitar        unidade + validar     
                escopo.               unicidade             
  ------------- --------------------- --------------------- -------------------------

Criacao de US - MOD-000 F18-F22 (5 novas US a escrever)

  --------- --------------------- --------------------- -----------------------------------
  **US**    **Template de         **Gherkin Minimo**    **Entidades**
            Redacao**                                   

  F18       Como admin seguranca, Criar regra + validar role_incompatibilities(role_a_id,
            quero definir regras  na atribuicao +       role_b_id, reason)
            de incompatibilidade  alertar conflito +    
            entre papeis, para    bloquear              
            garantir segregacao                         
            de funcoes.                                 

  F19       Como gestor, quero    Criar                 access_shares(id, grantor_id,
            conceder acesso       compartilhamento +    grantee_id, scope, valid_until,
            temporario cruzado,   definir vigencia +    reason)
            para permitir         auto-expirar +        
            colaboracao com       auditar               
            governanca.                                 

  F20       Como admin, quero     CRUD + vincular a     technical_accounts(id, type,
            cadastrar contas      usuario + restringir  linked_user_id, scopes, status)
            tecnicas e agentes,   permissoes            
            para integracoes      decisorias + audit    
            governadas.                                 

  F21       Como gestor, quero    Solicitar + aprovar + access_requests(id, requester_id,
            que acessos passem    rejeitar + revisar    approver_id, scope, status,
            por solicitacao e     periodicamente +      decision_at)
            aprovacao formal,     revogar               
            para governanca.                            

  F22       Como sistema, quero   Atribuir owner +      record_ownership(entity_type,
            registrar ownership   verificar em          entity_id, owner_user_id,
            de registros, para    queries +             owner_org_unit_id)
            controlar             transferir + auditar  
            visibilidade.         mudanca               
  --------- --------------------- --------------------- -----------------------------------

Telas UX da Wave 2 (3 manifests a criar)

  -------------------- ------------------------------- -----------------------
  **Manifest**         **Componentes Principais**      **operationIds
                                                       Necessarios**

  UX-TNT-001 (Gestao   Lista de filiais + formulario   tenants_list,
  Filiais)             CRUD + badge de status          tenants_create,
                       (ACTIVE/BLOCKED) + soft delete  tenants_update,
                                                       tenants_block

  UX-PRM-001           Lista de roles + editor de      roles_list,
  (Permissoes/Roles)   escopos + drag-and-drop de      roles_create,
                       permissoes + catalogo filtravel roles_update,
                                                       permissions_list,
                                                       permissions_create

  UX-ORG-001           Arvore navegavel + formularios  org_tree, org_create,
  (Estrutura N1-N5)    por nivel + vinculos com        org_link_legal,
                       entidade juridica + historico   org_history
  -------------------- ------------------------------- -----------------------

3.5 Wave 3 - Parametrizacao e Rotinas (Semana 19-28)

**Objetivo:** Criar MOD-005 (maior gap funcional do projeto). 8 US
novas + 1 tela.

**Prerequisito:** Spike tecnico de 1 semana antes de iniciar para
validar modelo de dados.

  ------------- --------------------------------- ------------------ --------------------
  **US**        **Resumo da Criacao**             **Complexidade**   **Estimativa**

  MOD-005-F01   Enquadradores: CRUD com 4 tipos + Media              5 pts
                versao + vigencia. Gherkin:                          
                criar, editar, versionar,                            
                inativar.                                            

  MOD-005-F02   Objetos e Campos-Alvo: catalogo   Media              5 pts
                parametrizavel. Gherkin:                             
                registrar objeto, listar campos,                     
                vincular.                                            

  MOD-005-F03   Regras de Incidencia: associar    Media              8 pts
                enquadrador a objeto com condicao                    
                e prioridade. Gherkin: criar                         
                regra, testar priorizacao,                           
                validar vigencia.                                    

  MOD-005-F04   Rotinas e Itens: CRUD de pacotes  Alta               13 pts
                reutilizaveis. Gherkin: criar                        
                rotina, adicionar itens,                             
                versionar, publicar.                                 

  MOD-005-F05   Rotinas                           Media              8 pts
                Campo/Obrigatoriedade/Default:                       
                regras que alteram UI                                
                dinamicamente. Gherkin: aplicar                      
                visibilidade, testar                                 
                obrigatoriedade condicional.                         

  MOD-005-F06   Rotinas Dominio/Validacao:        Alta               13 pts
                restricao de valores + validacoes                    
                cruzadas. Gherkin: restringir                        
                lista, bloquear inconsistencia,                      
                alertar.                                             

  MOD-005-F07   Rotinas Evidencia/Gate: exigir    Alta               13 pts
                anexo ou aprovacao formal.                           
                Gherkin: bloquear sem anexo,                         
                solicitar gate, aprovar.                             

  MOD-005-F08   Motor de Priorizacao: resolver    Alta               13 pts
                conflitos + historico. Gherkin: 2                    
                enquadradores no mesmo objeto,                       
                aplicar prioridade, registrar                        
                versao.                                              
  ------------- --------------------------------- ------------------ --------------------

3.6 Wave 4 - Integracoes e Aprovacoes (Semana 29-38)

6 US novas do MOD-006 + 2 telas. Criacao segue mesmo template.

3.7 Wave 5 - Automacao Governada (Semana 39-46)

5 US novas do MOD-007 + 1 tela. Criacao segue mesmo template.

PARTE 4 - Resumo Executivo

  ------------------------- ---------------------------------------------
  **Metrica**               **Valor**

  Total de User Stories     70 (21 existentes + 36 novas + 13 telas UX)
  inventariadas             

  US prontas para           7 features + 1 desbloqueavel (F11)
  scaffolding imediato      
  (apos aprovacao epico)    

  Decisoes pendentes a      14 (todas resolviveis na Wave 0)
  resolver                  

  Correcoes estruturais     8
  necessarias               

  Modulos novos a criar     5 (MOD-003 a MOD-007)

  Screen Manifests a criar  13 (4 na Wave 0, 3 na Wave 2, 6 nas Waves
                            3-5)

  Normativos a formalizar   2 (DOC-PADRAO-005 + Schema v1 Manifest)

  Contratos de integracao a 4 (INT-000-01, INT-000-02, INT-000-03,
  criar                     INT-000-MAIL)

  Timeline estimada total   46 semanas (Wave 0: 2sem + Wave 1-5: 44sem)

  Primeira entrega          Semana 10 - Login, Shell, Dashboard, Cadastro
  funcional (Wave 1)        Usuarios
  ------------------------- ---------------------------------------------

**Proximo passo imediato:** Agendar sessao de decisao (2-3 horas) para
resolver D01 a D14 com Arquitetura + PO. Com as 14 decisoes tomadas, a
Wave 0 pode executar em 2 semanas e desbloquear todo o projeto.

*Documento gerado com base na leitura integral de 31 arquivos do
projeto.*