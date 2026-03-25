/**
 * @contract UX-001, FR-001, FR-004, FR-015
 * Unified login page — 4 panels on single /login route:
 * login, mfa, forgot-password, reset-password.
 * States: Loading (spinner on button via isLoading), Error (inline + toast RFC 9457).
 * Uses @shared/ui/ components + Tailwind (PKG-COD-001 §3.5).
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import {
  useLogin,
  useMfaVerify,
  useForgotPassword,
  useResetPassword,
} from '../../hooks/use-auth.js';
import { isMfaRequired } from '../../types/auth.types.js';

type Panel = 'login' | 'mfa' | 'forgot-password' | 'reset-password';

function ErrorAlert({ error }: { error: Error | null }) {
  if (!error) return null;
  const correlationId =
    error && 'correlationId' in error
      ? (error as { correlationId?: string }).correlationId
      : undefined;

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <p>{error.message}</p>
      {correlationId && (
        <p className="mt-1 text-xs text-muted-foreground">
          Correlation ID:{' '}
          <button
            type="button"
            className="font-mono underline"
            onClick={() => {
              navigator.clipboard.writeText(correlationId);
              toast.info('Correlation ID copiado');
            }}
          >
            {correlationId}
          </button>
        </p>
      )}
    </div>
  );
}

// -- Login Panel --

function LoginPanel({
  onMfaRequired,
  onForgotClick,
  onSuccess,
}: {
  onMfaRequired: (tempToken: string) => void;
  onForgotClick: () => void;
  onSuccess: () => void;
}) {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const result = await login({ email, password, remember_me: rememberMe });
      if (isMfaRequired(result)) {
        onMfaRequired(result.temp_token);
      } else {
        toast.success('Login realizado com sucesso.');
        onSuccess();
      }
    } catch {
      // error state handled by hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
      <ErrorAlert error={error} />

      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="remember-me" className="text-sm font-normal">
          Manter conectado
        </Label>
      </div>

      <Button type="submit" isLoading={loading} className="w-full">
        Entrar
      </Button>

      <Button type="button" variant="link" className="w-full" onClick={onForgotClick}>
        Esqueci a senha
      </Button>
    </form>
  );
}

// -- MFA Panel --

function MfaPanel({ tempToken, onSuccess }: { tempToken: string; onSuccess: () => void }) {
  const { verify, loading, error } = useMfaVerify();
  const [code, setCode] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await verify({ code, temp_token: tempToken });
      toast.success('Login realizado com sucesso.');
      onSuccess();
    } catch {
      // error state handled by hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Verificar código</h1>
      <p className="text-sm text-muted-foreground">Digite o código do seu autenticador.</p>
      <ErrorAlert error={error} />

      <div className="space-y-2">
        <Label htmlFor="mfa-code">Código TOTP</Label>
        <Input
          id="mfa-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="one-time-code"
          placeholder="000000"
        />
      </div>

      <Button type="submit" isLoading={loading} className="w-full">
        Verificar código
      </Button>
    </form>
  );
}

// -- Forgot Password Panel --

function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  const { forgotPassword, loading, submitted } = useForgotPassword();
  const [email, setEmail] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await forgotPassword({ email });
  }

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">E-mail enviado</h1>
        <p className="text-sm text-muted-foreground">
          Se o e-mail estiver cadastrado, você receberá um link em breve.
        </p>
        <Button variant="outline" onClick={onBack} className="w-full">
          Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>

      <div className="space-y-2">
        <Label htmlFor="forgot-email">E-mail</Label>
        <Input
          id="forgot-email"
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </div>

      <Button type="submit" isLoading={loading} className="w-full">
        Enviar link
      </Button>

      <Button type="button" variant="ghost" onClick={onBack} className="w-full">
        Voltar ao login
      </Button>
    </form>
  );
}

// -- Reset Password Panel --

function ResetPasswordPanel({ token, onBack }: { token: string; onBack: () => void }) {
  const { resetPassword, loading, error, success } = useResetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError('');
    if (newPassword !== confirmPassword) {
      setValidationError('As senhas não coincidem.');
      return;
    }
    try {
      await resetPassword({ token, new_password: newPassword });
      toast.success('Senha redefinida com sucesso. Faça login.');
    } catch {
      // error state handled by hook
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Senha redefinida</h1>
        <p className="text-sm text-muted-foreground">Senha redefinida com sucesso. Faça login.</p>
        <Button variant="outline" onClick={onBack} className="w-full">
          Ir para login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Redefinir senha</h1>
      <ErrorAlert error={error} />
      {validationError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p>{validationError}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reset-password">Nova senha</Label>
        <Input
          id="reset-password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-confirm">Confirmar senha</Label>
        <Input
          id="reset-confirm"
          type="password"
          required
          minLength={8}
          maxLength={128}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" isLoading={loading} className="w-full">
        Redefinir senha
      </Button>
    </form>
  );
}

// -- Main LoginPage --

export function LoginPage() {
  const search = useSearch({ strict: false }) as { token?: string };
  const navigate = useNavigate();
  const resetToken = search.token ?? null;
  const [panel, setPanel] = useState<Panel>(resetToken ? 'reset-password' : 'login');
  const [mfaTempToken, setMfaTempToken] = useState('');

  function handleLoginSuccess() {
    // Full reload to re-read auth tokens from localStorage into router context
    window.location.href = '/';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        {panel === 'login' && (
          <LoginPanel
            onMfaRequired={(token) => {
              setMfaTempToken(token);
              setPanel('mfa');
            }}
            onForgotClick={() => setPanel('forgot-password')}
            onSuccess={handleLoginSuccess}
          />
        )}
        {panel === 'mfa' && <MfaPanel tempToken={mfaTempToken} onSuccess={handleLoginSuccess} />}
        {panel === 'forgot-password' && <ForgotPasswordPanel onBack={() => setPanel('login')} />}
        {panel === 'reset-password' && (
          <ResetPasswordPanel
            token={resetToken ?? ''}
            onBack={() => {
              navigate({ to: '/login', search: {} });
              setPanel('login');
            }}
          />
        )}
      </div>
    </div>
  );
}

export default LoginPage;
