# DOC-UX-011 — Padrões de Application Shell e Navegação

**Status:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-06
**Autor(es):** Produto + Arquitetura + UX
**Rastreia para:** DOC-DEV-001, DOC-ARC-003, US-MOD-000

---

## 1. Contexto e Objetivo

Este documento define as regras arquiteturais e de experiência de usuário (UX) obrigatórias para o **Application Shell** (a estrutura externa ou esqueleto da aplicação) gerado pelo EasyCodeFramework.

Ele estabelece que elementos de navegação como Dashboard Inicial, Menus Laterais, Breadcrumbs e Headers (antigamente planejados como User Stories US-016, 017, 018 e 021) são, na verdade, **componentes fundacionais do framework frontend**. Os geradores de código DEVEM produzir projetos (React, Vue, etc.) já com essas estruturas embutidas e integradas ao módulo de segurança (MOD-000).

---

## 2. O Application Shell (Layout Base)

Todo projeto/boilerplate gerado pelo framework DEVE adotar um Application Shell consistente que envelopa as rotas de negócio (`UX-XXX`).

### 2.1 Estrutura Obrigatória

O layout base DEVE ser composto minimamente por:

1. **Sidebar (Menu Lateral) ou Topbar (Navegação Principal):** Para ancoragem dos links de módulos.
2. **Header (Cabeçalho):** Contendo identificação do Tenant/Filial atual, Busca Global (ver `DOC-UX-012`), e Widget de Perfil do usuário.
3. **Breadcrumb Bar:** Faixa horizontal imediatamente acima do conteúdo da página, indicando o rastro de navegação.
4. **Main Content Area:** A área dinâmica onde as telas (ex: `/customers`, `/invoices/123`) serão renderizadas.

---

## 3. Navegação Dinâmica Baseada em Roles (Menus)

Os menus de navegação do sistema gerado **NÃO DEVEM** ser estáticos. A renderização dos links na Sidebar/Topbar deve ser condicionada às permissões do usuário logado.

### 3.1 Consumo do MOD-000

1. O Shell DEVE invocar o endpoint de perfil do usuário (`GET /auth/me`) logo após o boot da aplicação ou login bem-sucedido.
2. A resposta do `/auth/me` conterá o array de `scopes` (permissões) e as informações do Tenant/Branch atual.

### 3.2 Regra de Renderização

1. Cada item de menu registrado na aplicação DEVE declarar quais `scopes` (ex: `users:read`, `reports:view`) são necessários para visualizá-lo.
2. O componente de Sidebar DEVE interceptar a lista de menus disponíveis e **ocultar (não renderizar)** qualquer link para o qual o usuário não possua o escopo correspondente no Tenant ativo.
3. **Atenção:** Esconder o menu não substitui a proteção da rota no nível do Router (Frontend) e nem a proteção do Endpoint (Backend). É apenas uma decisão de UX.

---

## 4. Breadcrumbs Estruturais

O Breadcrumb é obrigatório em todas as telas de detalhe e listagem profunda geradas pelo framework, para evitar desorientação do usuário.

### 4.1 Regras de Construção

1. O rastro de navegação DEVE ser construído automaticamente mapeando a URL atual (`react-router` ou equivalente).
2. O último item do breadcrumb (página atual) DEVE estar em modo texto (não clicável).
3. Os itens anteriores DEVEM ser links clicáveis que retornam para os níveis superiores do módulo ativo.
4. Nomes de entidades no Breadcrumb (ex: `Nome do Cliente`) DEVEM ser injetados via estado ou contexto do Router, evitando "IDs crus" (`/customers/12ab34` -> mostrar `/ Clientes / João Silva`).

---

## 5. Dashboard Pós-Login (Landing Page)

Logo após o sucesso da autenticação (via login nativo, SSO ou MFA garantido pelo MOD-000), o usuário DEVE ser redirecionado de `/login` para a rota `/` ou `/dashboard`.

### 5.1 Regras do Dashboard Inicial

1. O scaffold básico do framework DEVE conter uma página inicial de espaço reservado (Placeholder Dashboard).
2. Este Dashboard não precisa, no momento de criação do chassi, exibir métricas complexas de negócio, mas DEVE exibir um resumo agregado genérico: mensagem de boas-vindas com o nome do usuário extraído do `/auth/me`, e atalhos rápidos baseados nos módulos onde ele tem acesso.
3. A rota do Dashboard DEVE ser protegida, forçando re-autenticação se o token estiver inválido.

---

## 6. Widget de Perfil (Header)

A identificação do usuário ativo DEVE estar sempre visível no Shell da aplicação (geralmente no canto superior direito do Header).

### 6.1 Regras do Widget

1. **Avatar/Iniciais:** Exibir foto (se disponível no contrato) ou as iniciais do nome do usuário de forma legível.
2. **Dropdown Menu:** Ao clicar/interagir com o Widget, DEVE ser exibido um menu suspenso contendo:
   - Identificação em texto do Tenant/Filial ativo.
   - Nome e E-mail do usuário.
   - Link de atalho para "Minha Conta" ou "Alterar Senha" (apontando obrigatoriamente para a feature `US-MOD-000-F10`).
   - Botão de "Sair" (Logout), que DEVE consumir a rota de logout (invalidando sessões ativas).

---

## 7. Critérios de Aceitação para o Gerador (Scaffold CLI)

Quando a automação do framework gerar um frontend vazio para um novo projeto, ela será avaliada pelos seguintes critérios de aceitação:

- **[CA-01]** O código de Layout/Shell gerado inclui de forma robusta um Header, Sidebar, Wrapper de Content e um Breadcrumb componentizado.
- **[CA-02]** O armazenamento do array de permissões (via store de estado global como Redux/Zustand ou React Context) está implementado e alimentado logo no load principal da aplicação.
- **[CA-03]** Componente de Menu lateral aceita um prop/array de rotas e filtra internamente baseado nas guards de escopo (`scopes`).
- **[CA-04]** A URL `/` em ambiente autenticado aciona um Dashboard amigável lendo os dados de perfil (US-MOD-000-F08).

---

*Este documento substitui formalmente a necessidade das User Stories antigas US-016 (Dashboard), US-017 (Menus), US-018 (Breadcrumb) e US-021 (Widget NavBar).*
