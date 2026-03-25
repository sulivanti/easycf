# Matriz de Rastreabilidade: Cadernos x Inventario de User Stories

**Projeto Integrador A1 / EasyCodeFramework**

| Metadado | Valor |
|---|---|
| Data | Marco 2026 |
| Passe | Pass 2 - Rastreabilidade Cadernos vs Inventario |
| Documentos Fonte | Cadernos 00 a 05 (.docx) |
| Documento Alvo | Inventario_US_Plano_Acao_Integrador_A1.md |

---

## 1. Caderno 00 - Caderno Mestre de Organizacao

### 1.1 Verificacao das 9 Camadas Logicas

O Caderno 00 (secao 3) define 9 camadas logicas que devem ser refletidas na estrutura modular do inventario.

| # | Camada Logica (Caderno 00) | Modulo(s) no Inventario | Status |
|---|---|---|---|
| 1 | Estrutura organizacional define pertencimento, consolidacao e materializacao juridica | MOD-003 (F01-F05) | COBERTO |
| 2 | Modelo de permissoes e acessos define quem pode fazer o que, em qual escopo | MOD-000 (F06, F12, F18, F19, F21, F22) | COBERTO |
| 3 | Modelo de processo define ciclos, macroetapas, estagios, gates e responsaveis | MOD-004 (F01-F07) | COBERTO |
| 4 | Modulo de enquadramento contextual define qual contexto incide sobre o objeto-alvo | MOD-005 (F01-F03, F08) | COBERTO |
| 5 | Cadastro de rotinas transforma comportamento em pacotes reutilizaveis e governados | MOD-005 (F04-F07) | COBERTO |
| 6 | Camada de integracao dinamica define como rotinas acionam APIs e servicos externos | MOD-006 (F01-F03) | COBERTO |
| 7 | Controle de movimentos sob aprovacao determina quando acao pode ou nao ser efetivada | MOD-006 (F04-F06) | COBERTO |
| 8 | Suporte a MCP posiciona agentes como origem governada de solicitacao | MOD-007 (F01-F05) | COBERTO |
| 9 | Auditoria, logs, historico e vigencia amarram todas as camadas | Transversal: MOD-003-F04, MOD-004-F05, MOD-005-F08, MOD-006-F06, MOD-007-F04 | PARCIAL |

**Observacao sobre a Camada 9:** A auditoria/vigencia e tratada dentro de cada modulo individual, mas nao existe um modulo dedicado de observabilidade transversal (EP10 do Caderno 05 - "Observabilidade e governanca transversal" nao tem modulo correspondente no inventario). A correcao C07 do inventario reconhece parcialmente esta lacuna.

### 1.2 Verificacao das Regras-Mae (4 Regras Mestras + 3 Complementares)

O Caderno 00 (secao 4) define 7 regras-mae. O inventario referencia 4 como "regras mestras".

| # | Regra-Mae | Reflexo no Inventario | Status |
|---|---|---|---|
| 1 | Separacao entre estrutura, execucao e governanca | Modulos separados: MOD-003 (estrutura), MOD-004 (execucao), MOD-006 (governanca) | COBERTO |
| 2 | Separacao entre funcao e alcance de atuacao | MOD-000 F06 (RBAC) + F12 (Permissoes) + F18 (Segregacao) | COBERTO |
| 3 | Separacao entre contexto, objeto e regra aplicada | MOD-005 F01 (enquadradores) + F02 (objetos) + F03-F07 (regras) | COBERTO |
| 4 | Separacao entre solicitacao, aprovacao e execucao efetiva | MOD-006 F04-F06 (movimentos controlados) | COBERTO |
| 5 | Versionamento, vigencia, rastreabilidade e leitura historica como requisitos transversais | Distribuido entre modulos; sem feature transversal dedicada | PARCIAL |
| 6 | Escalabilidade do modelo sem redefinicao da logica central | Implicito na arquitetura modular proposta | COBERTO |
| 7 | Proibicao de bypass por API, integracao ou MCP em cenarios sujeitos a alcada | MOD-006-F04 + MOD-007-F03 (politicas de execucao) | COBERTO |

### 1.3 Verificacao do Glossario Nuclear

| Termo | Definicao no Caderno 00 | Feature Correspondente | Status |
|---|---|---|---|
| Tenant | Fronteira administrativa maior do ambiente | MOD-000 F07 (Filiais Multi-Tenant) | COBERTO |
| Escopo | Delimitacao organizacional e funcional | MOD-000 F06, F12 + MOD-003-F05 | COBERTO |
| Objeto-alvo | Cadastro, documento, transacao sobre o qual regra incide | MOD-005-F02 (Catalogo de Objetos-Alvo) | COBERTO |
| Enquadrador contextual | Contexto de negocio que aciona comportamento parametrizado | MOD-005-F01 (Enquadradores Contextuais) | COBERTO |
| Rotina | Pacote reutilizavel de comportamento | MOD-005-F04 (Cadastro de Rotinas) | COBERTO |
| Movimento controlado | Solicitacao registrada para posterior decisao | MOD-006-F04, F05, F06 | COBERTO |
| Agente MCP | Identidade tecnica de automacao governada | MOD-007-F01 (Cadastro Agentes MCP) | COBERTO |

