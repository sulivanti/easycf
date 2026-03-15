# US-MOD-002 — Cadastro de Usuários (Épico)

**Status Ágil:** `DRAFT`
**Versão:** 0.2.1
**Data:** 2026-03-15
**Autor(es):** Product Owner / Squad + Arquitetura
**Módulo Destino:** **MOD-002** (Cadastro Administrativo de Usuários)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001, SEC-000-01, LGPD-BASE-001, DOC-PADRAO-005, ADR-000-01

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** Product Owner
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-002, DOC-DEV-001, DOC-ARC-001, SEC-000-01, LGPD-BASE-001, ADR-000-01, INT-000-MAIL
- **nivel_arquitetura:** 1
- **wave_entrega:** Wave 1
- **epico_pai:** *(este arquivo é o épico)*
- **manifests_vinculados:** UX-USER-001 (cadastro admin), UX-USER-002 (detalhe/edição)
- **pendencias:** D11 (CPF configurável por tenant), D14 (escopo MOD-003+), D15 (SEC-000 — política de segurança não documentada), D16 (LGPD-BASE-001 — normativo LGPD não documentado), D17 (ADR-000-01 — ADR de separação de endpoints não documentada), D18 (INT-000-MAIL — contrato de integração e-mail não documentado)
- **referencias_exemplos:** N/A
- **evidencias:** N/A

---

## 1. Contexto e Problema

Atualmente, o sistema não possui um fluxo estruturado e padronizado para cadastro de novos usuários, o que dificulta o onboarding, reduz a rastreabilidade das informações cadastrais e aumenta o risco de inconsistências de dados, falhas de segurança e problemas de conformidade.

A ausência desse recurso impacta diretamente a operação do negócio, pois impede que administradores ou usuários autorizados realizem o registro formal de novos acessos à plataforma. Além disso, sem regras claras de validação e armazenamento, o processo pode gerar:

* duplicidade de contas;
* inconsistência de dados obrigatórios;
* exposição de vulnerabilidades relacionadas a autenticação;
* falta de aderência a políticas de privacidade e proteção de dados;
* dificuldade de auditoria sobre quem criou, alterou ou ativou um usuário.

É necessário disponibilizar um cadastro de usuários seguro, validado e aderente às regras de negócio, permitindo registrar novos usuários no sistema com os dados mínimos necessários para acesso e operação.

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador do sistema**
Quero **cadastrar novos usuários na plataforma informando seus dados obrigatórios**
Para **permitir que essas pessoas tenham acesso controlado ao sistema conforme seu perfil de uso**.

O cadastro deverá permitir o preenchimento de informações essenciais do usuário, como:

* nome completo;
* e-mail;
* documento de identificação (quando aplicável);
* telefone (opcional ou obrigatório conforme regra de negócio);
* perfil de acesso;
* status do usuário;
* senha inicial ou envio de convite para definição de senha.

Ao concluir o cadastro com sucesso, o sistema deverá:

* validar os campos obrigatórios;
* impedir cadastro duplicado com mesmo e-mail/login;
* registrar o novo usuário com status apropriado;
* aplicar regras de segurança para senha ou ativação;
* gerar rastreabilidade da ação;
* exibir confirmação ao usuário responsável pelo cadastro.

O fluxo poderá variar conforme a estratégia da aplicação:

1. **Cadastro com senha definida no ato**
   O administrador informa os dados e define uma senha temporária para o usuário.

2. **Cadastro com convite por e-mail**
   O administrador cadastra os dados básicos e o sistema envia um link para ativação/criação de senha.

O comportamento final dependerá da política adotada pelo produto, mas em ambos os casos deve haver segurança, validação e auditabilidade.

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Cadastro de Usuários

Cenário: Cadastrar usuário com dados válidos
  Dado que o administrador está autenticado no sistema
  E possui permissão para cadastrar usuários
  Quando informar nome completo, e-mail válido, perfil de acesso e os demais campos obrigatórios
  E confirmar o cadastro
  Então o sistema deve registrar o novo usuário com sucesso
  E exibir uma mensagem de confirmação
  E armazenar os dados conforme as regras de segurança e privacidade

Cenário: Impedir cadastro com e-mail já existente
  Dado que já existe um usuário cadastrado com o e-mail informado
  Quando o administrador tentar cadastrar um novo usuário com o mesmo e-mail
  Então o sistema deve impedir o cadastro
  E exibir mensagem informando que o e-mail já está em uso

