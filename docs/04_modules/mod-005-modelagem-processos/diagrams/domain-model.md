# MOD-005 — Modelo de Domínio

## Ciclo de Vida do Processo & Grafo de Estágios

```mermaid
graph TD
    subgraph LIFECYCLE ["Ciclo de Vida do ProcessCycle"]
        DRAFT["DRAFT<br/>rascunho editável"]
        PUB["PUBLISHED<br/>em uso"]
        DEP["DEPRECATED<br/>somente leitura"]
        DRAFT -->|"publish"| PUB
        PUB -->|"deprecate"| DEP
        PUB -.->|"fork (nova versão)"| DRAFT
    end

    subgraph GRAFO ["Exemplo de Grafo de Estágios"]
        SI["Stage Inicial<br/>isInitial=true"]
        SA["Stage A<br/>ordem 1"]
        G["Gate<br/>APPROVAL · DOCUMENT<br/>CHECKLIST · INFORMATIVE"]
        SB["Stage B<br/>ordem 2"]
        ST["Stage Terminal<br/>isTerminal=true"]
        SI -->|"transição"| SA
        SA -->|"pré-condição"| G
        G -->|"resolvido"| SB
        SB -->|"transição"| ST
    end

    MS["MACRO_STAGE<br/>swimlane agrupador"]
    PR["PROCESS_ROLE<br/>papéis do ciclo"]
    SR["STAGE_ROLE<br/>responsáveis por stage"]
    FK["Fork<br/>parentCycleId<br/>version++"]

    MS -.->|"agrupa"| SA
    MS -.->|"agrupa"| SB
    PR -.->|"vinculado via"| SR
    PUB -.->|"fork"| FK

    classDef draft fill:#F39C12,stroke:#D68910,color:#fff
    classDef published fill:#27AE60,stroke:#1E8449,color:#fff
    classDef deprecated fill:#95A5A6,stroke:#7F8C8D,color:#fff
    classDef stage fill:#2E86C1,stroke:#2471A3,color:#fff
    classDef gate fill:#E74C3C,stroke:#CB4335,color:#fff
    classDef support fill:#8E44AD,stroke:#7D3C98,color:#fff

    class DRAFT,FK draft
    class PUB published
    class DEP deprecated
    class SI,SA,SB,ST stage
    class G gate
    class MS,PR,SR support
```

## Entidades e Relacionamentos

```mermaid
erDiagram
    PROCESS_CYCLE ||--o{ MACRO_STAGE : "contém"
    MACRO_STAGE ||--o{ STAGE : "agrupa"
    STAGE ||--o{ GATE : "pré-condições"
    STAGE ||--o{ STAGE_TRANSITION : "from"
    STAGE ||--o{ STAGE_TRANSITION : "to"
    STAGE ||--o{ STAGE_ROLE : "responsáveis"
    PROCESS_CYCLE ||--o{ PROCESS_ROLE : "papéis"
    PROCESS_CYCLE ||--o| PROCESS_CYCLE : "parentCycleId (fork)"

    PROCESS_CYCLE {
        uuid id PK
        uuid tenantId FK
        varchar codigo UK "imutável"
        varchar nome
        text descricao
        int version "incrementa no fork"
        varchar status "DRAFT|PUBLISHED|DEPRECATED"
        uuid parentCycleId FK "ciclo pai (fork)"
        timestamptz publishedAt
        uuid createdBy FK
    }

    MACRO_STAGE {
        uuid id PK
        uuid cycleId FK
        varchar codigo
        varchar nome
        int ordem
    }

    STAGE {
        uuid id PK
        uuid macroStageId FK
        uuid cycleId FK
        varchar codigo
        varchar nome
        int ordem
        boolean isInitial "exatamente 1 por ciclo"
        boolean isTerminal
        float canvasX "posição visual"
        float canvasY "posição visual"
    }

    GATE {
        uuid id PK
        uuid stageId FK
        varchar nome
        varchar gateType "APPROVAL|DOCUMENT|CHECKLIST|INFORMATIVE"
        boolean required
        int ordem
    }

    STAGE_TRANSITION {
        uuid id PK
        uuid fromStageId FK
        uuid toStageId FK "mesmo ciclo, sem self-loop"
        varchar nome
        text condicao
        boolean gateRequired
        boolean evidenceRequired
        jsonb allowedRoles
    }

    PROCESS_ROLE {
        uuid id PK
        uuid cycleId FK
        varchar codigo
        varchar nome
    }

    STAGE_ROLE {
        uuid stageId FK
        uuid processRoleId FK
    }
```
