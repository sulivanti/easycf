# MOD-004 — Modelo de Domínio

## 3 Mecanismos de Controle de Acesso

```mermaid
graph TD
    U["Ana Silva<br/>(Usuária)"]

    subgraph BINDING ["Escopo Organizacional"]
        UOS["Escopo Primário de Ana<br/>Regional Sul<br/>ativo desde 01/01"]
        OU["Regional Sul<br/>(Nível 3)"]
    end

    subgraph SHARING ["Compartilhamento de Acesso"]
        AS["Ana compartilha<br/>Pedido #4521 com Carlos<br/>motivo: férias de Ana<br/>até 15/04"]
    end

    subgraph DELEGATION ["Delegação Temporária"]
        AD["Ana delega para Maria<br/>papel Aprovador<br/>motivo: licença médica<br/>até 30/03"]
        RO["Aprovador<br/>(Papel delegado)"]
    end

    U -->|"escopo primário"| UOS
    UOS -->|"vinculada a"| OU
    U -->|"compartilha acesso"| AS
    U -->|"delega papel"| AD
    AD -->|"papel delegado"| RO

    classDef user fill:#1B4F72,stroke:#154360,color:#fff
    classDef binding fill:#2E86C1,stroke:#2471A3,color:#fff
    classDef sharing fill:#27AE60,stroke:#1E8449,color:#fff
    classDef deleg fill:#8E44AD,stroke:#7D3C98,color:#fff

    class U user
    class UOS,OU binding
    class AS sharing
    class AD,RO deleg
```

## Entidades e Relacionamentos

```mermaid
erDiagram
    USER ||--o{ USER_ORG_SCOPE : "binding"
    ORG_UNIT ||--o{ USER_ORG_SCOPE : "N1-N4 node"
    USER ||--o{ ACCESS_SHARE : "grantor"
    USER ||--o{ ACCESS_SHARE : "grantee"
    USER ||--o{ ACCESS_DELEGATION : "delegator"
    USER ||--o{ ACCESS_DELEGATION : "delegatee"
    ROLE ||--o{ ACCESS_DELEGATION : "delegated role"

    USER_ORG_SCOPE {
        uuid id PK
        uuid tenantId FK
        uuid userId FK
        uuid orgUnitId FK "N1-N4"
        varchar scopeType "PRIMARY | SECONDARY"
        uuid grantedBy FK
        timestamptz validFrom
        timestamptz validUntil
        varchar status "ACTIVE | INACTIVE"
    }

    ACCESS_SHARE {
        uuid id PK
        uuid tenantId FK
        uuid grantorId FK
        uuid granteeId FK
        varchar resourceType
        uuid resourceId
        jsonb allowedActions
        text reason "obrigatório"
        timestamptz validFrom
        timestamptz validUntil "obrigatório"
        varchar status "ACTIVE | REVOKED | EXPIRED"
    }

    ACCESS_DELEGATION {
        uuid id PK
        uuid tenantId FK
        uuid delegatorId FK
        uuid delegateeId FK
        uuid roleId FK
        uuid orgUnitId FK
        jsonb delegatedScopes "subset do delegator"
        text reason "obrigatório"
        timestamptz validUntil "obrigatório"
        varchar status "ACTIVE | REVOKED | EXPIRED"
    }
```
