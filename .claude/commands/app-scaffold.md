# Skill: app-scaffold

Bootstraps os workspaces monorepo `apps/api` e `apps/web`, criando a estrutura de diretórios e arquivos base necessários para a geração de código (Fase 3).

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `app-scaffold`

## Quando usar

Execute **uma única vez** antes de iniciar o codegen. Se o scaffold já existir, a skill detecta e faz SKIP automático.

## Argumento

$ARGUMENTS (opcional):

- `all` (default) — scaffold completo (api + web)
- `api` — apenas apps/api
- `web` — apenas apps/web

Se não fornecido, assume `all`.

---

## PASSO 1: Gate — Verificar se já existe

Verifique se `apps/api/package.json` e/ou `apps/web/package.json` já existem.

- Se **ambos** existem e o argumento é `all` → emita `"Scaffold já existe. Nada a fazer."` e **SKIP**
- Se **apps/api/package.json** existe e argumento é `api` → emita SKIP para api
- Se **apps/web/package.json** existe e argumento é `web` → emita SKIP para web
- Caso contrário, prossiga com os itens que faltam

## PASSO 2: Ingestão de Contexto Normativo

**PARE.** Antes de gerar qualquer arquivo, leia **obrigatoriamente**:

1. `.agents/context-map.json` → entrada `app-scaffold` → lista de docs
2. Resolva e leia cada documento listado (via `docs/01_normativos/`)
3. Extraia convenções relevantes:
   - Stack tecnológica (DOC-PADRAO-001)
   - Dependências autorizadas (DOC-PADRAO-002)
   - Estrutura de diretórios (DOC-GNP-00 §3)

## PASSO 3: Scaffold `apps/api/` (se aplicável)

Crie a seguinte estrutura:

```
apps/api/
├── package.json            ← name: @easycode/api, type: module
├── tsconfig.json           ← strict, paths aliases
├── src/
│   ├── infrastructure/     ← shared infra (db client, logger, etc)
│   ├── domain/             ← shared domain types
│   ├── application/        ← shared app services
│   ├── presentation/       ← shared middleware, guards
│   ├── shared/             ← cross-cutting utilities
│   ├── modules/            ← módulos de negócio (vazio inicialmente)
│   └── docs/               ← documentação interna gerada
├── db/
│   ├── migrations/         ← migrações Drizzle
│   └── schema/             ← schemas Drizzle compartilhados
├── openapi/                ← contratos OpenAPI
└── test/                   ← testes de integração
```

Para cada diretório, crie um arquivo `.gitkeep` para garantir que o diretório seja rastreado pelo Git.

### package.json mínimo (apps/api):

```json
{
  "name": "@easycode/api",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts",
    "test": "vitest",
    "lint": "eslint src/"
  }
}
```

> **Nota:** NÃO adicione dependências ainda — isso será responsabilidade dos agentes COD ao gerarem código real. O package.json é apenas o esqueleto.

### tsconfig.json mínimo (apps/api):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "@infrastructure/*": ["src/infrastructure/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@presentation/*": ["src/presentation/*"],
      "@shared/*": ["src/shared/*"],
      "@modules/*": ["src/modules/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## PASSO 4: Scaffold `apps/web/` (se aplicável)

Crie a seguinte estrutura:

```
apps/web/
├── package.json            ← name: @easycode/web, type: module
├── tsconfig.json           ← strict
├── vite.config.ts          ← skeleton
├── src/
│   ├── modules/            ← módulos de UI (vazio inicialmente)
│   ├── shared/             ← componentes e utils compartilhados
│   └── routes/             ← roteamento
```

Para cada diretório, crie um arquivo `.gitkeep`.

### package.json mínimo (apps/web):

```json
{
  "name": "@easycode/web",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/"
  }
}
```

### tsconfig.json mínimo (apps/web):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"],
      "@routes/*": ["src/routes/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### vite.config.ts skeleton:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@routes': path.resolve(__dirname, 'src/routes'),
    },
  },
});
```

## PASSO 5: Verificar pnpm-workspace.yaml

Leia `pnpm-workspace.yaml` na raiz do monorepo.

- Se **não existe**, crie:
  ```yaml
  packages:
    - "apps/*"
  ```
- Se **existe** mas não inclui `apps/*`, adicione a entrada

**NÃO** execute `pnpm install` automaticamente — avise o usuário que precisa executar manualmente.

## PASSO 6: Relatório

Emita no chat:

```
## Relatório — app-scaffold

### Estrutura criada
- apps/api/ — {N} diretórios, {N} arquivos
- apps/web/ — {N} diretórios, {N} arquivos

### Arquivos de configuração
- apps/api/package.json ✅
- apps/api/tsconfig.json ✅
- apps/web/package.json ✅
- apps/web/tsconfig.json ✅
- apps/web/vite.config.ts ✅
- pnpm-workspace.yaml ✅ (criado|atualizado|já existia)

### Próximos passos
- Execute `pnpm install` na raiz do monorepo
- Inicie o codegen com `/codegen` ou `/codegen-all`
```
