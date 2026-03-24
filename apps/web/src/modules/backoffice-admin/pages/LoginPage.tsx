/**
 * @contract FR-001, FR-002, FR-003, UX-AUTH-001, BR-001, BR-002, BR-003, BR-007
 *
 * Tela de autenticação com 3 painéis: login, forgot-password, reset-password.
 * - Transições client-only sem reload (BR-007)
 * - Token reset via ?token= na URL → painel reset-password
 * - isLoading obrigatório em todos os submits (BR-003)
 * - Mensagens genéricas de erro (BR-001, BR-002)
 * - MFA fallback defensivo (PENDENTE-004 Opção B)
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { useLogin } from '../hooks/use-login';
import { useForgotPassword } from '../hooks/use-forgot-password';
import { useResetPassword } from '../hooks/use-reset-password';
import { ApiError } from '../api/api-client';
import { emitClientOnly } from '../api/telemetry';

type Panel = 'login' | 'forgot-password' | 'reset-password';

// ---------------------------------------------------------------------------
// LoginPanel
// ---------------------------------------------------------------------------

function LoginPanel({ onForgot }: { onForgot: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const login = useLogin();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password, remember_me: rememberMe },
      {
        onSuccess: ({ data, correlationId }) => {
          if (data.mfa_required) {
            toast.info(
              'Autenticação multifator requerida. Contate o administrador para configuração.',
              { description: `ID: ${correlationId}` },
            );
            return;
          }
          navigate({ to: '/dashboard' });
        },
        onError: (error) => {
          if (!(error instanceof ApiError)) return;
          const cid = error.correlationId;

          if (error.status === 401) {
            toast.error('E-mail ou senha inválidos.', { description: `ID: ${cid}` });
          } else if (error.status === 403) {
            toast.error('Sua conta está bloqueada. Entre em contato com o suporte.', {
              description: `ID: ${cid}`,
            });
          } else if (error.status === 429) {
            const retryAfter = error.problem.extensions?.retry_after;
            toast.error(`Muitas tentativas. Tente novamente em ${retryAfter ?? '?'} segundos.`, {
              description: `ID: ${cid}`,
            });
          } else {
            toast.error('Erro ao processar. Tente novamente.', { description: `ID: ${cid}` });
          }
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-center text-2xl font-bold">Entrar</h1>

      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Alternar visibilidade"
          >
            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-input"
          />
          Lembrar-me
        </label>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-sm"
          onClick={() => {
            emitClientOnly({ screenId: 'UX-AUTH-001', actionId: 'navigate_to_forgot' });
            onForgot();
          }}
        >
          Esqueci minha senha
        </Button>
      </div>

      <Button type="submit" className="w-full" isLoading={login.isPending}>
        Entrar
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// ForgotPasswordPanel
// ---------------------------------------------------------------------------

function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const forgot = useForgotPassword();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    forgot.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success('Se o e-mail estiver cadastrado, você receberá um link em breve.');
        },
        onError: () => {
          toast.success('Se o e-mail estiver cadastrado, você receberá um link em breve.');
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Recuperar Senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe seu e-mail para receber o link de redefinição.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="forgot-email">E-mail</Label>
        <Input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </div>

      <Button type="submit" className="w-full" isLoading={forgot.isPending}>
        Enviar link
      </Button>

      <Button
        type="button"
        variant="link"
        className="mx-auto block text-sm"
        onClick={() => {
          emitClientOnly({ screenId: 'UX-AUTH-001', actionId: 'navigate_to_login' });
          onBack();
        }}
      >
        Voltar ao login
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// ResetPasswordPanel
// ---------------------------------------------------------------------------

function ResetPasswordPanel({ token, onBack }: { token: string; onBack: () => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const reset = useResetPassword();

  const passwordsMatch = newPassword === confirmPassword;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passwordsMatch) return;

    reset.mutate(
      { token, new_password: newPassword, confirm_password: confirmPassword },
      {
        onSuccess: () => {
          toast.success('Senha redefinida com sucesso! Faça login com sua nova senha.');
          window.history.replaceState(null, '', '/login');
          onBack();
        },
        onError: (error) => {
          if (error instanceof ApiError && (error.status === 400 || error.status === 422)) {
            toast.error('Link inválido ou expirado. Solicite um novo link de recuperação.', {
              description: `ID: ${error.correlationId}`,
            });
          } else if (error instanceof ApiError) {
            toast.error('Erro ao processar. Tente novamente.', {
              description: `ID: ${error.correlationId}`,
            });
          }
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-center text-2xl font-bold">Redefinir Senha</h1>

      <div className="space-y-2">
        <Label htmlFor="reset-new-password">Nova senha</Label>
        <div className="relative">
          <Input
            id="reset-new-password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowNew(!showNew)}
            aria-label="Alternar visibilidade"
          >
            {showNew ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-confirm-password">Confirmar nova senha</Label>
        <div className="relative">
          <Input
            id="reset-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label="Alternar visibilidade"
          >
            {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-destructive">As senhas não coincidem.</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!passwordsMatch}
        isLoading={reset.isPending}
      >
        Redefinir
      </Button>

      <Button type="button" variant="link" className="mx-auto block text-sm" onClick={onBack}>
        Voltar ao login
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// LoginPage (main export)
// ---------------------------------------------------------------------------

export function LoginPage() {
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [panel, setPanel] = useState<Panel>(tokenFromUrl ? 'reset-password' : 'login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-6 text-center">
          <span className="text-xl font-bold text-primary">EasyCode</span>
        </div>

        {panel === 'login' && <LoginPanel onForgot={() => setPanel('forgot-password')} />}
        {panel === 'forgot-password' && <ForgotPasswordPanel onBack={() => setPanel('login')} />}
        {panel === 'reset-password' && (
          <ResetPasswordPanel token={tokenFromUrl} onBack={() => setPanel('login')} />
        )}
      </div>
    </div>
  );
}
