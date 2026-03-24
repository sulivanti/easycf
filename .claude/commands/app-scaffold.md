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

### package.json (apps/api):

O package.json DEVE incluir as dependências autorizadas pelo DOC-PADRAO-002 desde o scaffold. Sem elas, os agentes COD geram código que não compila e `pnpm install` não resolve os pacotes necessários.

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
    "lint": "eslint src/",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "tsx src/db/migrate.ts"
  },
  "dependencies": {
    "fastify": "^4.29.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/helmet": "^11.0.0",
    "@fastify/jwt": "^8.0.0",
    "@fastify/cookie": "^9.0.0",
    "@fastify/oauth2": "^7.0.0",
    "@fastify/rate-limit": "^9.0.0",
    "drizzle-orm": "^0.45.0",
    "drizzle-zod": "^0.8.0",
    "postgres": "^3.4.0",
    "zod": "^3.23.0",
    "ioredis": "^5.4.0",
    "otplib": "^12.0.0",
    "resend": "^4.0.0",
    "bcrypt": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/bcrypt": "^5.0.0",
    "tsx": "^4.0.0",
    "tsup": "^8.0.0",
    "vitest": "^2.0.0",
    "drizzle-kit": "^0.31.0",
    "eslint": "^9.0.0"
  }
}
```

> **Importante:** As dependências listadas são as autorizadas por DOC-PADRAO-002. Módulos que precisem de pacotes adicionais devem registrar via amendment.

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
├── index.html                    ← Google Fonts (Inter, JetBrains Mono), <div id="root">
├── package.json                  ← name: @easycode/web, type: module
├── tsconfig.json                 ← strict, jsx: react-jsx
├── vite.config.ts                ← react + @tailwindcss/vite plugins
├── src/
│   ├── index.css                 ← @import "tailwindcss" + @theme block (DOC-UX-013 §3.3)
│   ├── main.tsx                  ← React root mount (createRoot + RouterProvider)
│   ├── router.tsx                ← TanStack Router root + route tree
│   ├── modules/                  ← módulos de UI (vazio inicialmente)
│   ├── shared/
│   │   ├── api/
│   │   │   └── http-client.ts    ← Fetch/axios wrapper com interceptor RFC 9457
│   │   ├── lib/
│   │   │   └── utils.ts          ← cn() helper (clsx + tailwind-merge)
│   │   └── ui/                   ← Gerados via shadcn CLI (DOC-UX-013 §4)
│   │       ├── index.ts          ← barrel export
│   │       ├── button.tsx        ← shadcn Button (cva variants + isLoading)
│   │       ├── input.tsx         ← shadcn Input
│   │       ├── badge.tsx         ← shadcn Badge
│   │       ├── dialog.tsx        ← shadcn Dialog (Radix → Modal)
│   │       ├── drawer.tsx        ← shadcn Drawer (vaul)
│   │       ├── table.tsx         ← shadcn Table
│   │       ├── skeleton.tsx      ← shadcn Skeleton
│   │       ├── sonner.tsx        ← shadcn Sonner (toast system)
│   │       ├── dropdown-menu.tsx ← shadcn DropdownMenu (Widget Perfil)
│   │       ├── tooltip.tsx       ← shadcn Tooltip
│   │       ├── label.tsx         ← shadcn Label
│   │       └── spinner.tsx       ← Spinner customizado (animate-spin)
│   └── routes/
│       ├── __root.tsx            ← Layout raiz (Application Shell)
│       ├── _auth.tsx             ← Layout autenticado (AuthGuard + sidebar + header)
│       ├── _auth.dashboard.tsx   ← Dashboard pós-login
│       └── login.tsx             ← Página de login (GuestGuard)
```

Para cada diretório vazio (ex: `modules/`), crie um arquivo `.gitkeep`.

> **Referência normativa:** DOC-UX-013 (Design System e Tokens Visuais) define os tokens, componentes e anti-patterns que o scaffold DEVE implementar.

### package.json (apps/web):

O package.json DEVE incluir React, Vite, TanStack Router/Query, Tailwind v4, motion, shadcn/ui stack e tipagens desde o scaffold. Sem elas, o código gerado pelo AGN-COD-WEB não compila. As dependências estão alinhadas com DOC-PADRAO-002 §3.5.

> **Nota:** Os pacotes `@radix-ui/*` e `vaul` são instalados automaticamente pelo `npx shadcn@latest add` no PASSO 4B. Não os liste manualmente aqui — o CLI resolve as versões corretas.

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
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "motion": "^12.0.0",
    "tailwindcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "sonner": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "@tanstack/react-router-devtools": "^1.0.0",
    "vite": "^6.0.0",
    "eslint": "^9.0.0"
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
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@routes': path.resolve(__dirname, 'src/routes'),
    },
  },
});
```

> **Nota:** Tailwind v4 usa Vite plugin nativo — **sem** `postcss.config.js` nem `tailwind.config.js`. Ver DOC-UX-013 §3.2.

### PASSO 4B: Inicialização shadcn/ui e Componentes

Após criar o `package.json`, `index.css` (com `@import "tailwindcss"` + `@theme`) e `vite.config.ts`, execute a inicialização shadcn:

**1. Crie `src/shared/lib/utils.ts`** com o helper `cn()`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**2. Crie `components.json`** na raiz de `apps/web/` (config do shadcn CLI):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@shared/ui",
    "utils": "@shared/lib/utils",
    "ui": "@shared/ui",
    "lib": "@shared/lib",
    "hooks": "@shared/hooks"
  }
}
```

