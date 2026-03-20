# Skill: enrich-all

Orquestra o enriquecimento completo de **todos os módulos elegíveis**, usando uma estratégia **híbrida de 4 batches** com isolamento de contexto entre batches para equilibrar qualidade e eficiência.

> **Caminhos:** `.agents/paths.json` | **Registro:** `.agents/enrichment-registry.json` | **Contexto normativo:** `.agents/context-map.json` → `enrich-all`

## Argumento

$ARGUMENTS (opcional):

1. **Seletor de módulos** (default: `all`):
   - `all` — descobre e processa todos os módulos com `estado_item != READY`
   - Lista separada por vírgula — ex: `mod-001,mod-003,mod-005`
2. **Seletor de agentes** (opcional, default: `all`):
   - `all` — executa todos os 11 agentes na ordem de batches
   - Lista separada por vírgula — ex: `AGN-DEV-02,AGN-DEV-04`
   - Nome do pilar — ex: `BR,DATA,SEC`
3. **Flag `--dry-run`** (opcional): apenas lista os módulos e agentes que seriam executados, sem executar

Se não fornecido, assume `all all` (todos os módulos, todos os agentes).

---

## Estratégia de Isolamento: Híbrido 4-Batch

Cada batch é executado em um **subagent dedicado** com contexto limpo. Dentro de cada batch, os agentes compartilham contexto (afinidade temática). Entre batches, o contexto é zerado (evita contaminação de persona).

| Batch | Fases | Agentes | Afinidade | Justificativa |
|-------|-------|---------|-----------|---------------|
| **Batch 1** | 1-2 | AGN-DEV-01, AGN-DEV-02, AGN-DEV-03 | Fundação + Negócio | MOD/BR/FR são leves, fundacionais e compartilham vocabulário de negócio |
| **Batch 2** | 3-4 | AGN-DEV-04, AGN-DEV-05, AGN-DEV-08 | Dados + Infra | DATA/INT/NFR dependem de BR/FR (leem do disco), normativos técnicos próximos |
| **Batch 3** | 5-6 | AGN-DEV-06, AGN-DEV-07 | Segurança + UX | SEC/UX dependem de DATA (leem do disco), cada um lê seus normativos específicos |
| **Batch 4** | 7-8 | AGN-DEV-09, AGN-DEV-10, AGN-DEV-11 | Wrap-up + Validação | ADR/PENDENTE são derivados, VAL lê tudo do disco para validação cruzada |

**Trade-offs desta estratégia:**
- 4 subagents por módulo (vs 11 no isolamento total, vs 1 no compartilhado)
- 4 re-leituras de normativos base (vs 11 no isolamento total)
- Máximo 3 personas por batch (contaminação mínima e benéfica)
- Qualidade constante — nenhum batch acumula contexto suficiente para degradar

---

## PASSO 1: Descoberta de Módulos

Leia todos os `mod.md` em `docs/04_modules/mod-*/mod.md`.

Para cada módulo:
- Extraia `estado_item` do frontmatter/metadata
- Se `estado_item` == `READY`, **exclua** da lista (módulo selado)
- Se `estado_item` == `DRAFT` ou `WIP`, **inclua** na lista

Se o seletor de módulos não for `all`, filtre apenas os módulos especificados.

Ordene os módulos pelo número do módulo (ex: `mod-000` antes de `mod-001`).

Se nenhum módulo elegível for encontrado, aborte: `"Nenhum módulo elegível encontrado. Todos estão READY ou o filtro não corresponde a nenhum módulo."`

## PASSO 2: Resolução de Agentes

Leia `.agents/enrichment-registry.json`.

### Se `all`:
Use a distribuição de batches definida acima. Todos os 11 agentes em 4 batches.

### Se lista de IDs ou pilares:
1. Resolva cada pilar para seu agente conforme tabela:

| Pilar | Agente |
|-------|--------|
| MOD | AGN-DEV-01 |
| BR | AGN-DEV-02 |
| FR | AGN-DEV-03 |
| DATA | AGN-DEV-04 |
| INT | AGN-DEV-05 |
| SEC | AGN-DEV-06 |
| UX | AGN-DEV-07 |
| NFR | AGN-DEV-08 |
| ADR | AGN-DEV-09 |
| PENDENTE | AGN-DEV-10 |
| VAL | AGN-DEV-11 |

2. Distribua os agentes selecionados nos batches corretos (não crie batch vazio)
3. Se AGN-DEV-11 estiver na lista, garanta que fique no último batch

## PASSO 3: Plano de Execução

Apresente ao usuário o plano antes de executar:

