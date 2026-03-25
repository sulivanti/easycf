# MOD-000 — Modelo de Domínio

## Modelo RBAC & Multi-tenancy

```mermaid
graph TD
    U["USER<br/>id · email · status"]
    CU["CONTENT_USERS<br/>fullName · cpfCnpj · avatar"]
    S["SESSION<br/>kill-switch · deviceFp<br/>rememberMe · expiresAt"]
    TU["TENANT_USER<br/>pivot N:M"]
    T["TENANT<br/>codigo · status"]
    R["ROLE<br/>codigo · status"]
    RP["ROLE_PERMISSION<br/>Scope VO<br/>dominio:entidade:acao"]
    DE["DOMAIN_EVENTS<br/>36 event types<br/>aggregateId · payload"]

    U -->|"1:1 profile"| CU
    U -->|"1:N sessions"| S
    U -->|"N:M via pivot"| TU
    T -->|"N:M via pivot"| TU
    R -->|"assigned via"| TU
    R -->|"has scopes"| RP
    U -.->|"emite"| DE

    classDef user fill:#2d6a4f,stroke:#1b4332,color:#fff
    classDef auth fill:#40916c,stroke:#2d6a4f,color:#fff
    classDef tenant fill:#52b788,stroke:#40916c,color:#fff
    classDef role fill:#74c69d,stroke:#52b788,color:#000
    classDef events fill:#95A5A6,stroke:#7F8C8D,color:#fff

    class U user
    class CU,S auth
    class T,TU tenant
    class R,RP role
    class DE events
```

## Entidades e Relacionamentos

```mermaid
erDiagram
    USER ||--o| CONTENT_USERS : "1:1 profile"
    USER ||--o{ SESSION : "1:N sessions"
    USER ||--o{ TENANT_USER : "N:M via pivot"
    TENANT ||--o{ TENANT_USER : "N:M via pivot"
    ROLE ||--o{ TENANT_USER : "assigned via"
    ROLE ||--o{ ROLE_PERMISSION : "has scopes"

    USER {
        uuid id PK
        varchar codigo UK
        email email "Email VO"
        varchar passwordHash
        varchar mfaSecret
        varchar status "PENDING|ACTIVE|INACTIVE|BLOCKED"
        boolean forcePwdReset
        timestamptz deletedAt "LGPD soft-delete"
    }

    CONTENT_USERS {
        uuid userId PK "FK para users"
        varchar fullName
        varchar cpfCnpj
        varchar avatarUrl
    }

    SESSION {
        uuid id PK
        uuid userId FK
        boolean isRevoked "kill-switch"
        varchar deviceFp
        boolean rememberMe "30d TTL"
        timestamptz expiresAt
        timestamptz revokedAt
    }

    TENANT {
        uuid id PK
        varchar codigo UK
        varchar name
        varchar status "ACTIVE|BLOCKED|INACTIVE"
    }

    ROLE {
        uuid id PK
        varchar codigo UK
        varchar name
        varchar status "ACTIVE|INACTIVE"
    }

    ROLE_PERMISSION {
        uuid roleId FK
        varchar scope "Scope VO: dominio:entidade:acao"
    }

    TENANT_USER {
        uuid userId FK
        uuid tenantId FK
        uuid roleId FK
        varchar status "ACTIVE|BLOCKED"
    }

    DOMAIN_EVENTS {
        uuid id PK
        varchar eventType "36 event types"
        uuid aggregateId
        jsonb payload
        timestamptz createdAt
    }
```
