---
description: Avalia a conformidade de uma especificação frente ao DoR (Definition of Ready) e promove o status do documento automaticamente de DRAFT para REFINING ou READY. Triggers: "transicionar status", "promover especificação", "validar DoR", "passar para ready".
---

# Skill: transition-spec-status

## Objetivo

Automatizar a verificação do **Definition of Ready (DoR)** estipulado no normativo (`DOC-DEV-001`) e avançar governadamente o `estado_item` de uma especificação executável (DRAFT -> REFINING -> READY). Isso previne a promoção prematura de histórias que ainda não possuem *Owner* ou critérios *Gherkin*.

---

## 1. Gatilhos

O agente deve invocar mentalmente esta skill quando o usuário solicitar:

- "transicionar status de uma spec"
- "promover a US para READY"
- "mudar status para REFINING"
- "validar DoR da especificação"
- "aprovar documento da feature"

## 2. Parâmetros Obrigatórios da Execução

Se o usuário não a fornecer no prompt de origem, o agente **deve solicitar**:

- **Caminho do Arquivo**: Qual especificação (Markdown) deve ser avaliada (seja em `04_modules/user-stories/...`, `requirements/`, etc).
- **Status Alvo**: REFINING ou READY (Padrão: READY).

---

## 3. PASSO 1: Execução do Script Validador

Esta skill repassa a inspeção lógica para um utilitário Node.js construído para interpretar as constraints do sistema.

Você **DEVE** acionar o terminal rodando o script:

```bash
node packages/agent-skills/scripts/transition-spec-status.js <caminho_absoluto_ou_relativo_do_markdown> <STATUS_ALVO>
```

Por exemplo:

```bash
node packages/agent-skills/scripts/transition-spec-status.js docs/04_modules/user-stories/features/US-MOD-000-F01.md READY
```

---

## 4. PASSO 2: Interpretação do Resultado

1. **Se o script falhar (Exit Code 1):**
   O terminal retornará os itens pendentes detectados (ex: *Owner não preenchido*, *Ausência de Gherkin*).
   Você **NÃO DEVE** forçar a alteração de status manualmente. Retorne ao usuário os itens apontados pelo script que impediram a validação, guiando-o no preenchimento antes de tentar de novo.

> [!CAUTION]
> **REGRA DE OURO (NUNCA BURLAR):**
> O agente **ABSOLUTAMENTE NUNCA** deve alterar ou promover o campo `estado_item` editando o arquivo Markdown diretamente (seja via ferramentas de substituição ou reescrita), **independentemente de qual seja o status atual** (mesmo que seja algo fora do padrão como "em revisao").
> Toda e qualquer mudança de status TEM que ser feita **exclusiva e unicamente** pelo sucesso do script `transition-spec-status.js`. Se o script falhar ou não conseguir alterar, o agente deve reportar o erro ao usuário ao invés de forçar a edição manualmente, garantindo que as validações sempre ocorram.

1. **Se o script tiver sucesso (Exit Code 0 e sucesso reportado):**
   O script terá feito o replace e promovido o `estado_item`.

---

## 5. Passo Final: Comunicação

Confirme ao usuário de forma síncrona o resultado gerado pela execução do script.
Caso a promoção para `READY` tenha sido realizada em um arquivo de *User Story*, lembre ao usuário que agora a story está elegível para o comando de `scaffold module`.
