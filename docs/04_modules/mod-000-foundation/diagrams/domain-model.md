# MOD-000 — Modelo de Domínio

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
        uuid userId PK_FK
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