**Resultado Caderno 00:** As 9 camadas e regras-mae estao refletidas na estrutura modular. A unica lacuna relevante e a ausencia de um modulo/feature dedicado a observabilidade transversal (EP10).

---

## 2. Caderno 01 - Fundacao Organizacional e de Acesso

### 2.1 Matriz de Rastreabilidade

| Secao do Caderno | Conceito/Entidade | Feature ID Proposta | Modulo Destino | Status |
|---|---|---|---|---|
| Sec 2 - Estrutura organizacional | Niveis N1 a N5 (Grupo, Unidade, Macroarea, Subunidade, Entidade Juridica) | MOD-003-F01 | MOD-003 | COBERTO |
| Sec 2 - Estrutura organizacional | Vinculos entre niveis e entidades juridicas | MOD-003-F02 | MOD-003 | COBERTO |
| Sec 2 - Estrutura organizacional | Consulta e navegacao hierarquica | MOD-003-F03 | MOD-003 | COBERTO |
| Sec 2 - Estrutura organizacional | Governanca e historico da arvore | MOD-003-F04 | MOD-003 | COBERTO |
| Sec 3 - Tenant e fronteira administrativa | Tenant corporativo unico com segregacao interna | F07 (Filiais Multi-Tenant) | MOD-000 | COBERTO |
| Sec 3 - Tenant | Segregacao interna por escopo, papeis, ownership | F06 + F12 + F22 | MOD-000 | COBERTO |
| Sec 4 - Regra-mae de autorizacao | Camada: Identidade | F01 (Auth), F05 (CRUD Usuarios) | MOD-000 | COBERTO |
| Sec 4 - Regra-mae de autorizacao | Camada: Papel e permissao | F06 (Roles/RBAC), F12 (Catalogo Permissoes) | MOD-000 | COBERTO |
| Sec 4 - Regra-mae de autorizacao | Camada: Escopo organizacional | MOD-003-F05 (Vinculo Usuario x Estrutura) | MOD-003 | COBERTO |
| Sec 4 - Regra-mae de autorizacao | Camada: Responsabilidade/Ownership | F22 (Ownership e Responsabilidade) | MOD-000 | COBERTO |
| Sec 4 - Regra-mae de autorizacao | Camada: Compartilhamento controlado | F19 (Compartilhamento com Vigencia) | MOD-000 | COBERTO |
| Sec 4 - Regra-mae de autorizacao | Camada: Governanca (concessao, revisao, revogacao, auditoria) | F21 (Governanca de Acesso) | MOD-000 | COBERTO |
| Sec 4 - Regra-mae de autorizacao | Camada: Vigencia (temporario, emergencial, expiravel) | F19 (vigencia no compartilhamento) + F21 (revisao periodica) | MOD-000 | PARCIAL |
| Sec 5 - Componentes do modelo de acesso | Usuario | F05 (CRUD Usuarios), F01 (Auth) | MOD-000 | COBERTO |
| Sec 5 - Componentes do modelo de acesso | Perfil (composicao de permissoes e papeis) | F06 (Roles/RBAC) | MOD-000 | PARCIAL |
| Sec 5 - Componentes do modelo de acesso | Papel | F06 (Roles/RBAC) | MOD-000 | COBERTO |
| Sec 5 - Componentes do modelo de acesso | Permissao | F12 (Catalogo de Permissoes) | MOD-000 | COBERTO |
| Sec 5 - Componentes do modelo de acesso | Escopo | MOD-003-F05 + F06 | MOD-000/MOD-003 | COBERTO |
| Sec 5 - Componentes do modelo de acesso | Ownership/responsabilidade | F22 | MOD-000 | COBERTO |
| Sec 5 - Componentes do modelo de acesso | Compartilhamento controlado | F19 | MOD-000 | COBERTO |
| Sec 5 - Componentes do modelo de acesso | Governanca de acesso | F21 | MOD-000 | COBERTO |
| Sec 6 - Principios obrigatorios | Separacao funcao vs alcance | F06 + F12 | MOD-000 | COBERTO |
| Sec 6 - Principios obrigatorios | Menor privilegio | Implicito em F06/F12 | MOD-000 | COBERTO |
| Sec 6 - Principios obrigatorios | Segregacao de funcoes | F18 (Segregacao de Funcoes) | MOD-000 | COBERTO |
| Sec 6 - Principios obrigatorios | Compartilhamento controlado | F19 | MOD-000 | COBERTO |
| Sec 6 - Principios obrigatorios | Neutralidade entre estrutura e autorizacao | MOD-003 separado de MOD-000 | MOD-003 | COBERTO |
| Sec 6 - Principios obrigatorios | Temporalidade controlada | F19 (vigencia) + F21 (revisao/revogacao) | MOD-000 | COBERTO |
| Sec 7 - Identidades e agentes | Usuario humano | F05, F01 | MOD-000 | COBERTO |
| Sec 7 - Identidades e agentes | Conta tecnica | F20 (Contas Tecnicas e Agentes) | MOD-000 | COBERTO |
| Sec 7 - Identidades e agentes | Agente associado | F20 + MOD-007-F05 | MOD-000/MOD-007 | COBERTO |
| Sec 7 - Identidades e agentes | Agente MCP | MOD-007-F01 | MOD-007 | COBERTO |
| Sec 7 - Identidades e agentes | Regra: diferenca entre preparar/submeter e aprovar/efetivar | MOD-007-F03 (Politicas de Execucao) | MOD-007 | COBERTO |
| Sec 8 - Entidades que precisam existir | Grupo: Estrutura organizacional (5 entidades) | MOD-003-F01, F02 | MOD-003 | COBERTO |
| Sec 8 - Entidades que precisam existir | Grupo: Identidade (5 entidades) | F01, F05, F20, MOD-007-F01 | MOD-000/MOD-007 | COBERTO |
| Sec 8 - Entidades que precisam existir | Grupo: Autorizacao (6 entidades: papel, permissao, perfil, escopo, matrizes) | F06, F12, MOD-003-F05 | MOD-000/MOD-003 | PARCIAL |
| Sec 8 - Entidades que precisam existir | Grupo: Compartilhamento e responsabilidade (4 entidades) | F19, F22 | MOD-000 | COBERTO |
| Sec 8 - Entidades que precisam existir | Grupo: Governanca (5 entidades: solicitacao, aprovacao, revisao, revogacao, trilha) | F21 | MOD-000 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Estrutura organizacional | MOD-003 | MOD-003 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Identidade e tenant | F01, F05, F07 | MOD-000 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Papeis e permissoes | F06, F12 | MOD-000 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Escopos e compartilhamento | F19, MOD-003-F05 | MOD-000/MOD-003 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Governanca de acesso | F21 | MOD-000 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Agentes e contas tecnicas | F20, MOD-007-F01 | MOD-000/MOD-007 | COBERTO |

