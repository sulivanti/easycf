# MOD-007 — Modelo de Domínio

```mermaid
erDiagram
    BEHAVIOR_ROUTINE ||--o{ ROUTINE_ITEM : "contém ações"
    BEHAVIOR_ROUTINE ||--o{ INCIDENCE_RULE : "vinculada via link"
    BEHAVIOR_ROUTINE ||--o| BEHAVIOR_ROUTINE : "parentRoutineId (fork)"
    CONTEXT_FRAMER_TYPE ||--o{ CONTEXT_FRAMER : "categoriza"
    TARGET_OBJECT ||--o{ TARGET_FIELD : "campos"
    ROUTINE_ITEM }o--|| TARGET_FIELD : "atua sobre"

    BEHAVIOR_ROUTINE {
        uuid id PK
        uuid tenantId FK
        varchar codigo UK "imutável"
        varchar nome
        varchar routineType "BEHAVIOR | INTEGRATION"
        int version "incrementa no fork"
        varchar status "DRAFT|PUBLISHED|DEPRECATED"
        uuid parentRoutineId FK
        timestamptz publishedAt
        uuid approvedBy FK
    }

    ROUTINE_ITEM {
        uuid id PK
        uuid routineId FK
        varchar itemType "7 tipos"
        varchar action "8 ações"
        jsonb value
        text conditionExpr "expressão condicional"
        text validationMessage
        boolean isBlocking "bloqueia MOD-006"
        int ordem
    }

    INCIDENCE_RULE {
        uuid id PK
        uuid tenantId FK
        varchar codigo UK
        varchar nome
        varchar triggerEvent
        text condicao
        varchar status "ACTIVE | INACTIVE"
    }

    CONTEXT_FRAMER {
        uuid id PK
        uuid tenantId FK
        varchar codigo UK "imutável"
        varchar nome
        uuid framerTypeId FK
        varchar status "ACTIVE | INACTIVE"
        int version
        timestamptz validFrom
        timestamptz validUntil
    }

    CONTEXT_FRAMER_TYPE {
        uuid id PK
        uuid tenantId FK
        varchar codigo UK
        varchar nome
    }

    TARGET_OBJECT {
        uuid id PK
        uuid tenantId FK
        varchar codigo UK
        varchar nome
        jsonb schema
    }

    TARGET_FIELD {
        uuid id PK
        uuid targetObjectId FK
        varchar codigo UK
        varchar nome
        varchar fieldType
    }
```

## Tipos de RoutineItem (7) x Ações (8)

```mermaid
graph LR
    subgraph ITEM_TYPES ["ItemType (7)"]
        T1["FIELD_ASSIGNMENT"]
        T2["FIELD_VALIDATION"]
        T3["FIELD_VISIBILITY"]
        T4["FIELD_AUDIT"]
        T5["CONDITIONAL_BLOCK"]
        T6["FORMULA_EVALUATION"]
        T7["INTEGRATION_CALL"]
    end

    subgraph ACTIONS ["ItemAction (8)"]
        A1["SET"]
        A2["CLEAR"]
        A3["APPEND"]
        A4["REPLACE"]
        A5["REMOVE"]
        A6["TOGGLE"]
        A7["TRIGGER"]
        A8["VALIDATE"]
    end

    T1 --> A1
    T1 --> A2
    T1 --> A4
    T2 --> A8
    T3 --> A6
    T5 --> A8
    T6 --> A1
    T7 --> A7

    classDef types fill:#E67E22,color:#fff,stroke:#CA6F1E
    classDef actions fill:#3498DB,color:#fff,stroke:#2980B9

    class T1,T2,T3,T4,T5,T6,T7 types
    class A1,A2,A3,A4,A5,A6,A7,A8 actions
```
