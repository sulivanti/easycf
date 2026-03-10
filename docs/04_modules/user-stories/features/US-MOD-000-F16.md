# US-MOD-000-F16 — Módulo de Storage e Upload Centralizado

**Status Ágil:** `DRAFT`
**Data:** 2026-03-06
**Autor(es):** Arquitetura
**Módulo Destino:** **MOD-000** (Foundation)
**Referências Normativas:** DOC-PADRAO-005 | DOC-ARC-003

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** DOC-PADRAO-005, DOC-ARC-003
- **nivel_arquitetura:** 1 (Infraestrutura de Negócio / Foundation)
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*

---

## 1. Contexto e Problema

Sistemas complexos lidam com arquivos binários de diversas origens (avatares, anexos a contratos, uploads de planilhas CSV para importação, geração de relatórios exportados). Tradicionalmente, módulos diferentes abordavam o armazenamento em silos e os arquivos passavam pela camada lógica da API.

Com a normativa **DOC-PADRAO-005_Storage_e_Upload**, estabeleceu-se o dogma de que o backend **nunca** processará binários em suas rotas transacionais. Todos os arquivos deverão usar abordagens de `Presigned URLs` (envio direto ao bucket) acopladas a uma estrita validação transacional pontilhada via banco de dados (`storage_objects`).

## 2. A Solução (Linguagem de Negócio)

Como **desenvolvedor do EasyCodeFramework**, quero implementar um módulo funcional de Storage Centralizado que forneça as proteções, o schema de dados e os endpoints necessários (Two-Step Flow) para que **qualquer outro módulo de negócio** possa facilmente adicionar anexos e imagens às suas entidades sem recriar lógica e de forma provider-agnóstica (seja MinIO local ou S3 Cloud).

### Carga Funcional Esperada

A Feature entregará a abstração do `StorageProvider` que obedecerá as variáveis de sistema (ex: `STORAGE_MAX_ATTACHMENT_BYTES`) e três rotas públicas canônicas:

1. `POST /uploads/presign` (Inicia intenção de upload / URL temporária).
2. `POST /uploads/{upload_id}/confirm` (Valida a chegada do objeto e atrela ao banco).
3. `GET /uploads/{upload_id}/signed-url` (Disponibiliza binários privados).

Além disso, prevê os Workers de Job em background atrelados à arquitetura para processamento (Purge de efêmeros) e re-encodação (Remoção de EXIFs de avatares).

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Upload Governed (Fluxo Two-Step com Presigned URL)

  Cenário: Solicitação de envio válida para um Anexo de Contrato
    Dado que um Usuário autenticado requer upload para a entity_type "contract"
    E a entidade "contract" consta no DOC-PADRAO-005 como suportada
    E o usuário possui a permissão de escrita local ("contracts:write")
    Quando ele enviar as meta-informações para POST /uploads/presign
    Então a API DEVE registrar a intenção em "storage_objects" (status='pending')
    E a API DEVE retornar um "upload_id" e uma "presigned_url" restrita a 5 minutos de TTL

  Cenário: Bloqueio de Payload Excessivo
    Dado que um Usuário requisita presign de arquivo cujo size_bytes exceda "STORAGE_MAX_ATTACHMENT_BYTES"
    Quando ele enviar a intenção para POST /uploads/presign
    Então a API DEVE retornar Erro 413 Payload Too Large

  Cenário: Proteção do Binário pela API 
    Dado que o Usuário completou o envio diretamente ao Bucket (Presigned URL)
    Quando o Frontend invocar POST /uploads/{upload_id}/confirm
    Então a API DEVE interrogar nativamente o Provider para verificar a integridade da chave
    E somente se atestado, DEVE alterar o status de pending para "confirmed"
    E DEVE emitir evento "storage.object_confirmed" blindando a rastreabilidade

  Cenário: Segurança de Consumo e Tenant Isolation
    Dado que um Usuário do Tenant B tenta solicitar um signed-url para o {upload_id} do Tenant A
    Quando ele requisitar GET /uploads/{upload_id}/signed-url
    Então a API DEVE rejeitar com 404/403 (Quebra de Isolation) e interceptar registro indevido.
```

---

## 4. Regras Críticas / Restrições Especiais

1. **DB Isolation:** A tabela `storage_objects` usa o UUID `tenant_id`. Nenhuma URL transacional para visualização de PDF/Imagem passará despercebida da validação transacional do UUID do Tenant Solicitante.
2. **Arquivos Privados:** Em hipótese alguma o schema poderá gerar arquivos public_read, inclusive Avatares. Todo get consumirá signed URLs efêmeras via Provider Adapter.
3. **MIME Seguros:** Somente formatos liberados na tabela canônica do DOC-PADRAO-005. O Backend é responsável por double-check (MIME x Extensão) no evento conformador.
4. **Sem Arquivos Orfãos Infinitos:** Implementar as Workers Crons exigidas pela infraestrutura documentada — limpezas de lixo não-conformado ocorrem sistematicamente após o prazo limite.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [ ] Normativa `DOC-PADRAO-005` formalizada em 01_normativos.
- [ ] Contratos HTTP e Schema `storage_objects` especificados.
- [ ] O modelo `domains_eventes` possui suporte e mapeamento de correlações aos eventos "storage.*".

---

> ⚠️ **Atenção:** Esta US gera contratos de API base para todo o sistema (Nível 1 de Arquitetura). Qualquer divergência transacional sobre arquivos inviabiliza as lógicas das importações e exportações de dados das features subsequentes.
