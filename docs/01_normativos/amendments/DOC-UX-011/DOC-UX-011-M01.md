> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-011-M01

- **Documento base:** [DOC-UX-011](../../DOC-UX-011__Application_Shell_e_Navegacao.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** Nenhum normativo define o comportamento quando a Sidebar aponta para rotas de módulos ainda não gerados (codegen pendente). O usuário clica em "Usuários" e recebe 404 ou tela branca. Necessário definir um pattern padrão "Coming Soon" para rotas não implementadas.
- **rastreia_para:** DOC-UX-011, UX-SHELL-001

---

## Detalhamento

### Nova seção: §8 — Rotas Pendentes (Coming Soon Pattern)

#### §8.1 Problema

A Sidebar (§3.2) renderiza itens de menu baseados no catálogo `sidebar-config.ts` e nos scopes do usuário (BR-005). Quando um módulo ainda não passou pelo codegen, a rota correspondente (ex: `/usuarios`, `/perfis`) não existe no routeTree, causando erro 404 ou tela branca.

#### §8.2 Regra

Quando o sidebar-config referencia uma rota cujo módulo **ainda não foi gerado**, o codegen do módulo que define o shell (MOD-001) DEVE criar um **route file placeholder** com o componente `ComingSoonPage`.

#### §8.3 Componente `ComingSoonPage`

O componente DEVE:

1. Ser um **shared component** em `apps/web/src/shared/ui/ComingSoonPage.tsx`
2. Renderizar:
   - Ícone ilustrativo (ex: `Construction` do Lucide)
   - Título: "Módulo em construção"
   - Subtexto: "Esta funcionalidade está sendo desenvolvida e estará disponível em breve."
   - Botão "Voltar ao Dashboard" → navega para `/dashboard`
3. Seguir o Design System (DOC-UX-013) — usar tokens de cor, tipografia e espaçamento padrão
4. NÃO usar layout inline — route file importa o componente shared (CA-07)

#### §8.4 Route Files Placeholder

Para cada rota referenciada no sidebar-config que ainda não tem módulo gerado:

```typescript
// apps/web/src/routes/_auth.{rota}.tsx
import { createRoute } from '@tanstack/react-router';
import { Route as authRoute } from './_auth';
import { ComingSoonPage } from '@shared/ui/ComingSoonPage';

export const Route = createRoute({
  path: '/{rota}',
  getParentRoute: () => authRoute,
  component: ComingSoonPage,
});
```

#### §8.5 Ciclo de Vida

1. **Criação:** Quando o shell (MOD-001) é gerado e sidebar-config referencia rotas de módulos pendentes
2. **Substituição:** Quando o módulo alvo é gerado via codegen, o route file placeholder é **substituído** pelo route file real que importa a Page Component do módulo
3. **Detecção:** O codegen DEVE verificar se existe um route file placeholder antes de criar o route file real, para evitar conflito

#### §8.6 Acceptance Criterion

- **CA-09:** Toda rota referenciada no sidebar-config DEVE ter um route file correspondente. Se o módulo da rota não foi gerado, o route file DEVE usar `ComingSoonPage`. Rotas sem route file (404 no menu) são **PROIBIDAS**.

---

## Impacto nos Pilares

- **Pilares afetados:** UX (novo componente shared), FR (codegen deve gerar placeholders)
- **Ação requerida:**
  1. Criar componente `ComingSoonPage` em `@shared/ui/`
  2. Codegen MOD-001 deve gerar route files placeholder para rotas pendentes
  3. Codegen de módulos subsequentes deve substituir placeholders por componentes reais

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-25
> **Versão base após merge:** DOC-UX-011 v1.3.0
> **Alterações aplicadas:** Nova §8 (Rotas Pendentes / Coming Soon Pattern) + CA-09 adicionado à §7
