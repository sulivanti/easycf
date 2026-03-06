# US-MOD-001 — Autenticação Nativa com E-mail e Senha
Status: aprovada
Módulo Destino: MOD-000-Foundation

## Contexto
O sistema precisa de um mecanismo de login seguro para que usuários se autentiquem com e-mail e senha. Sem isso, nenhuma rota privada pode ser acessada.

## Solução (Negócio)
Como usuário do sistema, quero fazer login com meu e-mail e senha para que eu receba um token de sessão e possa acessar as funcionalidades protegidas.

## O que foi implementado (evidência no código)
POST /api/v1/auth/login — autenticação com email/password, retorna access_token, refresh_token, dados do usuário.
Suporte a remember_me (sessão de 12h ou 30 dias).
device_fp para fingerprint do dispositivo.
Cookies httpOnly para accessToken e refreshToken.
Rate limiting: 10 tentativas / 15 min por IP (429 com Retry-After).
Desvio automático para fluxo MFA quando mfa_secret está configurado.
Eventos de domínio: session.created. Auditoria: auth.login.success/failure/blocked.
Page LoginPage.tsx no frontend.

## Critérios de Aceite
gherkin
Funcionalidade: Login com e-mail e senha
  Cenário: Login bem-sucedido sem MFA
    Dado que o usuário possui conta ACTIVE com credenciais válidas
    Quando ele envia POST /auth/login com email e password corretos
    Então deve receber 200 com access_token, refresh_token e dados do usuário
    E os tokens devem ser setados em cookies httpOnly
  Cenário: Credenciais inválidas
    Dado que o usuário enviou email ou senha incorretos
    Quando o sistema recebe a requisição
    Então deve retornar 401 com mensagem genérica (sem revelar qual campo está errado)
    E deve registrar auditoria auth.login.failure sem actorId
  Cenário: Conta bloqueada
    Dado que a conta do usuário está com status BLOCKED
    Quando ele tenta fazer login
    Então deve retornar 403 com detalhe informando o bloqueio
    E deve registrar auditoria auth.login.blocked
  Cenário: Rate Limit excedido
    Dado que o IP fez mais de 10 tentativas em 15 minutos
    Quando uma nova tentativa é feita
    Então deve retornar 429 (RFC 9457) com retry_after em segundos

## Regras Críticas
Resposta de erro SEMPRE genérica — nunca revelar se o email existe (user enumeration prevention).
Rate Limit de 10 tentativas / 15 min por IP é obrigatório.
Desvio automático para MFA se mfa_secret presente — emite temp_token (TTL 5min).
Auditoria obrigatória em todos os desfechos (success, failure, blocked).
