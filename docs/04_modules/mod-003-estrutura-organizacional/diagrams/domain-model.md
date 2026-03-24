# MOD-003 — Modelo de Domínio

## Hierarquia Organizacional (5 Níveis)

```mermaid
graph TD
    N1["N1 — Grupo Empresarial"]
    N2a["N2 — Empresa A"]
    N2b["N2 — Empresa B"]
    N3a["N3 — Regional Sul"]
    N3b["N3 — Regional Norte"]
    N4a["N4 — Unidade SP"]
    N4b["N4 — Unidade RJ"]
    N5a["N5 — Filial SP-01<br/>(Tenant)"]
    N5b["N5 — Filial RJ-01<br/>(Tenant)"]

    N1 --> N2a
    N1 --> N2b
    N2a --> N3a
    N2a --> N3b
    N3a --> N4a
    N3b --> N4b
    N4a -.->|"OrgUnitTenantLink<br/>(apenas N4→N5)"| N5a
    N4b -.->|"OrgUnitTenantLink"| N5b

    classDef n1 fill:#2d6a4f,stroke:#1b4332,color:#fff
    classDef n2 fill:#40916c,stroke:#2d6a4f,color:#fff
    classDef n3 fill:#52b788,stroke:#40916c,color:#fff
    classDef n4 fill:#74c69d,stroke:#52b788,color:#000
    classDef n5 fill:#95A5A6,stroke:#7F8C8D,color:#fff

    class N1 n1
    class N2a,N2b n2
    class N3a,N3b n3
    class N4a,N4b n4
    class N5a,N5b n5
```

## Entidades e Relacionamentos

```mermaid
erDiagram
    ORG_UNIT ||--o{ ORG_UNIT : "parent_id (N1→N2→N3→N4)"
    ORG_UNIT ||--o{ ORG_UNIT_TENANT_LINK : "apenas nivel=4"
    TENANT ||--o{ ORG_UNIT_TENANT_LINK : "N5 = tenant existente"

    ORG_UNIT {
        uuid id PK
        varchar codigo UK "imutável"
        varchar nome
        text descricao
        int nivel "CHECK 1-4, imutável"
        uuid parent_id FK "imutável"
        varchar status "ACTIVE|INACTIVE"
        timestamptz deleted_at "soft-delete"
    }

    ORG_UNIT_TENANT_LINK {
        uuid id PK
        uuid org_unit_id FK_UK "CHECK nivel=4"
        uuid tenant_id FK_UK
        uuid created_by FK
        timestamptz deleted_at "soft-unlink"
    }

    TENANT {
        uuid id PK
        varchar codigo UK
        varchar name
        varchar status
    }
```