Cenário: Validar preenchimento de campos obrigatórios
  Dado que o administrador está na tela de cadastro de usuário
  Quando tentar salvar o cadastro sem preencher um ou mais campos obrigatórios
  Então o sistema deve impedir a conclusão
  E destacar os campos obrigatórios não preenchidos
  E exibir mensagem orientando o preenchimento correto

Cenário: Validar formato do e-mail
  Dado que o administrador está preenchendo o cadastro de usuário
  Quando informar um e-mail em formato inválido
  E tentar concluir o cadastro
  Então o sistema deve impedir o salvamento
  E exibir mensagem informando que o e-mail é inválido

Cenário: Cadastrar usuário com perfil de acesso
  Dado que o administrador possui permissão para atribuir perfis
  Quando selecionar um perfil de acesso válido no cadastro
  Então o sistema deve associar esse perfil ao novo usuário
  E respeitar as permissões previstas para esse perfil

Cenário: Criar usuário com status inicial pendente de ativação
  Dado que a política do sistema exige ativação posterior
  Quando o cadastro for concluído com sucesso
  Então o usuário deve ser criado com status "Pendente" ou equivalente
  E o sistema deve disponibilizar o fluxo de ativação definido

Cenário: Enviar convite de ativação por e-mail
  Dado que o sistema utiliza ativação por convite
  E o cadastro foi concluído com sucesso
  Quando o usuário for criado
  Então o sistema deve enviar um e-mail de ativação para o endereço informado
  E registrar a data e o status do envio

Cenário: Definir senha temporária no cadastro
  Dado que a política do sistema permite senha inicial definida pelo administrador
  Quando o administrador informar uma senha que atende à política de segurança
  E concluir o cadastro
  Então o sistema deve armazenar a senha de forma segura
  E exigir troca de senha no primeiro acesso, se aplicável

Cenário: Validar política de senha
  Dado que o administrador está definindo uma senha inicial
  Quando informar uma senha fora do padrão exigido
  Então o sistema deve rejeitar a senha
  E exibir as regras mínimas de segurança aplicáveis

Cenário: Registrar auditoria do cadastro
  Dado que um novo usuário foi cadastrado com sucesso
  Quando a operação for concluída
  Então o sistema deve registrar em log o identificador do usuário criado
  E registrar quem realizou o cadastro
  E registrar data, hora e contexto da operação

Cenário: Restringir acesso de usuário sem permissão
  Dado que um usuário autenticado não possui permissão para cadastrar usuários
  Quando tentar acessar ou executar o cadastro
  Então o sistema deve negar a ação
  E exibir mensagem de acesso não autorizado

Cenário: Permitir cadastro com campos opcionais em branco
  Dado que existem campos opcionais no formulário
  Quando o administrador preencher apenas os campos obrigatórios
  E concluir o cadastro
  Então o sistema deve permitir o registro
  E salvar os campos opcionais vazios sem erro

Cenário: Cancelar cadastro antes da conclusão
  Dado que o administrador iniciou o preenchimento do formulário
  Quando optar por cancelar a operação
  Então o sistema não deve salvar nenhum dado do novo usuário
  E deve retornar à listagem ou tela anterior conforme fluxo definido
