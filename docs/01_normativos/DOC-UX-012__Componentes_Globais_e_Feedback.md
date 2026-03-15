# DOC-UX-012 — Componentes Globais e Feedback

- **id:** DOC-UX-012
- **version:** 1.0.0
- **status:** READY
- **data_ultima_revisao:** 2026-03-06
- **owner:** produto + arquitetura + UX
- **scope:** global (componentes globais e feedback visual)

---

## 1. Contexto e Objetivo

Este documento define as regras arquiteturais obrigatórias para os **Componentes Globais e de Feedback visual** gerados pelo EasyCodeFramework para as interfaces (frontend).

Isso unifica e padroniza o tratamento global de erros (RFC 9457), o comportamento da Busca Global (Omnibox), e a retenção de preferências de layout (Dark Mode, Idioma). A partir daqui, as antigas propostas de histórias (US-019, US-020 e US-022) são rebaixadas à condição de **normas nativas do Frontend Scaffold**.

---

## 2. Tratamento Global de Erros e Feedback (Toasts)

Qualquer comunicação Assíncrona entre o Application Shell (Frontend) e o Backend DEVE ser interceptada de forma centralizada para que o usuário não se depare com erros genéricos ou "quebras silenciosas".

### 2.1 Especificação Obrigatória do Interceptor HTTP

1. O Frontend gerado (**Fetch nativo ou Axios — via interceptor HTTP**) DEVE escutar respostas de status HTTP tipo `4xx` e `5xx`.
2. Para cada resposta de erro, o framework DEVE verificar se a estrutura recebida no Payload segue o padrão normativo **Problem Details for HTTP APIs (RFC 9457)**, como definido no contrato Foundation (DOC-FND-000 §5).
3. Se o erro for um `RFC 9457` válido, ele conterá propriedades fundamentais:
   - `type`: URI de referência ou identificador do erro (ex: `https://example.com/probs/validation`).
   - `title`: Um título amigável (ex: `Falha na Validação`).
   - `detail`: A mensagem voltada ao ser humano (leiga).
   - `status`: O código numérico HTTP.
   - `correlationId` ou cópia do `X-Correlation-ID`.
4. O Notification System (Toast ou Modal) Global DEVE então exibir o campo `detail` em sua cor apropriada para a gravidade (`error` para 5xx, `warning` para alguns 4xx), com o `title` em negrito.
5. O Toast DEVE também renderizar de forma visível ou copiável o `correlationId` retornado. Exemplo: *"Erro na Validação: Campo e-mail incorreto (ID: req-abc1234)"*. Isso é imprescindível para suporte e tracking no Log (Datadog/Elastic).

---

## 3. Busca Global (Omnibox)

A "Busca Global" (antiga US-019) é o componente localizado na Navegação Principal (Header) e que permite indexar ou redirecionar a buscas universais ao longo das entidades e módulos disponíveis para o usuário.

### 3.1 Regras de Operação da Omnibox

1. O componente na interface é um "Input de Texto Livre".
2. **Debounce:** DEVE haver um atraso de no mínimo `300ms-500ms` entre a digitação e a requisição HTTP.
3. Se o framework ainda não implementar um endpoint dedicado à busca cross-module no nível de BFF (Backend For Frontend) / API Gateway, a Busca DEVE operar localmente filtrando apenas os Menus de navegação (Ex: Digita "Cliente", encontra link para `/customers`).
4. Caso a API de Busca Global (`/api/vX/search`) esteja ativa e disponível, o resultado na tela DEVE mostrar sub-seções amigáveis baseadas em categoria de resultado (ex: `Clientes Encontrados (3)`, `Faturas Encontradas (1)`).
5. O backend responsável pela Busca Global DEVE sempre cruzar a consulta de termos com as permissões restritivas do Foundation (DOC-FND-000 §2), não revelando títulos de entidades que o usuário não possa ver. (Ex: Só mostrar a Fatura #3 se o usuário tem `invoices:read`).

---

## 4. Configurações de UX / Preferências do Usuário (Local)

As opções visuais da janela do usuário individual compõem as Preferências Pessoais (antiga US-020). Essa guarda de estado local previne recarregamentos frustrantes de Layout padrão toda vez.

### 4.1 Retenção de Persistência Frontend

1. **Dark/Light Mode:** O Framework base DEVE incluir suporte a Theme Toggles atrelados a variáveis CSS e TailwindCSS. A preferência `theme` (`light`, `dark` ou `system`) DEVE ser gravada no `localStorage` do navegador.
2. **Layout Type:** Caso haja variação de Layout (Menu Lateral Expandido vs Colapsado), isso DEVE ser retido de modo equivalente.
3. **Internacionalização (i18n):** Se o projeto exigir suporte multilíngue além de pt-BR, o idioma escolhido (`language`) DEVE ser armazenado no `localStorage` sob a chave `lang` e aplicado como header `Accept-Language` global no Interceptor HTTP.

---

## 5. Carga Base (Skeleton Screens e Spinners)

O feedback visual em operações ativas precisa evitar que a tela aparente estar "congelada".

### 5.1 Feedback Visual Transitório (Loading State)

1. Para listas / Grids que estão esperando repaginação, DEVE-SE preferir "Skeleton Screens" mantendo a estrutura da tela no lugar de Overlays em tela cheia.
2. Para cliques de gravação de escopo individual (Botões de Confirmar: `create`, `update`, `delete`, `approve`), o próprio Botão que acionou a Ação DEVE mudar seu estado interno para um `Spinner` e ficar `disabled` (travar duplo clique não intencional) até que a Promise de rede responda com Sucesso ou RFC 9457 de Erro.
3. **Idempotência no Frontend:** O bloqueio visual de duplo clique é mandatório para auxiliar a Idempotência que será protegida também pelo campo `Idempotency-Key` no cabeçalho.

---

## 6. Critérios de Aceitação para o Gerador (Scaffold CLI)

Quando os geradores (Agente COD / CLI) criarem código de UI de base para projetos usando EasyCodeFramework, esses padrões serão validados da seguinte forma:

- **[CA-01]** Existe um interceptor configurado globalmente (`axios.interceptors.response` ou similar) disparando os "Toasts" para status HTTP inválidos.
- **[CA-02]** A função de renderização de Erros do Toast inclui e respeita os campos definidos pela normatização da `RFC 9457`.
- **[CA-03]** Tema selecionado persiste quando uma página individual (Page Refresh F5) é recarregada manualmente.
- **[CA-04]** Componentes de Botões gerados (`Button` exportado no Boilerplate de design system) aceitam prop unificada `isLoading=true` desativando a própria interação.

---

*Este documento consolida obrigatoriedades e substitui formalmente a necessidade das User Stories antigas US-019 (Busca Global), US-020 (Preferências Temporárias UX) e US-022 (Utilitários Compartilhados).*
