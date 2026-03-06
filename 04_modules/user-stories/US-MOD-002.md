# US-MOD-002 — Logout e Kill-Switch de Sessões
Status: para aprovação
Módulo Destino: MOD-000-Foundation

## Contexto
Usuários precisam encerrar suas sessões de forma segura, inclusive remotamente a partir de outros dispositivos. O sistema precisa de um mecanismo de revogação em banco para não depender apenas da expiração do JWT.

## Solução (Negócio)
Como usuário autenticado, quero poder fazer logout da sessão atual e também encerrar sessões abertas em outros dispositivos, garantindo que tokens comprometidos sejam invalidados imediatamente.

## O que foi implementado (evidência no código)
- POST /api/v1/auth/logout — revoga a sessão atual no banco com isRevoked=true.
- GET /api/v1/auth/sessions — lista sessões ativas do usuário.
- DELETE /api/v1/auth/sessions/:sessionId — Kill-Switch: revoga sessão específica.
- DELETE /api/v1/auth/sessions — Kill-Switch Global: revoga todas as sessões.
- POST /api/v1/auth/refresh — renova access_token via refresh_token nos cookies.
- Eventos de domínio: session.revoked, session.revoked_by_admin.

## Critérios de Aceite
```gherkin
Funcionalidade: Gerenciamento de Sessões e Logout
  Cenário: Logout da sessão atual
    Dado que o usuário está autenticado
    Quando ele chama POST /auth/logout
    Então a sessão deve ser marcada como revogada no banco
    E o middleware deve rejeitar tokens que referenciem esta sessão
  Cenário: Kill-Switch de sessão específica
    Dado que o usuário tem múltiplas sessões ativas
    Quando ele chama DELETE /auth/sessions/:sessionId
    Então a sessão especificada deve ser revogada
    E outras sessões permanecem ativas
  Cenário: Kill-Switch global
    Dado que o usuário suspeita de comprometimento
    Quando ele chama DELETE /auth/sessions
    Então TODAS as suas sessões devem ser revogadas imediatamente
    E qualquer token existente referente a ele deve ser invalidado
  Cenário: Renovação do access_token
    Dado que o access_token expirou mas a sessão é válida
    Quando o frontend chama POST /auth/refresh com o cookie refreshToken
    Então deve receber um novo access_token válido
```

## Regras Críticas
1. A validação de sessão deve ser feita NO BANCO, não apenas pela expiração do JWT.
2. Kill-Switch deve ser instantâneo e atômico.