```

---

## 4. Regras Críticas / Restrições Especiais

* Regra 1: O e-mail do usuário deve ser único no sistema.
* Regra 2: Apenas usuários com permissão explícita podem cadastrar novos usuários.
* Regra 3: Todos os campos obrigatórios devem ser validados antes da persistência. Falhas de entrada (422) devem usar o formato Problem Details (RFC 9457) detalhando `extensions.invalid_fields[]` (DOC-ARC-001).
* Regra 4: A senha, quando aplicável, deve seguir a política de segurança corporativa.
* Regra 5: Senhas nunca devem ser armazenadas em texto puro. Devem usar `bcrypt` com número adequado de rounds (ex: ≥ 12) (SEC-000).
* Regra 6: O sistema deve manter trilha de auditoria da criação do usuário na tabela `domain_events` atrelando `X-Correlation-ID` da request (DOC-DEV-001).
* Regra 7: O perfil de acesso atribuído deve existir e estar ativo, seguindo o RBAC hierárquico por escopos (SEC-000).
* Regra 8: O cadastro deve respeitar regras de privacidade (LGPD-BASE-001). Dados sensíveis (como e-mail e documento) devem trafegar e ser expostos minimamente na trilha de auditoria (`sensitivity_level=2`).
* Regra 9: Não deve ser permitido cadastro de usuário inativo em perfis incompatíveis com o fluxo de autenticação.
* Regra 10: O sistema deve tratar falhas de integração de envio de e-mail sem corromper o cadastro, usando *Outbox Pattern* e DLQ quando aplicável.
* Regra 11: Em caso de envio de convite, o token de ativação deve possuir expiração.
* Regra 12: O nome completo deve respeitar tamanho mínimo e máximo configurado.
* Regra 13: O formulário deve prevenir caracteres inválidos ou dados maliciosos. WAF e Rate Limiting (ex: login e rotas abertas) devem estar ativos (SEC-000).
* Regra 14: A criação do usuário deve ocorrer de forma transacional. A requisição de cadastro deve suportar chave de idempotência (`Idempotency-Key`) (DOC-DEV-001).
* Regra 15: O status inicial do usuário deve seguir a política definida pelo produto (Ativo, Pendente, Inativo, Bloqueado etc.).

---

## 5. Requisitos Funcionais

* RF01: O sistema deve permitir o cadastro manual de um novo usuário.
* RF02: O sistema deve disponibilizar formulário com campos obrigatórios e opcionais.
* RF03: O sistema deve validar unicidade de e-mail e/ou login.
* RF04: O sistema deve permitir selecionar perfil de acesso.
* RF05: O sistema deve permitir definir status inicial do usuário, conforme regra de negócio.
* RF06: O sistema deve validar formato dos dados informados.
* RF07: O sistema deve persistir os dados do usuário após validação bem-sucedida.
* RF08: O sistema deve exibir mensagens claras de sucesso e erro.
* RF09: O sistema deve registrar log de auditoria da operação.
* RF10: O sistema deve permitir envio de convite/ativação, se aplicável.
* RF11: O sistema deve aplicar política de senha, quando houver senha inicial.
* RF12: O sistema deve impedir acesso ao recurso sem autorização adequada.

---

## 6. Requisitos Não Funcionais

* RNF01: O cadastro deve seguir padrões de segurança da informação definidos pela organização (ex: proteção CSRF, Helmet.js Headers, e Rate Limiting via Redis).
* RNF02: Os dados pessoais devem ser tratados conforme LGPD e normativos internos, com PII ofuscada em logs comuns.
* RNF03: O tempo de resposta da operação de cadastro deve ser compatível com a experiência esperada da aplicação.
* RNF04: O sistema deve garantir rastreabilidade do evento de criação, propagando `X-Correlation-ID` entre as camadas de logs e auditoria.
* RNF05: O formulário deve ser responsivo, se a aplicação suportar dispositivos móveis.
* RNF06: As mensagens de erro devem ser compreensíveis e não expor detalhes técnicos sensíveis, retornando respostas consistentes baseadas na RFC 9457 para falhas.
* RNF07: O sistema deve proteger o endpoint contra entradas maliciosas e tentativas de abuso através de Rate Limiting e firewalls/WAF aplicáveis.
* RNF08: O recurso deve estar coberto por testes automatizados de backend e frontend, e o contrato documentado no OpenAPI versionado (DOC-ARC-001).

---

## 7. Campos Esperados no Formulário

### Obrigatórios

* Nome completo
* E-mail
* Perfil de acesso
* Status inicial
* Senha inicial ou forma de ativação (conforme política)

### Opcionais

* Telefone
* Documento
* Cargo
* Departamento
* Observações internas

---

## 8. Fluxo Principal

1. O administrador acessa a tela de cadastro de usuários.
2. O sistema exibe o formulário de cadastro.
3. O administrador preenche os campos obrigatórios e opcionais.
4. O administrador seleciona o perfil de acesso e status inicial.
5. O sistema valida os dados informados.
6. Não havendo inconsistências, o sistema grava o novo usuário.
7. O sistema registra log de auditoria.
8. O sistema exibe mensagem de sucesso.
9. Quando aplicável, o sistema envia convite ou fluxo de ativação ao usuário.

---

## 9. Fluxos Alternativos / Exceções

### FA01 — E-mail já cadastrado

O sistema deve bloquear a criação e informar duplicidade.

### FA02 — Campos obrigatórios ausentes

O sistema deve impedir o envio e sinalizar os campos pendentes.

### FA03 — Perfil inválido ou indisponível

O sistema deve impedir a associação e orientar nova seleção.

### FA04 — Falha no envio do convite

O cadastro poderá ser concluído com status apropriado, desde que a regra de negócio permita, e o sistema deve registrar a falha para reprocessamento ou ação manual.

### FA05 — Usuário sem permissão

O acesso ao recurso deve ser negado.

---

## 10. Dependências

* Módulo de autenticação/autorização (US-MOD-000-F01, F06)
* Módulo de perfis e permissões (US-MOD-000-F06, F12)
* Serviço de envio de e-mail — INT-000-MAIL (sendInviteEmail) para fluxo de convite
* Módulo de Storage e Upload Centralizado (US-MOD-000-F16 / DOC-PADRAO-005) — para upload de avatar
* Política de segurança de senha (SEC-000)
* Camada de auditoria/logs (domain_events com X-Correlation-ID)
* ADR-000-01 — Separação de endpoints: `POST /api/v1/admin/users` (este módulo) vs `POST /api/v1/users` (F05, auto-registro)
* Definição de campos obrigatórios pelo negócio

---

## 11. Impactos Esperados

* Padronização do onboarding de usuários
* Maior segurança no controle de acesso
* Redução de cadastros inconsistentes
* Melhor rastreabilidade operacional
* Melhoria na governança de acessos

---

## 12. Fora de Escopo

* Edição de usuários já cadastrados
* Recuperação de senha
* Gestão avançada de perfis e permissões
* Importação em massa de usuários
* Aprovação em múltiplos níveis para criação de conta
* SSO / login federado

---

## 13. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

* [ ] Owner definido.
* [ ] Cenários Gherkin revisados e aprovados.
* [ ] Contratos de Integração criados (se aplicável).
* [ ] Épico correspondente aprovado.
* [ ] Regras de negócio de ativação/senha definidas.
* [ ] Campos obrigatórios e opcionais validados com stakeholders.
* [ ] Perfis de acesso elegíveis mapeados.
* [ ] Política de LGPD e retenção de dados validada para o fluxo.
* [ ] Critérios de auditoria e logs definidos.
* [ ] Protótipo ou referência de UX disponível, se necessário.

---

## 14. Definition of Done (DoD) — Para Encerramento

* [ ] Cadastro implementado conforme critérios de aceite.
* [ ] Validações de campos obrigatórios implementadas retornando RFC 9457 em erro (DOC-ARC-001).
* [ ] Validação de unicidade de e-mail implementada garantindo segurança contra ataques de enumeração (`User Enumeration Prevention`).
* [ ] Controle de permissão implementado com base em RBAC (SEC-000).
* [ ] Auditoria de criação registrada com `X-Correlation-ID` e `visibility_level`/`sensitivity_level` (DOC-DEV-001).
* [ ] Testes unitários implementados e métricas cobertas.
* [ ] Testes de integração implementados para outbox/envio de convite.
* [ ] Testes funcionais/QA executados com contrato validado via Spectral e contrato OpenAPI (DOC-ARC-001).
* [ ] Mensagens de erro e sucesso homologadas garantindo não vazamento de PII.
* [ ] Documentação técnica e funcional (OpenAPI `.yaml`) atualizada.

---

## 15. Observações para Refinamento

* Definir se o identificador único será e-mail, login ou ambos.
* Definir se haverá ativação por e-mail ou senha temporária.
* Definir status inicial padrão.
* Confirmar quais campos são realmente obrigatórios.
* Confirmar necessidade de CPF/documento e regras de mascaramento.
* Avaliar necessidade de captcha, antifraude ou rate limit para APIs públicas.
* Confirmar integração com diretório externo ou IAM corporativo.

---

## 16. Regra de Aprovação em Cascata

> 📌 **Regra de aprovação em cascata:** Este épico US-MOD-002 deve ser aprovado **antes** de qualquer sub-história associada. Cada sub-história futura deve ser aprovada individualmente antes de ter seu código scaffoldado ou alterado por automação.

**Endpoint designado:** `POST /api/v1/admin/users` (protegido, JWT + `requireScope('users:admin:create')`) — conforme ADR-000-01.

---

## 17. CHANGELOG do Épico

| Versão | Data | Responsável | Descrição |
| --- | --- | --- | --- |
| 0.2.1 | 2026-03-15 | arquitetura | Correção de manifests vinculados (UX-USR → UX-USER-001/002). Registro de pendências D15–D18: SEC-000, LGPD-BASE-001, ADR-000-01, INT-000-MAIL como documentos inexistentes. |
| 0.2.0 | 2026-03-14 | arquitetura | Reestruturação como épico formal: cascata, metadados padronizados, dependência F16/Storage, referência ADR-000-01 e INT-000-MAIL. Correção de EPIC-MOD-002 → US-MOD-002. (C03, C08) |
| 0.1.0 | 2026-03-09 | Product Owner | Criação inicial da US de cadastro de usuários |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se este épico estiver marcado com Status `APPROVED`.
