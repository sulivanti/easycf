---
description: Valida estaticamente se o código de um endpoint Fastify obedece aos contratos arquiteturais inegociáveis do projeto (RBAC, rastreabilidade e RFC 9457). Triggers: "validar rota", "verificar fastify", "revisar endpoint", ou automaticamente após geração de handlers backend.
---

# Skill: validate-fastify-endpoint

## Objetivo

Atuar como um arquiteto revisor automatizado. Esta skill realiza **análise estática** (revisão de texto e dependências) do código-fonte TypeScript de *handlers* e *rotas* Fastify. O objetivo é garantir que nenhum endpoint suba sem cumprir rigorosamente os três pilares da arquitetura de APIs do projeto: **Segurança Perimetral (RBAC)**, **Observabilidade (Correlation ID)** e **Padronização de Erros (RFC 9457)**.

> [!WARNING]
> Esta skill **NÃO EXECUTA** o código real, não sobe containers e não abre portas. Ela lê o arquivo original gerado e aponta violações contratuais antes de qualquer deploy ou merge. Se houver falhas, o Agente Gerador deve corrigir o código até passar nesta validação.

---

## 1. Gatilhos de Ativação

- "validar rota"
- "verificar handler fastify em [caminho]"
- "revisar endpoint de [recurso]"
- **Uso Obrigatório:** Automaticamente, logo após o `PKG-COD-001` (ou você mesmo) finalizar a codificação de um novo `route.ts`, `handler.ts` ou `controller.ts`.

---

## 2. Padrões Inegociáveis a Serem Verificados

Você deve ler atentamente o conteúdo do(s) arquivo(s) alvo em busca das estruturas abaixo. Qualquer ausência ou desvio intencional é considerado uma **Violação Crítica** no ecossistema e deve reprovar a validação do componente.

### 2.1 Segurança Perimetral (RBAC)

Todo endpoint autenticado deve validar permissões restritas em seu roteamento:

- **Regra:** A rota DEVE usar o *guard* ou middleware oficial `@RequireScope` (ou a função de middleware equivalente, como `requireScope('module:resource:action')`).
- **Proibido:** Fazer decodificação manual de JWT dentro corpo do handler (ex: `jwt.verify(token)`). O controle de acesso deve ocorrer sempre na borda da requisição (ex: array `preHandler`).
- **Exceção:** Rotas que são explicitamente projetadas como públicas (ex: webhook de terceiros, login, recuperação de senha) DEVEM conter um comentário claro `// ROTA PÚBLICA (Isenta de Guard)` no início da declaração da rota.

### 2.2 Observabilidade e Rastreabilidade Transversal

As integrações micro-serviçadas exigem rastreio para permitir auditoria ágil:

- **Regra:** Endpoints de mutação ou criticidade (`POST`, `PUT`, `PATCH`, `DELETE`) DEVEM extrair ativamente e propagar o `X-Correlation-ID` nativo através do header ou do objeto subjacente `request.id` (Fastify Request ID).
- **Regra:** Se a rota emite eventos de domínio ou faz fetch em APIs externas e bancos, a variável de rastreio (`correlationId`) DEVE ser repassada como argumento a essas camadas.
- **Opção Idempotência:** Operações com "efeitos colaterais graves" (ex: folha de pagamento, integrações de faturamento) DEVEM suportar `Idempotency-Key` verificada via cache/banco, rejeitando chamadas duplicadas precocemente.

### 2.3 Tratamento de Erros Ocultados (RFC 9457 — Problem Details)

A API nunca deve vazar exceções puras do banco de dados (Stack Traces) ou retornar JSONs genéricos ad-hoc.

- **Regra:** Os blocos `catch` tradicionais ou respostas de falha de negócio (ex: `reply.status(400)`) DEVEM usar a estrutura do RFC 9457 (*Problem Details for HTTP APIs*).
- **Formato Obrigatório do Retorno (JSON):**

  ```json
  {
    "type": "https://api.projeto.local/errors/{tipo-do-erro}",
    "title": "Breve descrição sucinta (Ex: Unprocessable Entity)",
    "status": 422,
    "detail": "Mensagem clara orientada ao utilizador da API contendo a falha validada",
    "instance": "/caminho/do/request/falho",
    "correlationId": "uuid-aqui"
  }
  ```

- **Proibido:** Retornar pacotes frágeis e incompletos como `{ "error": "Deu algo errado" }` ou apenas `{ "message": "Invalido" }`.

---

## 3. Dinâmica de Execução (Flow da Skill)

Como Agente Auditor, siga este cronograma mental ao utilizar a skill:

1. **Localização:** Impute o caminho (absoluto ou relativo) do arquivo de handler Fastify a ser avaliado.
2. **Leitura:** Use a ferramenta `view_file` interna para absorver o conteúdo textual até a última linha.
3. **Inspeção a Frio:**
   - Varra as definições de rota em busca de middlewares nos escopos `preHandler`.
   - Analise minuciosamente os blocos `try/catch` para certificar se a chave de interceptação está devidamente injetando o modelo *Problem Details*.
   - Rastreie o ciclo de vida do ID de requisição na função.
4. **Relatório de Saída:**
   - Se a inspeção for **impecável**, comente uma string curta: *"✅ Validação Fastify Concluída. Padrões de RBAC, Rastreabilidade e RFC 9457 integralmente verificados."*
   - Se ocorrerem **Violações**, intercepte o fluxo com marcações vermelhas/alertas, liste exatamente as linhas problemáticas e o que o Código está devendo em relação ao contrato. Force verbalmente que o Agente ou Humano aplique as correções mandatórias.

---

## 4. Exemplos Cognitivos de Avaliação

### ❌ Exemplo Reprovado (O que caçar)

```typescript
fastify.post('/products', async (request, reply) => {
  try {
    const item = await db.insert(products).values(request.body);
    return reply.status(201).send(item);
  } catch (err) {
    // ❌ Faltou Guard RBAC na rota
    // ❌ Rastreio ignorado, correlationId omitido 
    // ❌ JSON Genérico Fraco
    return reply.status(500).send({ error: "Falha geral" });
  }
});
```

### ✅ Exemplo Aprovado

```typescript
fastify.post('/products', {
  preHandler: [requireScope('products:write')] // ✅ Guard RBAC
}, async (request, reply) => {
  const correlationId = request.headers['x-correlation-id'] || request.id; // ✅ Rastreabilidade Coletada

  try {
    const item = await db.insert(products).values(request.body);
    // [..] Uso de eventos de domínio com propagação do correlationId
    return reply.status(201).send(item);
  } catch (err) {
    // ✅ Padronização RFC 9457 com repasse do Rastreio
    return reply.status(400).send({
      type: "https://api.projeto.local/errors/bad-request",
      title: "Bad Request",
      status: 400,
      detail: "Formato incorreto do payload",
      correlationId: correlationId
    });
  }
});
```
