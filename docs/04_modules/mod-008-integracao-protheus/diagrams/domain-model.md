# MOD-008 — Modelo de Domínio

```mermaid
erDiagram
    INTEGRATION_SERVICE ||--o{ INTEGRATION_ROUTINE : "destino"
    INTEGRATION_ROUTINE ||--o{ INTEGRATION_FIELD_MAPPING : "mapeamentos"
    INTEGRATION_ROUTINE ||--o{ INTEGRATION_PARAM : "parâmetros"
    INTEGRATION_ROUTINE ||--o{ INTEGRATION_CALL_LOG : "execuções"
    BEHAVIOR_ROUTINE ||--|| INTEGRATION_ROUTINE : "herança (routineType=INTEGRATION)"
    INTEGRATION_CALL_LOG ||--o{ INTEGRATION_REPROCESS_REQUEST : "reprocessamento"

    INTEGRATION_SERVICE {
        uuid id PK
        uuid tenantId FK
        varchar codigo UK
        varchar nome
        varchar baseUrl
        varchar authType "NONE|BASIC|BEARER|OAUTH2"
        jsonb authConfig "AES-256 encrypted"
        int timeoutMs
        varchar status "ACTIVE|INACTIVE"
        varchar environment
    }

    INTEGRATION_ROUTINE {
        uuid id PK
        uuid routineId FK "ref behavior_routines"
        uuid serviceId FK
        varchar httpMethod
        varchar endpoint
        jsonb headers
    }

    INTEGRATION_FIELD_MAPPING {
        uuid id PK
        uuid integrationRoutineId FK
        varchar sourceField
        varchar targetField
        varchar mappingType "FIELD|PARAM|HEADER|FIXED_VALUE|DERIVED"
        jsonb transformExpr
        int ordem
    }

    INTEGRATION_PARAM {
        uuid id PK
        uuid integrationRoutineId FK
        varchar paramName
        varchar paramType "FIXED|DERIVED_FROM_TENANT|DERIVED_FROM_CONTEXT|HEADER"
        varchar paramValue
    }

    INTEGRATION_CALL_LOG {
        uuid id PK
        uuid integrationRoutineId FK
        varchar status "QUEUED|RUNNING|SUCCESS|FAILED|DLQ|REPROCESSED"
        jsonb requestPayload
        jsonb responseBody
        int httpStatus
        int retryCount
        timestamptz startedAt
        timestamptz completedAt
        text errorMessage
    }

    INTEGRATION_REPROCESS_REQUEST {
        uuid id PK
        uuid callLogId FK
        uuid requestedBy FK
        text motivo
        timestamptz requestedAt
    }
```
