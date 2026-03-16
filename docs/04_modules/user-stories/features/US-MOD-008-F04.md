# US-MOD-008-F04 — UX: Editor de Rotinas de Integração (UX-INTEG-001)

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-008** (Integração Dinâmica — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-008, US-MOD-008-F01, US-MOD-008-F02, US-MOD-007-F05, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — editor de rotinas de integração
- **epico_pai:** US-MOD-008
- **manifests_vinculados:** UX-INTEG-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **arquiteto de integração**, quero editar rotinas de integração em uma interface estruturada — configurando HTTP, mapeamentos de campos e parâmetros técnicos — com a mesma experiência de versionamento do editor de rotinas de comportamento do MOD-007.

---

## 2. Escopo

### Inclui
- Listagem filtrada por routine_type=INTEGRATION com coluna de serviço destino
- Aba Config HTTP: serviço, método, endpoint template, timeout, retry, trigger events
- Aba Mapeamentos: CRUD drag-and-drop com formulário adaptativo por tipo
- Aba Parâmetros: CRUD com mascaramento de is_sensitive
- Aviso PROD: banner vermelho quando serviço de produção selecionado
- Teste via HML: botão com resultado inline (nunca PROD)
- Fork com motivo obrigatório (herda MOD-007)
- Modo readonly para PUBLISHED em todas as abas

### Não inclui
- APIs de backend — US-MOD-008-F01, F02, F03
- Monitor de integrações — US-MOD-008-F05

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Editor de Rotinas de Integração — UX-INTEG-001

  Cenário: Lista filtra apenas routine_type=INTEGRATION
    Dado que existem rotinas BEHAVIOR e INTEGRATION
    Quando admin acessa /integracoes/rotinas
    Então apenas rotinas com routine_type=INTEGRATION aparecem na listagem
    E coluna "Serviço destino" exibe o nome do serviço vinculado (ou "Não configurado")

  Cenário: Aba "Config. HTTP" com aviso para serviço PROD
    Dado que admin seleciona serviço "PROTHEUS-PROD" (environment=PROD)
    Então banner vermelho aparece: "Atenção: esta rotina chamará o ambiente de PRODUÇÃO."
    E o banner persiste enquanto PROD estiver selecionado

  Cenário: Endpoint template exibe preview de resolução
    Dado que admin digita "/WSRESTPV001/{case.object_id}"
    Então preview exibe: "/WSRESTPV001/[resolvido em runtime]"
    E tooltip: "Variáveis entre {} são resolvidas no momento da execução."

  Cenário: Trigger events permite selecionar eventos do MOD-006
    Dado que admin abre o multi-select "Disparar quando"
    Então lista exibe: case.stage_transitioned, case.opened, case.completed, case.cancelled
    E ao selecionar "case.stage_transitioned": input adicional aparece para filtrar por stage_id

  Cenário: Botão "Testar agora" sempre usa HML
    Dado que rotina tem serviço PROD configurado
    Quando admin clica "Testar agora (HML)"
    Então modal de confirmação: "Este teste usará o serviço 'PROTHEUS-HML'. Continuar?"
    E POST /integration-engine/execute é chamado com service=HML override
    E resultado (status, response, duration) exibido inline na aba

  Cenário: Sem serviço HML — botão desabilitado
    Dado que não existe nenhum serviço com environment=HML
    Então botão "Testar agora (HML)" está desabilitado
    E tooltip: "Cadastre um serviço de homologação (HML) para habilitar testes."

  Cenário: Mapeamento FIELD — autocomplete de campos do objeto
    Dado que admin está na aba "Mapeamentos" e clica "Adicionar mapeamento"
    E seleciona tipo=FIELD
    Então autocomplete "Campo origem" exibe campos do target_object vinculado à rotina
    E input "Campo destino Protheus" é livre
    E ao marcar "Obrigatório": badge "req." aparece na linha do mapeamento

  Cenário: Mapeamento FIXED_VALUE sem source_field
    Dado que admin seleciona tipo=FIXED_VALUE
    Então campo "Campo origem" não aparece (não aplicável)
    E campo "Valor literal" aparece com input de texto

  Cenário: Reordenar mapeamentos por drag-and-drop
    Dado que há 3 mapeamentos na aba
    Quando admin arrasta o 3º para posição 1
    Então lista reordena visualmente e PATCH é chamado ao soltar

  Cenário: Parâmetro is_sensitive oculta valor na listagem
    Dado que param tem is_sensitive=true
    Então coluna "Valor" exibe "••••••" na listagem
    E tooltip: "Valor sensível — nunca exibido ou logado."

  Cenário: Editor readonly para rotina PUBLISHED
    Dado que rotina está PUBLISHED
    Então todas as abas (HTTP, Mapeamentos, Parâmetros) readonly
    E botão "Nova versão" visível

  Cenário: Fork com motivo obrigatório (herda MOD-007)
    Quando admin clica "Nova versão"
    Então modal abre com campo "Motivo da mudança" (min 10 chars)
    E ao confirmar: novo DRAFT com version+1, config HTTP + mapeamentos + params copiados
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-INTEG-001 | Editor de Rotinas de Integração | [ux-integ-001.editor-rotinas-integ.yaml](../../../05_manifests/screens/ux-integ-001.editor-rotinas-integ.yaml) |

---

## 5. Regras Críticas

1. **Teste sempre HML** — nunca PROD diretamente pelo editor
2. **Aviso PROD**: banner vermelho persistente quando serviço PROD selecionado
3. **Fork**: motivo obrigatório (min 10 chars) — herdado do MOD-007
4. **is_sensitive**: valor mascarado tanto na UI quanto nos logs
5. **PUBLISHED**: editor 100% readonly em todas as abas

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-INTEG-001 criado
- [x] F01/F02/F03 em READY
- [x] Serviço HML disponível para teste
- [x] Gherkin com 12 cenários
- [ ] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] Abas HTTP/Mapeamentos/Parâmetros funcionando
- [ ] Aviso PROD visível
- [ ] Teste com HML funcional
- [ ] PUBLISHED readonly com fork
- [ ] Parâmetros sensíveis mascarados
- [ ] Testes E2E dos fluxos críticos
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Editor de integração com 3 abas, 12 cenários Gherkin, manifest UX-INTEG-001. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
