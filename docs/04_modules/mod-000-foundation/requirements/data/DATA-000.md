> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.** Use a skill pertinente para versionar alterações.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-08 | arquitetura | Baseline Inicial (scaffold-module) |

## DATA-000 — Modelo de Dados Base Foundation

- **Objetivo:** Estabelecer entidades primárias de autenticação e organização (usuários, sessões, filiais/tenants).
- **Tipo de Tabela/Armazenamento:** Relacional (SQL)
- **Campos Obrigatórios Padrão:**
  - `id`: UUID NOT NULL
  - `codigo`: varchar NOT NULL UNIQUE
  - `status`: String(enum) NOT NULL
  - `created_at`: timestamptz UTC NOT NULL
  - `updated_at`: timestamptz UTC NOT NULL
  - `deleted_at`: timestamptz NULL
- **Relacionamentos e Constraints:**
  - FK ON DELETE RESTRICT
- **Eventos do domínio:** criado | atualizado | inativado | logado | deslogado
- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-08
- **rastreia_para:** BR-000, FR-000
- **referencias_exemplos:** [US-MOD-000](../../../user-stories/epics/US-MOD-000.md)
- **evidencias:** N/A
