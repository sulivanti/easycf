# Skill: enrich

Orquestra os agentes de enriquecimento PKG-DEV-001 para um módulo, respeitando dependências entre pilares.

> **Caminhos:** `.agents/paths.json` | **Registro:** `.agents/enrichment-registry.json` | **Contexto normativo:** `.agents/context-map.json` → `enrich`

## Argumento

$ARGUMENTS deve conter:

1. **Caminho do módulo** (ex: `docs/04_modules/mod-001-pedidos/`)
2. **Seletor de agentes** (opcional, default: `all`):
   - `all` — executa todos os 11 agentes na ordem de dependências
   - ID único — ex: `AGN-DEV-02`
   - Lista separada por vírgula — ex: `AGN-DEV-02,AGN-DEV-04,AGN-DEV-06`
   - Nome do pilar — ex: `BR`, `DATA`, `SEC` (resolve para o agente correspondente)

Se não fornecido, pergunte ao usuário.

---

## PASSO 1: Validação do Módulo

Leia o `mod.md` do módulo informado.

- Se **não existir**, aborte: `"Módulo não encontrado. Execute /project:forge-module primeiro."`
- Se `estado_item` for `READY`, aborte: `"Módulo selado como READY. Use /project:create-amendment para alterações."`

## PASSO 2: Resolução de Agentes

Leia `.agents/enrichment-registry.json`.

### Se `all`:
Use a sequência definida em `execution_phases`:

| Fase | Agentes | Label |
|------|---------|-------|
| 1 | AGN-DEV-01 | Escala e escopo |
| 2 | AGN-DEV-02, AGN-DEV-03 | Regras de negócio e requisitos funcionais |
| 3 | AGN-DEV-04 | Modelo de dados e eventos |
| 4 | AGN-DEV-05, AGN-DEV-08 | Integrações e NFR |
| 5 | AGN-DEV-06 | Segurança e SEC-002 |
| 6 | AGN-DEV-07 | UX e jornadas |
| 7 | AGN-DEV-09, AGN-DEV-10 | ADR e pendências |
| 8 | AGN-DEV-11 | Validação cruzada |

### Se ID único ou lista:
Ordene os agentes selecionados pela ordem de fases acima. Se AGN-DEV-11 estiver na lista, mova-o para o final.

### Resolução por nome de pilar:
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

## PASSO 3: Aviso de Contexto (modo `all`)

Se o seletor for `all`, informe ao usuário:

> **Nota:** A execução de todos os 11 agentes em uma única conversa acumula contexto progressivamente. Para módulos grandes ou complexos, considere executar em batches:
> - Batch 1: `AGN-DEV-01,AGN-DEV-02,AGN-DEV-03`
> - Batch 2: `AGN-DEV-04,AGN-DEV-05,AGN-DEV-06`
> - Batch 3: `AGN-DEV-07,AGN-DEV-08,AGN-DEV-09,AGN-DEV-10`
> - Batch 4: `AGN-DEV-11` (validação)

Pergunte se deseja continuar com `all` ou usar batches. Se o usuário confirmar `all`, prossiga.

## PASSO 4: Execução Sequencial

Para cada fase na sequência resolvida:

1. Anuncie a fase: `### Fase {N}: {label}`
2. Para cada agente na fase, invoque:
   ```
   /project:enrich-agent {caminho_modulo} {agent_id}
   ```
3. Após cada agente, registre o resultado (items gerados, missing_info)
4. Se um agente reportar `missing_info` crítico que impede fases seguintes, pause e pergunte ao usuário

## PASSO 5: Relatório Final

Após todos os agentes executados, emita um resumo consolidado:

```
## Relatório de Enriquecimento — {caminho_modulo}

### Agentes executados
| Fase | Agente | Pilar | Items | Status |
|------|--------|-------|-------|--------|
| 1 | AGN-DEV-01 | MOD | 1 | ✅ |
| 2 | AGN-DEV-02 | BR | 3 | ✅ |
| ... | ... | ... | ... | ... |

### Arquivos modificados
- {lista de arquivos criados ou atualizados}

### Missing Info (consolidado)
- {lista de lacunas pendentes de todos os agentes}

### Próximos passos
- Revise os arquivos enriquecidos
- Resolva os itens de Missing Info
- Quando satisfeito, promova estado_item para READY
```