**Total de conceitos Caderno 01:** 42 | **COBERTO:** 38 | **PARCIAL:** 4 | **DESCOBERTO:** 0

---

## 3. Caderno 02 - Arquitetura de Processo e Execucao

### 3.1 Matriz de Rastreabilidade

| Secao do Caderno | Conceito/Entidade | Feature ID Proposta | Modulo Destino | Status |
|---|---|---|---|---|
| Sec 2 - Camadas do modelo | Camada: Estrutura do processo (ciclo, macroetapa, estagio, gate, papel) | MOD-004-F01, F02, F03 | MOD-004 | COBERTO |
| Sec 2 - Camadas do modelo | Camada: Execucao do processo (instancia, responsavel, historico) | MOD-004-F04, F05, F06 | MOD-004 | COBERTO |
| Sec 2 - Camadas do modelo | Camada: Governanca (gate aplicado, evento, regra de transicao, auditoria) | MOD-004-F03, F05, F07 | MOD-004 | COBERTO |
| Sec 2 - Principio central | Estagio nao e responsavel (separacao ponto do fluxo vs quem atua) | MOD-004-F02 (papeis por estagio) + F06 (gestao responsaveis) | MOD-004 | COBERTO |
| Sec 3 - Cadastros estruturais | Ciclo | MOD-004-F01 | MOD-004 | COBERTO |
| Sec 3 - Cadastros estruturais | Macroetapa | MOD-004-F01 | MOD-004 | COBERTO |
| Sec 3 - Cadastros estruturais | Estagio | MOD-004-F02 | MOD-004 | COBERTO |
| Sec 3 - Cadastros estruturais | Gate | MOD-004-F03 | MOD-004 | COBERTO |
| Sec 3 - Cadastros estruturais | Papel (no fluxo) | MOD-004-F02 | MOD-004 | COBERTO |
| Sec 4 - Entidades de relacionamento | Ciclo x Macroetapa | MOD-004-F01 | MOD-004 | COBERTO |
| Sec 4 - Entidades de relacionamento | Macroetapa x Estagio | MOD-004-F02 | MOD-004 | COBERTO |
| Sec 4 - Entidades de relacionamento | Estagio x Papel | MOD-004-F02 | MOD-004 | COBERTO |
| Sec 4 - Entidades de relacionamento | Transicao de Estagio (condicao, evidencia, gate, vigencia) | MOD-004-F03 | MOD-004 | COBERTO |
| Sec 5 - Registros transacionais | Instancia do Ciclo | MOD-004-F04 | MOD-004 | COBERTO |
| Sec 5 - Registros transacionais | Historico de Estagio | MOD-004-F05 | MOD-004 | COBERTO |
| Sec 5 - Registros transacionais | Instancia de Gate | MOD-004-F07 | MOD-004 | COBERTO |
| Sec 5 - Registros transacionais | Atribuicao de Responsaveis | MOD-004-F06 | MOD-004 | COBERTO |
| Sec 5 - Registros transacionais | Historico de Eventos do Caso | MOD-004-F05 | MOD-004 | COBERTO |
| Sec 7 - Regras de negocio | Estagio pode permanecer o mesmo enquanto responsavel muda | MOD-004-F06 (reatribuicao) | MOD-004 | COBERTO |
| Sec 7 - Regras de negocio | Estagio pode exigir multiplas participacoes | MOD-004-F02 (papeis por estagio) | MOD-004 | COBERTO |
| Sec 7 - Regras de negocio | Nem todo fato relevante altera estagio (historico de eventos complementar) | MOD-004-F05 (registro de eventos sem mudanca de estagio) | MOD-004 | COBERTO |
| Sec 7 - Regras de negocio | Gates como validacoes formais do avanco | MOD-004-F07 (Instancia de Gate) | MOD-004 | COBERTO |
| Sec 7 - Regras de negocio | Vigencia de regra: mudancas no fluxo nao apagam leitura historica | MOD-004-F05 (historico) | MOD-004 | PARCIAL |
| Sec 10 - Insumos para backlog | Epico: Modelagem do fluxo | MOD-004-F01, F02, F03 | MOD-004 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Regras de navegacao | MOD-004-F03 | MOD-004 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Execucao do caso | MOD-004-F04, F05 | MOD-004 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Gestao de responsabilidade | MOD-004-F06 | MOD-004 | COBERTO |
| Sec 10 - Insumos para backlog | Epico: Governanca do avanco | MOD-004-F07 | MOD-004 | COBERTO |

