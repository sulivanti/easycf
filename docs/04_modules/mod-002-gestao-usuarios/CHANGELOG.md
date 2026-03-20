> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# CHANGELOG - MOD-002

## Ciclo de Estabilidade do Módulo

> 🟢 Verde = Concluído | 🟠 Laranja = Em Andamento | 🔵 Azul = Estável Ancestral | ⬜ Cinza = Previsto

```mermaid
flowchart TD
    E1["1 - História Geradora (Ágil)"]
    E2["2 - Forja Arquitetural (Scaffold)"]
    E3(["3 - Stubs em DRAFT"])
    E4["4 - Enriquecimento Simultâneo BDD/TDD"]
    E5(["5 - Selo READY (Estável Imutável)"])
    E6["6 - Adendos Futuros (Amendments)"]

    E1 --> E2 --> E3 --> E4 --> E5 --> E6

    style E1  fill:#27AE60,color:#fff,stroke:#1E8449
    style E2  fill:#27AE60,color:#fff,stroke:#1E8449
    style E3  fill:#27AE60,color:#fff,stroke:#1E8449
    style E4  fill:#E67E22,color:#fff,stroke:#CA6F1E,font-weight:bold
    style E5  fill:#95A5A6,color:#fff,stroke:#7F8C8D
    style E6  fill:#95A5A6,color:#fff,stroke:#7F8C8D
```

*O módulo está na **Etapa 4** — stubs gerados em DRAFT, desenvolvimento em ritmo acelerado.*

---

## Histórico de Versões

| Versão | Data | Responsável | Descrição |
|--------|------|-------------|-----------|
| 0.3.0 | 2026-03-17 | AGN-DEV-01/02/03 | Batch 1: AGN-DEV-01 re-validou MOD (sem lacunas). AGN-DEV-02 corrigiu rastreabilidade BR-003→FR-002 e BR-004→FR-003. AGN-DEV-03 adicionou campos idempotency/timeline explícitos em FR-001/002/003. |
| 0.2.0 | 2026-03-17 | AGN-DEV-01 | Enriquecimento MOD/Escala: score DOC-ESC-001 §4.2 (2 pts → N1), personas com scopes, OKRs do épico, premissas/restrições, matriz MUST/SHOULD N1, checklist PR N1 Web, estrutura de pastas DOC-ESC-001 §6.3. |
| 0.1.0 | 2026-03-17 | arquitetura | Baseline Inicial — scaffold gerado via `forge-module` a partir de US-MOD-002 (READY). Módulo UX-First: consome MOD-000-F05 (Users API) e F06 (Roles API). Stubs obrigatórios criados: DATA-003, SEC-002. Todos os itens nascem em `estado_item: DRAFT`. |
