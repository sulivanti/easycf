---
description: Desfaz a geração de um módulo (scaffold), excluindo a pasta de documentação do módulo e retornando a User Story original para o status "em revisao" ou "reprovada", desde que não haja código implementado. Triggers: "reprovar módulo", "retornar módulo para US", "desfazer scaffold", "rollback module".
---

> [!CAUTION]
> **Uso Exclusivo para Cenário de Erro Estratégico.**
> Esta skill deve ser ativada **somente** quando o `scaffold-module` gerou um módulo prematuramente ou incorretamente (ex: US aprovada por engano, escopo errado, mudança de arquitetura antes de qualquer código). **Não use para ajustes de conteúdo** — para isso, use `create-amendment`. Este fluxo é destrutivo: apaga pasta do módulo e reabre a US para revisão.

# Skill: rollback-module

## Objetivo

Permitir que a arquitetura recue um passo em caso de erro estratégico. Se o `scaffold-module` gerou um módulo prematuramente ou incorretamente a partir de uma User Story aprovada, esta skill reverte o processo destruindo a documentação canônica gerada e reabrindo a User Story para ajustes.

---

## 1. Gatilhos

- "reprovar módulo"
- "desfazer a geração do MOD-XXX"
- "retornar módulo para US"
- "rollback module"

## 2. Parâmetros Obrigatórios da Execução

- **ID do Módulo**: (ex: 101)
- **Motivo do Rollback**: (Breve texto do por que está sendo desfeito)

---

## 3. PASSO 1: Verificação de Segurança (GATE DE IMPLEMENTAÇÃO)

**REGRA DE BLOQUEIO:** Um módulo só pode sofrer rollback se **nenhum código técnico** (Fastify, Drizzle, rotas, testes) tiver sido gerado para ele ainda.
Antes de prosseguir, você (Agente) DEVE perguntar / confirmar com o usuário: *"Deseja confirmar o rollback? Certifique-se de que nenhum código (backend/frontend) atrelado a este módulo foi escrito, pois esta ação excluirá apenas a documentação."*

Se o usuário confirmar, siga para o Passo 2.

---

## 4. PASSO 2: A Reversão da User Story

1. Encontre a User Story correspondente na pasta `docs/04_modules/user-stories/` (ex: `US-MOD-{ID}-*.md`).
2. Altere o metadado **Status:** de `aprovada` para `em revisao` (ou `reprovada`, caso o usuário tenha exigido).
3. Adicione uma nota simples no final da US: `> Rollback executado em {Data}: {Motivo do Rollback}`.

---

## 5. PASSO 3: Destruição do Scaffold (Limpeza)

1. Localize a pasta gerada correspondente ao módulo: `docs/04_modules/mod-{ID}-*`.
2. Delete **toda a pasta** e seu conteúdo fisicamente usando comandos de terminal (`rm -rf ...` ou via Powershell `Remove-Item -Recurse -Force ...`).

---

## Passo Final: Comunicação

Confirme ao usuário que a pasta do módulo local foi evaporada e que a User Story retornou ao pipeline de ideação para poder ser editada com segurança novamente.
