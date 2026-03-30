/**
 * @contract FR-001, FR-002, FR-003, UX-AUTH-001, BR-001, BR-002, BR-003, BR-007
 * @visual 01-login-spec-v3, Penpot 01-Login
 *
 * Split-screen login: branding panel (604px, dark gradient) + form panel (#F5F5F3).
 * 3 painéis: login, forgot-password, reset-password (transições client-only).
 * Visual Penpot-validated: Plus Jakarta Sans, cores SPEC-THEME-001.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { useLogin } from '../hooks/use-login';
import { useForgotPassword } from '../hooks/use-forgot-password';
import { useResetPassword } from '../hooks/use-reset-password';
import { ApiError } from '../api/api-client';
import { emitClientOnly } from '../api/telemetry';

type Panel = 'login' | 'forgot-password' | 'reset-password';

// ---------------------------------------------------------------------------
// Branding Panel (left, 604px) — Penpot: dark gradient + tagline + pills
// ---------------------------------------------------------------------------

function BrandingPanel() {
  return (
    <div
      className="relative flex w-[604px] shrink-0 flex-col justify-between p-14"
      style={{
        background: 'linear-gradient(to bottom, #1a2318, #111111)',
      }}
    >
      {/* Logo + brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex size-11 items-center justify-center rounded-[12px]"
          style={{
            background: 'linear-gradient(135deg, #F5A04E, #F58C32)',
          }}
        >
          <span className="font-display text-[18px] font-extrabold italic text-white">A1</span>
        </div>
        <div>
          <div className="font-display text-[15px] font-bold text-white">Grupo A1</div>
          <div className="font-display text-[10px] font-medium uppercase tracking-[1.6px] text-white/35">
            PORTAL INTERNO
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div>
        <h1 className="font-display text-[42px] font-extrabold italic leading-[1.12] tracking-[-1.2px] text-white">
          Soluções
          <br />
          para a<br />
          indústria.
        </h1>
        <div className="mt-6 h-1 w-14 rounded-full bg-[#F58C32]" />
        <p className="mt-6 max-w-[380px] font-display text-[14px] leading-[1.64] text-white/45">
          Plataforma de gestão de processos, aprovações e integração com Protheus — desenvolvida
          para o Grupo A1.
        </p>
      </div>

      {/* Pills + copyright */}
      <div>
        <div className="mb-3 font-display text-[9px] font-bold uppercase tracking-[1.4px] text-white/25">
          UNIDADES DO GRUPO
        </div>
        <div className="flex gap-4">
          {['Engenharia', 'Industrial', 'Energia', 'Agro'].map((name) => (
            <span
              key={name}
              className="rounded-full border border-white/12 px-3 py-1.5 font-display text-[12px] font-medium text-white/50"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-6 font-display text-[11px] text-white/20">
          © 2026 Grupo A1 · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold tracking-[-0.5px] text-a1-text-primary">
          Bem-vindo de volta
        </h2>
        <p className="mt-1 font-display text-[14px] text-a1-text-auxiliary">
          Acesse o portal do Grupo A1
        </p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary">
          E-MAIL CORPORATIVO
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 rounded bg-a1-text-placeholder/40" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="seu@grupoa1.com.br"
            className="h-12 rounded-[10px] border-a1-border pl-11 font-display text-[14px]"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary">
            SENHA
          </label>
          <button
            type="button"
            className="font-display text-[12px] font-semibold text-[#F58C32] hover:underline"
            onClick={() => {
              emitClientOnly({ screenId: 'UX-AUTH-001', actionId: 'navigate_to_forgot' });
              onForgot();
            }}
          >
            Esqueci minha senha
          </button>
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 rounded bg-a1-text-placeholder/40" />
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-12 rounded-[10px] border-a1-border pl-11 pr-11 font-display text-[14px]"
          />
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-a1-text-hint"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Alternar visibilidade"
          >
            {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </div>
      </div>

      {/* Remember me */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-a1-border accent-primary-600"
        />
        <span className="font-display text-[13px] text-a1-text-tertiary">Manter conectado</span>
      </label>

      {/* Submit */}
      <Button
        type="submit"
        className="h-[50px] w-full rounded-[10px] font-display text-[15px] font-bold"
        isLoading={login.isPending}
      >
        Entrar
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-a1-border" />
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.8px] text-a1-text-hint">
          OU CONTINUE COM
        </span>
        <div className="h-px flex-1 bg-a1-border" />
      </div>

      {/* Microsoft SSO */}
      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-[10px] border border-a1-border bg-white font-display text-[14px] font-semibold text-a1-text-secondary transition-colors hover:bg-neutral-50"
      >
        {/* MS logo squares */}
        <div className="grid size-4 grid-cols-2 gap-0.5">
          <div className="size-[7px] bg-[#F25022]" />
          <div className="size-[7px] bg-[#7FBA00]" />
          <div className="size-[7px] bg-[#00A4EF]" />
          <div className="size-[7px] bg-[#FFB900]" />
        </div>
        Entrar com Microsoft
      </button>

      {/* First access */}
      <p className="text-center font-display text-[13px] text-a1-text-auxiliary">
        Primeiro acesso?{' '}
        <span className="font-bold text-a1-text-secondary">Solicite ao administrador</span>
      </p>
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold tracking-[-0.5px] text-a1-text-primary">
          Recuperar Senha
        </h2>
        <p className="mt-1 font-display text-[14px] text-a1-text-auxiliary">
          Informe seu e-mail para receber o link de redefinição.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary">
          E-MAIL CORPORATIVO
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="seu@grupoa1.com.br"
          className="h-12 rounded-[10px] border-a1-border font-display text-[14px]"
        />
      </div>

      <Button
        type="submit"
        className="h-[50px] w-full rounded-[10px] font-display text-[15px] font-bold"
        isLoading={forgot.isPending}
      >
        Enviar link
      </Button>

      <button
        type="button"
        className="mx-auto block font-display text-[13px] font-semibold text-[#F58C32] hover:underline"
        onClick={() => {
          emitClientOnly({ screenId: 'UX-AUTH-001', actionId: 'navigate_to_login' });
          onBack();
        }}
      >
        Voltar ao login
      </button>
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold tracking-[-0.5px] text-a1-text-primary">
          Redefinir Senha
        </h2>
        <p className="mt-1 font-display text-[14px] text-a1-text-auxiliary">
          Crie uma nova senha para acessar o portal.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary">
          NOVA SENHA
        </label>
        <div className="relative">
          <Input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-12 rounded-[10px] border-a1-border pr-11 font-display text-[14px]"
          />
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-a1-text-hint"
            onClick={() => setShowNew(!showNew)}
            aria-label="Alternar visibilidade"
          >
            {showNew ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-display text-[11px] font-bold uppercase tracking-[0.8px] text-a1-text-secondary">
          CONFIRMAR NOVA SENHA
        </label>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-12 rounded-[10px] border-a1-border pr-11 font-display text-[14px]"
          />
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-a1-text-hint"
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label="Alternar visibilidade"
          >
            {showConfirm ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </div>
        {confirmPassword && !passwordsMatch && (
          <p className="font-display text-[12px] text-danger-600">As senhas não coincidem.</p>
        )}
      </div>

      <Button
        type="submit"
        className="h-[50px] w-full rounded-[10px] font-display text-[15px] font-bold"
        disabled={!passwordsMatch}
        isLoading={reset.isPending}
      >
        Redefinir
      </Button>

      <button
        type="button"
        className="mx-auto block font-display text-[13px] font-semibold text-[#F58C32] hover:underline"
        onClick={onBack}
      >
        Voltar ao login
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// LoginPage (main export) — Split-screen per Penpot 01-Login
// ---------------------------------------------------------------------------

export function LoginPage() {
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [panel, setPanel] = useState<Panel>(tokenFromUrl ? 'reset-password' : 'login');

  return (
    <div className="flex min-h-screen font-display">
      {/* Branding panel (left, 604px) */}
      <BrandingPanel />

      {/* Form panel (right, flex-1, #F5F5F3) */}
      <div className="flex flex-1 items-center justify-center bg-bg-page">
        <div className="w-[420px] rounded-2xl border border-a1-border bg-white p-10">
          {panel === 'login' && <LoginPanel onForgot={() => setPanel('forgot-password')} />}
          {panel === 'forgot-password' && (
            <ForgotPasswordPanel onBack={() => setPanel('login')} />
          )}
          {panel === 'reset-password' && (
            <ResetPasswordPanel token={tokenFromUrl} onBack={() => setPanel('login')} />
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 right-0 flex w-[calc(100%-604px)] items-center justify-center gap-6">
          <span className="flex items-center gap-1.5 font-display text-[12px] font-medium text-a1-text-hint">
            <span className="size-3.5 rounded bg-a1-text-hint/30" />
            Conexão segura (TLS)
          </span>
          <span className="font-display text-[12px] font-medium text-a1-text-hint">
            Suporte
          </span>
          <span className="size-3.5 rounded bg-a1-text-hint/30" />
        </div>
      </div>
    </div>
  );
}