**Total de conceitos Caderno 02:** 28 | **COBERTO:** 27 | **PARCIAL:** 1 | **DESCOBERTO:** 0

---

## 4. Caderno 03 - Parametrizacao Contextual e Cadastro de Rotinas

### 4.1 Matriz de Rastreabilidade

| Secao do Caderno | Conceito/Entidade | Feature ID Proposta | Modulo Destino | Status |
|---|---|---|---|---|
| Sec 2 - Papel do modulo contextual | Camada de mediacao entre natureza do objeto e comportamento por contexto | MOD-005 (conceito geral) | MOD-005 | COBERTO |
| Sec 2 - Papel do modulo contextual | Mesmo objeto com campos/defaults/dominios diferentes conforme enquadramento | MOD-005-F05, F06 | MOD-005 | COBERTO |
| Sec 3 - Tipos de enquadradores | Operacao (compra de servico, faturamento, intercompany, provisao) | MOD-005-F01 (4 tipos suportados) | MOD-005 | COBERTO |
| Sec 3 - Tipos de enquadradores | Classe de Produto (aco importado, servico engenharia, item revenda) | MOD-005-F01 | MOD-005 | COBERTO |
| Sec 3 - Tipos de enquadradores | Tipo de Documento (pedido, nota, contrato, requisicao) | MOD-005-F01 | MOD-005 | COBERTO |
| Sec 3 - Tipos de enquadradores | Contexto de Processo (abertura, revisao, aprovacao, reprocessamento) | MOD-005-F01 | MOD-005 | COBERTO |
| Sec 4 - Tipos de regra | Regra de Campo (visibilidade, ocultacao, leitura, edicao) | MOD-005-F05 | MOD-005 | COBERTO |
| Sec 4 - Tipos de regra | Regra de Obrigatoriedade (obrigatorio, opcional, condicionado) | MOD-005-F05 | MOD-005 | COBERTO |
| Sec 4 - Tipos de regra | Regra de Default (valor inicial, sugerido, fixo) | MOD-005-F05 | MOD-005 | COBERTO |
| Sec 4 - Tipos de regra | Regra de Dominio (valores permitidos) | MOD-005-F06 | MOD-005 | COBERTO |
| Sec 4 - Tipos de regra | Regra de Derivacao (heranca, calculo, obtencao automatica) | MOD-005-F06 | MOD-005 | PARCIAL |
| Sec 4 - Tipos de regra | Regra de Validacao (consistencia, alerta, bloqueio) | MOD-005-F06 | MOD-005 | COBERTO |
| Sec 4 - Tipos de regra | Regra de Evidencia ou Gate (anexo, aprovacao, validacao formal) | MOD-005-F07 | MOD-005 | COBERTO |
| Sec 5 - Estrutura logica | Enquadrador Contextual (cadastro) | MOD-005-F01 | MOD-005 | COBERTO |
| Sec 5 - Estrutura logica | Tipo de Enquadrador (cadastro) | MOD-005-F01 | MOD-005 | COBERTO |
| Sec 5 - Estrutura logica | Objeto-Alvo (cadastro) | MOD-005-F02 | MOD-005 | COBERTO |
| Sec 5 - Estrutura logica | Campo-Alvo (cadastro) | MOD-005-F02 | MOD-005 | COBERTO |
| Sec 5 - Estrutura logica | Regra de Incidencia (relacionamento) | MOD-005-F03 | MOD-005 | COBERTO |
| Sec 5 - Estrutura logica | Regras especializadas (campo, default, dominio, derivacao, validacao, evidencia) | MOD-005-F05, F06, F07 | MOD-005 | COBERTO |
| Sec 5 - Estrutura logica | Historico de Incidencia (transacional) | MOD-005-F08 | MOD-005 | COBERTO |
| Sec 6 - Cadastro de Rotinas | Cadastro de Rotina (unidade reutilizavel, tipo, versao, vigencia, governanca) | MOD-005-F04 | MOD-005 | COBERTO |
| Sec 6 - Cadastro de Rotinas | Rotina x Objeto-Alvo | MOD-005-F04 (vinculos) | MOD-005 | COBERTO |
| Sec 6 - Cadastro de Rotinas | Rotina x Enquadrador Contextual | MOD-005-F04 (vinculos) | MOD-005 | COBERTO |
| Sec 6 - Cadastro de Rotinas | Itens da Rotina (campo, acao, condicao, default, dominio, validacao, evidencia, ordem) | MOD-005-F04 (itens detalhados) | MOD-005 | COBERTO |
| Sec 6 - Cadastro de Rotinas | Rotina x Permissao / Papel | MOD-005-F04 | MOD-005 | PARCIAL |
| Sec 6 - Cadastro de Rotinas | Historico, Vigencia e Governanca da Rotina | MOD-005-F04 (versionar, publicar) | MOD-005 | COBERTO |
| Sec 7 - Tipos de rotina | Rotina de Campo | MOD-005-F05 | MOD-005 | COBERTO |
| Sec 7 - Tipos de rotina | Rotina de Obrigatoriedade | MOD-005-F05 | MOD-005 | COBERTO |
| Sec 7 - Tipos de rotina | Rotina de Default | MOD-005-F05 | MOD-005 | COBERTO |
| Sec 7 - Tipos de rotina | Rotina de Dominio | MOD-005-F06 | MOD-005 | COBERTO |
| Sec 7 - Tipos de rotina | Rotina de Validacao | MOD-005-F06 | MOD-005 | COBERTO |
| Sec 7 - Tipos de rotina | Rotina de Evidencia / Gate | MOD-005-F07 | MOD-005 | COBERTO |
| Sec 8 - Regras de governanca | Separacao entre contexto, objeto e rotina | Arquitetura MOD-005 (F01, F02, F04 separados) | MOD-005 | COBERTO |
| Sec 8 - Regras de governanca | Vigencia e versionamento obrigatorios | MOD-005-F04 (versionar, publicar) | MOD-005 | COBERTO |
| Sec 8 - Regras de governanca | Reutilizacao entre objetos e contextos compativeis | MOD-005-F04 (vinculos) | MOD-005 | COBERTO |
| Sec 8 - Regras de governanca | Transparencia e auditabilidade das regras | MOD-005-F08 (historico de incidencia) | MOD-005 | COBERTO |
| Sec 10 - Perguntas para US | Priorizacao quando mais de um contexto for aplicavel | MOD-005-F08 (Motor de Priorizacao) | MOD-005 | COBERTO |
| Sec 11 - Insumos para backlog | Epico: Enquadradores contextuais | MOD-005-F01 | MOD-005 | COBERTO |
| Sec 11 - Insumos para backlog | Epico: Regras de incidencia | MOD-005-F03 | MOD-005 | COBERTO |
| Sec 11 - Insumos para backlog | Epico: Regras de comportamento | MOD-005-F05, F06, F07 | MOD-005 | COBERTO |
| Sec 11 - Insumos para backlog | Epico: Cadastro de rotinas | MOD-005-F04 | MOD-005 | COBERTO |
| Sec 11 - Insumos para backlog | Epico: Auditoria contextual | MOD-005-F08 | MOD-005 | COBERTO |

