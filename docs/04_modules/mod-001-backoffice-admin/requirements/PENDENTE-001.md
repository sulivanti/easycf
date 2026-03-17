> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-16 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) |

# PENDENTE-001 — Questões Abertas do Backoffice Admin

---

## PENDENTE-001 — Estratégia de Cache de auth_me entre Shell e Dashboard

- **Questão:** O Shell (UX-SHELL-001) e o Dashboard (UX-DASH-001) ambos chamam `GET /auth/me` ao montar. Devem compartilhar o resultado via React Context/cache ou cada componente faz sua própria chamada?
- **Impacto:** Performance (chamada duplicada), consistência (dados sempre frescos vs. stale), complexidade (cache management)
- **Opções:**
  - **Opção A:** Cada componente chama auth_me independentemente — simplicidade máxima, 2 requisições no carregamento inicial
  - **Opção B:** Shell chama auth_me e injeta via React Context — 1 requisição, mas acoplamento Shell↔Dashboard
  - **Opção C:** React Query/SWR com cache de 30s — 1 requisição efetiva, cache automático, sem acoplamento
- **Recomendação:** Opção C (React Query/SWR) — balance entre performance e simplicidade. O cache TTL curto (30s) garante dados frescos sem duplicar chamadas. Se não houver lib de cache no projeto, Opção A é aceitável para MVP.

---

## PENDENTE-002 — Comportamento do Shell quando auth_me retorna scopes vazios

- **Questão:** Se auth_me retorna `scopes=[]`, o Dashboard mostra "Nenhum módulo disponível". Mas a Sidebar também fica completamente vazia — apenas o Header com ProfileWidget é visível. Isso é aceitável do ponto de vista UX ou devemos exibir um estado vazio explicativo na Sidebar?
- **Impacto:** UX (primeira impressão do admin sem permissões), suporte (chamados por "tela em branco")
- **Opções:**
  - **Opção A:** Sidebar vazia é aceitável — o Dashboard já explica a situação
  - **Opção B:** Sidebar exibe mensagem "Nenhum módulo configurado" com ícone informativo
- **Recomendação:** Opção B — melhora a UX sem complexidade adicional. Decisão pode ser tomada durante implementação.