> **Nota:** `rsc: false` porque o ECF usa React SPA (não Next.js/RSC). O style `new-york` é mais compacto e moderno.

**3. Instale componentes via CLI:**

```bash
cd apps/web && npx shadcn@latest add button input badge dialog drawer table skeleton sonner dropdown-menu tooltip label
```

Isso gera os arquivos em `src/shared/ui/` e instala automaticamente os `@radix-ui/*` necessários.

**4. Crie manualmente** os componentes não cobertos pelo shadcn:

- `src/shared/ui/spinner.tsx` — Spinner com `animate-spin`, `role="status"`, `aria-label="Carregando"`
- `src/shared/ui/index.ts` — barrel export de todos os componentes

**5. Customize o `button.tsx`** para adicionar prop `isLoading`:

O Button gerado pelo shadcn deve ser estendido com:
- Prop `isLoading?: boolean`
- Quando `isLoading=true`: exibir `<Spinner size="sm" />`, setar `aria-busy="true"`, desabilitar interação

**6. Configure o Sonner** no `__root.tsx`:

```tsx
import { Toaster } from '@shared/ui/sonner';

// No layout raiz:
<Toaster richColors position="top-right" />
```

> **Referência:** DOC-UX-013 §4.4 e §4.5 detalham os componentes obrigatórios e customizações.

## PASSO 5: Verificar pnpm-workspace.yaml

Leia `pnpm-workspace.yaml` na raiz do monorepo.

- Se **não existe**, crie:
  ```yaml
  packages:
    - "apps/*"
  ```
- Se **existe** mas não inclui `apps/*`, adicione a entrada

**NÃO** execute `pnpm install` automaticamente — avise o usuário que precisa executar manualmente.

## PASSO 6: Registrar Execution State

Após criar o scaffold, registre o estado de execução para que o `/action-plan` possa ler dados reais.

Para **cada módulo READY** existente em `docs/04_modules/mod-*/`:

1. Leia `.agents/execution-state/MOD-{NNN}.json` (se existir) ou crie um novo
2. Atualize (ou crie) a seção `scaffold`:

```json
{
  "module_id": "MOD-{NNN}",
  "module_path": "docs/04_modules/mod-{NNN}-{name}/",
  "last_updated": "{ISO_TIMESTAMP}",
  "scaffold": {
    "completed": true,
    "completed_at": "{ISO_TIMESTAMP}",
    "apps_created": ["api", "web"],
    "pnpm_workspace_updated": true
  }
}
```

- Se o argumento foi `api` → `apps_created: ["api"]`
- Se o argumento foi `web` → `apps_created: ["web"]`
- Se o argumento foi `all` → `apps_created: ["api", "web"]`
- Preserve seções existentes (`codegen`, `validations`, `tests`) se o arquivo já existir — faça merge, não sobrescreva

> **Nota:** O scaffold é global (afeta todos os módulos), então grave em todos os `MOD-{NNN}.json` existentes. Se nenhum existir ainda, crie apenas o arquivo do módulo raiz (MOD-000) como referência inicial.

## PASSO 7: Atualizar CHANGELOG dos Módulos

Para **cada módulo READY** cujo execution state foi atualizado no PASSO 6:

1. Localize o `CHANGELOG.md` do módulo
2. Adicione uma entrada na tabela "Histórico de Versões":

```
| {next_version} | {data_atual} | app-scaffold | Scaffold apps criado: {apps_created}. Workspace pnpm atualizado. |
```

> **Nota:** O scaffold é uma operação global — registre em todos os CHANGELOGs dos módulos afetados. A versão deve ser o próximo patch bump da última entrada existente.

## PASSO 8: Sincronizar Plano de Ação

Para **cada módulo READY** atualizado:

1. Verifique se o plano existe: `docs/04_modules/user-stories/plano/PLANO-ACAO-MOD-{NNN}.md`
2. Se **existe** → invoque `/action-plan {caminho_modulo} --update`
3. Se **não existe** → invoque `/action-plan {caminho_modulo}` (criação completa)

> **Nota:** O action-plan lê `.agents/execution-state/MOD-{NNN}.json` para dados precisos. A seção `scaffold` registrada no PASSO 6 será consumida aqui.

## PASSO 9: Relatório

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

### Execution State
- 📋 Registrado em .agents/execution-state/MOD-{NNN}.json ({N} módulos atualizados)

### CHANGELOG
- 📋 Atualizado em {N} módulos

### Plano de Ação
- 📋 Sincronizado em {N} módulos

### Próximos passos
- Execute `pnpm install` na raiz do monorepo
- Inicie o codegen com `/codegen` ou `/codegen-all`
```