**Total de conceitos Caderno 03:** 41 | **COBERTO:** 39 | **PARCIAL:** 2 | **DESCOBERTO:** 0

---

## 5. Caderno 04 - Integracoes, Aprovacoes e Automacao Governada

### 5.1 Matriz de Rastreabilidade

| Secao do Caderno | Conceito/Entidade | Feature ID Proposta | Modulo Destino | Status |
|---|---|---|---|---|
| Sec 2 - Integracao dinamica | Conceito: cadastro dinamico de integracao (nao codigo fixo por tela) | MOD-006-F01 | MOD-006 | COBERTO |
| Sec 2 - Rotina de integracao | Dados Gerais (identificacao, objeto, operacao, status, versao, vigencia) | MOD-006-F01 | MOD-006 | COBERTO |
| Sec 2 - Rotina de integracao | API/Endpoint (sistema destino, metodo, autenticacao, timeout) | MOD-006-F01 | MOD-006 | COBERTO |
| Sec 2 - Rotina de integracao | Mapeamento Integrador x Protheus (campo origem, destino, transformacao) | MOD-006-F02 | MOD-006 | COBERTO |
| Sec 2 - Rotina de integracao | Parametros e Defaults (filial, empresa, headers, valores fixos/derivados) | MOD-006-F01 | MOD-006 | COBERTO |
| Sec 2 - Rotina de integracao | Validacoes e Regras (bloqueios, consistencias, gatilhos, montagem payload) | MOD-006-F01, F02 | MOD-006 | COBERTO |
| Sec 2 - Rotina de integracao | Retorno e Log (status tecnico/funcional, protocolo, erro, historico) | MOD-006-F03 | MOD-006 | COBERTO |
| Sec 2 - Rotina de integracao | Governanca (aprovador, historico de alteracao, override, versao) | MOD-006-F06 | MOD-006 | COBERTO |
| Sec 3 - Estrutura logica integracao | Cadastros estruturais (Rotina de Integracao, API/Servico, Objeto-Alvo, Operacao) | MOD-006-F01 | MOD-006 | COBERTO |
| Sec 3 - Estrutura logica integracao | Relacionamentos (Rotina x Objeto, Rotina x API, Mapeamento, Parametros, Regras de Retorno) | MOD-006-F01, F02 | MOD-006 | COBERTO |
| Sec 3 - Estrutura logica integracao | Registros transacionais (Aplicacao da Rotina, Log de Chamada, Historico) | MOD-006-F03 | MOD-006 | COBERTO |
| Sec 3 - Estrutura logica integracao | Tipos de mapeamento: campo, parametro, header, regra, retorno | MOD-006-F02 | MOD-006 | COBERTO |
| Sec 4 - Controle de movimentos | Principio: separacao entre solicitacao e execucao | MOD-006-F04 | MOD-006 | COBERTO |
| Sec 4 - Controle de movimentos | Principio: origem nao e autorizacao (API, integracao, MCP nao contornam alcada) | MOD-006-F04 + MOD-007-F03 | MOD-006/MOD-007 | COBERTO |
| Sec 4 - Controle de movimentos | Principio: execucao governada (gravacao apenas apos aprovacao/liberacao) | MOD-006-F05 | MOD-006 | COBERTO |
| Sec 4 - Controle de movimentos | Principio: rastreabilidade integral | MOD-006-F06 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Cadastros: Regra de Controle de Gravacao | MOD-006-F04 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Cadastros: Tipo de Movimento Controlado | MOD-006-F04 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Cadastros: Regra de Alcada | MOD-006-F05 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Cadastros: Tipo de Origem do Movimento | MOD-006-F04 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Relacionamentos: Regra x Objeto-Alvo, Operacao, Contexto, Origem, Evidencia, Alcada | MOD-006-F04, F05 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Transacionais: Movimento Controlado | MOD-006-F05 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Transacionais: Instancia de Aprovacao | MOD-006-F05 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Transacionais: Execucao do Movimento | MOD-006-F05 | MOD-006 | COBERTO |
| Sec 5 - Estrutura movimentos | Transacionais: Historico do Movimento | MOD-006-F06 | MOD-006 | COBERTO |
| Sec 6 - MCP como orquestracao | Cadeia logica: Agente MCP > Acao > Operacao > Objeto > Contexto > Rotina > Regra > Execucao | MOD-007 (F01-F04) | MOD-007 | COBERTO |
| Sec 6 - MCP | Agente MCP (conta tecnica governada) | MOD-007-F01 | MOD-007 | COBERTO |
| Sec 6 - MCP | Cadastro de Acao MCP (catalogo de capacidades) | MOD-007-F02 | MOD-007 | COBERTO |
| Sec 6 - MCP | Tipo de Acao MCP (consultar, preparar, submeter, executar, monitorar) | MOD-007-F02 | MOD-007 | COBERTO |
| Sec 6 - MCP | Politica de Execucao MCP (diretamente, movimento controlado, apenas evento) | MOD-007-F03 | MOD-007 | COBERTO |
| Sec 6 - MCP | Execucao MCP (payload, contexto, resultado, vinculo externo) | MOD-007-F04 | MOD-007 | COBERTO |
| Sec 6 - MCP | Evento MCP (sucesso, recusa, bloqueio, encaminhamento, erro) | MOD-007-F04 | MOD-007 | COBERTO |
| Sec 7 - Separacao usuario x agente | Identidades autorizaveis separadas (mesmo que vinculadas) | MOD-007-F05 | MOD-007 | COBERTO |
| Sec 7 - Separacao usuario x agente | Agente nao herda permissao decisoria do usuario | MOD-007-F05 | MOD-007 | COBERTO |
| Sec 7 - Separacao usuario x agente | Automacao pode preparar/validar/submeter; decisao reservada ao humano | MOD-007-F03 + F05 | MOD-007 | COBERTO |
| Sec 9 - Insumos para backlog | Epico: Rotinas dinamicas de integracao | MOD-006-F01, F02 | MOD-006 | COBERTO |
| Sec 9 - Insumos para backlog | Epico: Logs e rastreabilidade de integracao | MOD-006-F03 | MOD-006 | COBERTO |
| Sec 9 - Insumos para backlog | Epico: Controle de movimentos | MOD-006-F04, F05 | MOD-006 | COBERTO |
| Sec 9 - Insumos para backlog | Epico: MCP e agentes | MOD-007-F01, F02, F03, F04 | MOD-007 | COBERTO |
| Sec 9 - Insumos para backlog | Epico: Automacao assistida | MOD-007-F05 | MOD-007 | COBERTO |