```
## Plano de Enriquecimento — enrich-all (Híbrido 4-Batch)

### Módulos ({N} elegíveis)
| # | Módulo | Estado | Caminho |
|---|--------|--------|---------|
| 1 | mod-001-backoffice-admin | DRAFT | docs/04_modules/mod-001-backoffice-admin/ |
| ... | ... | ... | ... |

### Batches por módulo
| Batch | Agentes | Afinidade | Contexto |
|-------|---------|-----------|----------|
| 1 | AGN-DEV-01, 02, 03 | Fundação + Negócio | Subagent isolado |
| 2 | AGN-DEV-04, 05, 08 | Dados + Infra | Subagent isolado |
| 3 | AGN-DEV-06, 07 | Segurança + UX | Subagent isolado |
| 4 | AGN-DEV-09, 10, 11 | Wrap-up + Validação | Subagent isolado |

### Totais
- {N} módulos × 4 batches = {N×4} subagents
- {N} módulos × 11 agentes = {N×11} execuções de agente
```

Se `--dry-run`, pare aqui.

Caso contrário, pergunte: `"Confirma a execução? (sim/não)"`

## PASSO 4: Execução Híbrida

Para cada módulo na ordem:

1. Anuncie: `## Módulo {M}/{total}: {nome_modulo}`

2. Para cada **batch** na sequência (1 → 2 → 3 → 4):

   a. Anuncie: `### Batch {B}/4: {afinidade} — Agentes: {lista_agentes}`

   b. Lance **um único Agent** (subagent) com o seguinte prompt:

   ```
   Você é o orquestrador do Batch {B} de enriquecimento para o módulo {caminho_completo_do_modulo}.

   Execute sequencialmente os seguintes agentes, seguindo o skill descrito em
   .claude/commands/enrich-agent.md para CADA agente:

   Agentes deste batch (executar nesta ordem):
   {lista_ordenada_de_agent_ids}

   Para CADA agente do batch:
   1. Leia .claude/commands/enrich-agent.md e siga TODOS os passos (PASSO 1 a PASSO 8)
   2. Use o módulo: {caminho_completo_do_modulo}
   3. Use o agent_id correspondente
   4. Complete o enriquecimento antes de passar ao próximo agente

   IMPORTANTE:
   - Dentro do batch, execute os agentes SEQUENCIALMENTE (um após o outro)
   - Cada agente deve ler os arquivos atualizados do disco (incluindo o que agentes
     anteriores DO MESMO batch geraram)
   - Siga rigorosamente o contrato de cada agente (persona, normativos, anti-patterns)

   Ao final de TODOS os agentes do batch, retorne um resumo consolidado com:
   1. Para cada agente executado:
      - agent_id e nome
      - Items gerados/atualizados (IDs e títulos)
      - Arquivos criados ou modificados (paths completos)
      - Missing info (lacunas encontradas)
      - Checks passed/failed
      - Contract refs aplicados
   2. Lista consolidada de todos os arquivos modificados no batch
   3. Lista consolidada de missing_info do batch
   4. Se houve algum erro ou bloqueio, descreva claramente
   ```

   c. **Aguarde o subagent do batch completar** antes de lançar o próximo batch (respeita dependências entre batches — Batch 2 lê outputs do Batch 1, etc.)

   d. Colete o resultado do subagent e registre na tabela de resultados

   e. Se o batch reportar erro crítico ou missing_info que impede batches seguintes:
      - Pause e pergunte ao usuário: `"Batch {B} reportou missing_info crítico para {módulo}. Deseja: (1) continuar mesmo assim, (2) pular este módulo, (3) abortar tudo?"`

   f. Emita progresso após cada batch:
      ```
      ✅ Batch {B}/4 completo — {N} agentes executados, {X} items gerados
      ```

3. Após todos os 4 batches do módulo, emita um mini-relatório:

   ```
   ### Módulo {nome_modulo} — Completo
   | Batch | Agentes | Items | Status |
   |-------|---------|-------|--------|
   | 1 | AGN-DEV-01, 02, 03 | {N} | ✅ |
   | 2 | AGN-DEV-04, 05, 08 | {N} | ✅ |
   | 3 | AGN-DEV-06, 07 | {N} | ✅ |
   | 4 | AGN-DEV-09, 10, 11 | {N} | ✅ |

   **Arquivos modificados:** {total}
   **Missing info:** {total lacunas}
   ```

## PASSO 5: Relatório Final Consolidado

Após todos os módulos processados, emita:

```
## Relatório Final — enrich-all (Híbrido 4-Batch)

### Resumo
- Módulos processados: {N}
- Batches executados: {N×4}
- Total de agentes executados: {total_execucoes}
- Erros: {total_erros}

### Por Módulo
| Módulo | Batches OK | Agentes OK | Agentes Erro | Missing Info |
|--------|------------|------------|--------------|--------------|
| mod-001 | 4/4 | 11/11 | 0 | 3 items |
| ... | ... | ... | ... | ... |

### Arquivos modificados (consolidado)
{lista de todos os arquivos criados ou atualizados, agrupados por módulo}

### Missing Info (consolidado)
{lista de todas as lacunas pendentes, agrupadas por módulo e pilar}

### Erros (se houver)
- {módulo}: Batch {B} / {agent_id} — {descrição do erro}

### Próximos passos
- Revise os arquivos enriquecidos por módulo
- Resolva os itens de Missing Info
- Execute `/validate-all {caminho_modulo}` para cada módulo
- Quando satisfeito com cada módulo, promova com `/promote-module`
```
