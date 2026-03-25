> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-011-M03

- **Documento base:** [DOC-UX-011](../../DOC-UX-011__Application_Shell_e_Navegacao.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura + UX
- **Motivação:** O §6.1 define que o Widget de Perfil DEVE ter botão "Sair" que consome a rota de logout, mas não exige confirmação antes da execução. Atualmente o logout é disparado diretamente ao clicar "Sair", sem diálogo de confirmação — causando logouts acidentais, especialmente em dispositivos móveis. Necessário adicionar requisito de LogoutConfirmDialog como padrão obrigatório para ações destrutivas de sessão.
- **rastreia_para:** DOC-UX-011 §6.1, spec-auth-ui-components (REQ-LC-001 a REQ-LC-010)

---

## Detalhamento

### Alteração na §6.1 — Regras do Widget (item 2, sub-item "Sair")

**Texto atual (linha 197):**

> Botão de "Sair" (Logout), que DEVE consumir a rota de logout (invalidando sessões ativas).

**Texto proposto:**

> Botão de "Sair" (Logout), que DEVE abrir um **LogoutConfirmDialog** antes de consumir a rota de logout (invalidando sessões ativas). O logout NÃO DEVE ser executado diretamente — a confirmação explícita do usuário é obrigatória.

### Nova sub-seção: §6.2 — LogoutConfirmDialog

#### §6.2.1 Regra

O Widget de Perfil (§6.1) DEVE exibir um diálogo de confirmação modal antes de executar a ação de logout. A execução direta (sem confirmação) é **PROIBIDA**.

#### §6.2.2 Requisitos do Dialog

1. **Acionamento:** O botão "Sair" do dropdown (§6.1 item 2) DEVE abrir o dialog ao invés de executar logout diretamente
2. **Título:** "Confirmar saída"
3. **Mensagem:** "Tem certeza que deseja sair? Sua sessão será encerrada."
4. **Botões:**
   - "Cancelar" (variant `outline`) — fecha o dialog sem efeito
   - "Sair" (variant `destructive`) — executa a mutation de logout
5. **Loading state:** Durante a execução da mutation, o botão "Sair" DEVE exibir spinner + texto "Saindo..." e ambos botões DEVEM estar desabilitados (prevenção de double-click)
6. **Escape:** O dialog DEVE fechar ao pressionar Escape (comportamento padrão do componente `Dialog`)
7. **Componentes:** DEVE usar `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `Button` de `@shared/ui/` (CON-002 do projeto)

#### §6.2.3 Telemetria

O LogoutConfirmDialog DEVE emitir UIActionEnvelope (DOC-ARC-003) com:
- `screenId`: `UX-SHELL-001`
- `actionId`: `confirm_logout`

#### §6.2.4 Localização do Componente

O componente DEVE ser exportado de `apps/web/src/modules/backoffice-admin/components/LogoutConfirmDialog.tsx` e composto dentro do ProfileWidget.

#### §6.2.5 Especificação Técnica Detalhada

Os contratos completos (props, acceptance criteria, edge cases, estratégia de testes) estão formalizados em:

> [`docs/03_especificacoes/spec-auth-ui-components.md`](../../../03_especificacoes/spec-auth-ui-components.md) — seção "LogoutConfirmDialog" (REQ-LC-001 a REQ-LC-010, AC-007 a AC-010)

---

## Impacto nos Pilares

- **Pilares afetados:** UX (novo componente no shell), FR (ProfileWidget deve compor o dialog)
- **Ação requerida:**
  1. Criar componente `LogoutConfirmDialog` em `apps/web/src/modules/backoffice-admin/components/`
  2. Alterar `ProfileWidget.tsx` para abrir o dialog ao invés de executar `logout.mutate()` diretamente
  3. Testes unitários para o novo componente (Vitest + RTL)

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-25
> **Versão base após merge:** DOC-UX-011 v1.4.0
> **Alterações aplicadas:** §6.1 atualizada (botão Sair abre dialog), nova §6.2 LogoutConfirmDialog com 5 sub-seções (regra, requisitos, telemetria, localização, spec)