**Total de conceitos Caderno 04:** 40 | **COBERTO:** 40 | **PARCIAL:** 0 | **DESCOBERTO:** 0

---

## 6. Caderno 05 - Guia para Conversao em User Stories

### 6.1 Mapeamento das 20 US Candidatas (US-001 a US-020)

| US Candidata | Descricao (Caderno 05) | Feature(s) Proposta(s) no Inventario | Modulo | Status |
|---|---|---|---|---|
| US-001 | Cadastrar niveis N1 a N5 para representar pertencimento corporativo | MOD-003-F01 (CRUD Niveis N1 a N5) | MOD-003 | COBERTO |
| US-002 | Vincular usuarios a estrutura organizacional para delimitar escopo | MOD-003-F05 (Vinculo Usuario x Estrutura) | MOD-003 | COBERTO |
| US-003 | Criar papeis e permissoes para separar funcao de alcance | F06 (Roles/RBAC) + F12 (Catalogo Permissoes) + F18 (Segregacao) | MOD-000 | COBERTO |
| US-004 | Conceder compartilhamento temporario com governanca | F19 (Compartilhamento Controlado com Vigencia) | MOD-000 | COBERTO |
| US-005 | Cadastrar ciclos, macroetapas e estagios para estruturar fluxo | MOD-004-F01 (Ciclos/Macroetapas) + MOD-004-F02 (Estagios/Papeis) | MOD-004 | COBERTO |
| US-006 | Configurar gates e transicoes para controlar avanco formal | MOD-004-F03 (Gates e Transicoes) | MOD-004 | COBERTO |
| US-007 | Abrir instancia de ciclo para iniciar caso real rastreavel | MOD-004-F04 (Instanciacao de Ciclo) | MOD-004 | COBERTO |
| US-008 | Registrar historico de estagio e eventos para leitura historica | MOD-004-F05 (Movimentacao e Eventos) | MOD-004 | COBERTO |
| US-009 | Cadastrar enquadradores contextuais para parametrizar por contexto | MOD-005-F01 (Enquadradores Contextuais) | MOD-005 | COBERTO |
| US-010 | Associar regras de incidencia a objetos-alvo conforme contexto | MOD-005-F03 (Regras de Incidencia) | MOD-005 | COBERTO |
| US-011 | Criar rotinas reutilizaveis para aplicar pacotes padronizados | MOD-005-F04 (Cadastro de Rotinas e Itens) | MOD-005 | COBERTO |
| US-012 | Publicar versoes de rotina com vigencia e governanca | MOD-005-F04 (publicar/versionar) | MOD-005 | COBERTO |
| US-013 | Cadastrar APIs e mapeamentos dinamicos para evitar codigo fixo | MOD-006-F01 (Rotinas Integracao) + MOD-006-F02 (Mapeamento) | MOD-006 | COBERTO |
| US-014 | Registrar log tecnico e funcional de chamadas API | MOD-006-F03 (Execucao e Log de Chamadas API) | MOD-006 | COBERTO |
| US-015 | Bloquear gravacoes criticas e converter em movimentos controlados | MOD-006-F04 (Regras de Controle de Gravacao) | MOD-006 | COBERTO |
| US-016 | Decidir sobre movimento controlado para liberar ou rejeitar | MOD-006-F05 (Fluxo de Aprovacao e Alcada) | MOD-006 | COBERTO |
| US-017 | Executar movimento apenas apos liberacao (segregacao de funcoes) | MOD-006-F05 (execucao apos liberacao) | MOD-006 | COBERTO |
| US-018 | Cadastrar agentes MCP e suas acoes permitidas | MOD-007-F01 (Agentes) + MOD-007-F02 (Catalogo Acoes) | MOD-007 | COBERTO |
| US-019 | Definir se acao MCP executa, solicita aprovacao ou apenas gera evento | MOD-007-F03 (Politicas de Execucao) | MOD-007 | COBERTO |
| US-020 | Rastrear mudancas, overrides, falhas e reprocessamentos | MOD-006-F06 (Historico Movimentos) + MOD-007-F04 (Eventos MCP) | MOD-006/MOD-007 | PARCIAL |

