# {{project_name}} API

> Enterprise-Grade Application gerada a partir do **EasyCodeFramework (ECF)**.  
> Este projeto herda as políticas de Governança, Monitorabilidade, e Segurança Corporativa padrão da fundação base.

---

## 🚀 Inicialização Rápida (Getting Started)

A espinha dorsal técnica deste projeto é garantida via dependências cruzadas (Framework Pattern). Seu código de negócio viverá puro e limpo nesta arquitetura.

### 1. Pré-Requisitos

* **Node.js**: `v20.0.0+`
* **Gerenciador de Pacotes**: `pnpm` (ou `npm`/`yarn`)
* **Banco de Dados**: PostgreSQL

### 2. Instalação & Execução Subida

```bash
# 1. Instale todas as dependências do monolíto/framework
npm install

# 2. Inicie o servidor em modo watch (hot-reload)
npm run dev
```

> O servidor iniciará na porta `3000` (sendo possível alterá-la setando a flag `PORT=.env`). Verifique `http://localhost:3000/api/v1/status` para ter atestado do heartbeat do microserviço.

---

## 🤖 Trabalhando com a Inteligência Artificial (Antigravity Skills)

Este repositório contém as diretivas de comportamento e governança para a sua IA (o agente **Antigravity** que roda no Cursor / IDE local) dentro da pasta secreta cruzada `.agents/skills`.

Para manter seu projeto veloz, **nunca crie código à mão do zero**.
Peça ajuda a ela no Chat do Editor:

* *"Por favor, faça Scaffold de um novo módulo de Faturamento (`invoices`)"*  
    *O Agente utilizará a skill autônoma para desenhar as controllers de cobrança que sigam nossa DOC normativa de Isolamento do Tenant!*

* *"Valide as tabelas de banco de dados do arquivo X"*  
    *O Agente utilizará uma Skill nativa de validação para esquadrinhar suas chaves de `tenant_id` e conferir que não há vazamentos de Zod schemas!*

---

## 🏛️ Arquitetura e Extensibilidade

Seu aplicativo inicializa importando a *Factory Padrão* do núcleo da arquitetura ECF (`@easycf/core-api`).

O que já está configurado por debaixo dos panos?

1. **[RFC 9457] Unificação de Problem Details:** Um handler embutido garante que nenhum Stacktrace sensível vaze pra UI, mas logs severos se tornem acessíveis via Datadog.
2. **Correlation ID & Tracing:** Todos os logs injetam e retornam o tracking `x-correlation-id` entre microserviços.
3. **Tenant Parsing:** Middlewares automáticos inferem qual organização do usuário está acessando os recursos, via context nativo.

Você poderá injetar e programar o seu aplicativo na pasta raiz `src/`, livre de side-effects.

---

## 📚 Documentação Viva (Normativos)

Normais corporativas e o plano base de arquitetura do `{{project_name}}` residem de forma versionada e rica em `.docs/1_normativos` (Aguarde o preenchimento pela IA local via `readme-blueprint-generator`).