**Total US candidatas:** 20 | **COBERTO:** 19 | **PARCIAL:** 1 | **DESCOBERTO:** 0

### 6.2 Verificacao dos 10 Epicos (EP01 a EP10)

| Epico (Caderno 05) | Escopo Resumido | Modulo(s) Correspondente(s) | Status |
|---|---|---|---|
| EP01 | Estrutura organizacional (N1-N5) | MOD-003 (F01-F05) | COBERTO |
| EP02 | Identidade, tenant e acesso | MOD-000 (F01-F12, F18-F22) | COBERTO |
| EP03 | Modelagem do processo | MOD-004 (F01-F03) | COBERTO |
| EP04 | Execucao do caso | MOD-004 (F04-F07) | COBERTO |
| EP05 | Parametrizacao contextual | MOD-005 (F01-F03, F08) | COBERTO |
| EP06 | Cadastro de rotinas | MOD-005 (F04-F07) | COBERTO |
| EP07 | Integracao dinamica | MOD-006 (F01-F03) | COBERTO |
| EP08 | Controle de movimentos | MOD-006 (F04-F06) | COBERTO |
| EP09 | MCP e automacao governada | MOD-007 (F01-F05) | COBERTO |
| EP10 | Observabilidade e governanca transversal | Sem modulo dedicado (distribuido) | PARCIAL |

---

## 7. Resumo Consolidado

### 7.1 Totais por Caderno

| Caderno | Total de Conceitos | COBERTO | PARCIAL | DESCOBERTO | % Cobertura |
|---|---|---|---|---|---|
| 00 - Caderno Mestre | 16 (9 camadas + 7 regras) | 14 | 2 | 0 | 87,5% |
| 01 - Fundacao Organizacional | 42 | 38 | 4 | 0 | 90,5% |
| 02 - Arquitetura de Processo | 28 | 27 | 1 | 0 | 96,4% |
| 03 - Parametrizacao e Rotinas | 41 | 39 | 2 | 0 | 95,1% |
| 04 - Integracoes e Automacao | 40 | 40 | 0 | 0 | 100,0% |
| 05 - Guia para US (20 candidatas) | 20 | 19 | 1 | 0 | 95,0% |
| 05 - Guia para US (10 epicos) | 10 | 9 | 1 | 0 | 90,0% |
| **TOTAL** | **197** | **186** | **11** | **0** | **94,4%** |

### 7.2 Conceitos DESCOBERTOS

**Nenhum conceito foi classificado como DESCOBERTO.** Todos os conceitos definidos nos Cadernos possuem ao menos cobertura parcial no Inventario.

### 7.3 Conceitos PARCIAL - Detalhamento do que Falta

| # | Conceito | Caderno | O que esta coberto | O que falta |
|---|---|---|---|---|
| 1 | Camada 9 - Auditoria, logs, historico e vigencia transversais | 00 (sec 3) | Cada modulo tem sua propria feature de historico/log | Falta modulo ou feature dedicado a observabilidade transversal (EP10). Nao cobre dashboards de auditoria, consultas cruzadas entre modulos e alertas de governanca. |
| 2 | Regra-mae 5 - Versionamento, vigencia, rastreabilidade como requisitos transversais | 00 (sec 4) | Versionamento e vigencia mencionados em cada feature individual | Falta feature ou padrao arquitetural que garanta uniformidade do versionamento/vigencia entre todos os modulos. |
| 3 | Camada de Vigencia na autorizacao (temporario, emergencial, expiravel) | 01 (sec 4) | F19 cobre compartilhamento com vigencia; F21 cobre revisao periodica | Falta tratar explicitamente acessos emergenciais com expiracao automatica e notificacao. |
| 4 | Perfil como composicao operacional de permissoes e papeis | 01 (sec 5) | F06 trata Roles/RBAC | Caderno 01 distingue "perfil" de "papel". Inventario trata apenas roles (F06) sem explicitar "perfil" como facilitador de atribuicao em massa. |
| 5 | Grupo de autorizacao: matrizes papel x permissao e papel x escopo | 01 (sec 8) | F06 e F12 cobrem papeis e permissoes separadamente | Falta feature explicitando matrizes cruzadas como entidades auditaveis e versionaveis. |
| 6 | Vigencia do escopo com heranca e delegacao | 01 (sec 5) | MOD-003-F05 vincula usuario a estrutura | Heranca e delegacao de escopo nao tem feature propria. |
| 7 | Vigencia de regra no fluxo: snapshot do desenho vigente | 02 (sec 7) | MOD-004-F05 registra historico de estagio | Falta explicitar como preservar a versao do desenho do fluxo vigente quando o caso foi processado. |
| 8 | Regra de Derivacao (heranca, calculo, obtencao automatica) | 03 (sec 4) | MOD-005-F06 cobre dominio e validacao | "Derivacao" nao explicitamente nomeada na F06. Confirmar se esta incluida ou precisa de feature propria. |
| 9 | Rotina x Permissao / Papel (controle de acesso granular sobre a rotina) | 03 (sec 6) | MOD-005-F04 cobre CRUD de rotinas com governanca | Falta detalhar controle de acesso granular sobre a propria rotina (quem pode publicar vs consultar). |
| 10 | US-020 - Rastrear mudancas, overrides, falhas (governanca ponta a ponta) | 05 (sec 6) | MOD-006-F06 + MOD-007-F04 | Falta feature de consolidacao/dashboard de auditoria transversal. Relacionado com EP10. |
| 11 | EP10 - Observabilidade e governanca transversal | 05 (sec 4) | Distribuido entre features de historico/log de cada modulo | Nao existe modulo para: dashboards de auditoria, alertas de governanca, consultas cruzadas, override logs consolidados. |

### 7.4 Recomendacoes Prioritarias

1. **Criar feature ou modulo para EP10 (Observabilidade Transversal):** Unico epico sem modulo correspondente. Sugerem-se 2-3 features: dashboard de auditoria consolidado, alertas de governanca, consultas cruzadas.

2. **Explicitar a entidade "Perfil" no MOD-000:** Confirmar se F06 ja contempla ou se precisa de sub-feature.

3. **Detalhar Regra de Derivacao no MOD-005:** Confirmar se MOD-005-F06 inclui derivacao ou precisa de feature separada.

4. **Tratar acesso emergencial com vigencia automatica:** Diferenciar de compartilhamento temporario (F19).

5. **Definir estrategia de snapshot de fluxo:** Para preservar leitura historica de casos ja processados (Caderno 02, sec 7).

---

*Documento gerado como Pass 2 da conferencia do Projeto Integrador A1 / ECF, com base na leitura integral dos Cadernos 00 a 05 e do Inventario Completo de User Stories.*
