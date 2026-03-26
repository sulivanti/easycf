/**
 * @contract UX-001, FR-001, FR-004, FR-015
 * Unified login page — 4 panels on single /login route:
 * login, mfa, forgot-password, reset-password.
 * States: Loading (spinner on button via isLoading), Error (inline + toast RFC 9457).
 * Design: Paper split-screen layout with Grupo A1 branding.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import {
  useLogin,
  useMfaVerify,
  useForgotPassword,
  useResetPassword,
} from '../../hooks/use-auth.js';
import { isMfaRequired } from '../../types/auth.types.js';

type Panel = 'login' | 'mfa' | 'forgot-password' | 'reset-password';

// -- SVG Icons --

function EnvelopeIcon({ className = 'shrink-0' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <path d="M2 5.5l6 3.5 6-3.5" />
    </svg>
  );
}

function LockIcon({ color = '#AAAAAA', className = 'shrink-0' }: { color?: string; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="7" width="10" height="7" rx="2" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function EyeIcon({ className = 'shrink-0' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

function EyeOffIcon({ className = 'shrink-0' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M1 8s2.5-5 7-5c1.4 0 2.6.4 3.6 1M15 8s-2.5 5-7 5c-1.4 0-2.6-.4-3.6-1" />
      <path d="M2 2l12 12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M7 1L2 3.5v4C2 10 4.5 12.5 7 13c2.5-.5 5-3 5-5.5v-4L7 1z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="7" cy="7" r="5" />
      <path d="M7 5.5a1.5 1.5 0 0 1 0 3M7 10h.01" />
    </svg>
  );
}

function ShieldCodeIcon({ className = 'shrink-0' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8 1L3 3.5v4C3 10 5.5 13 8 14c2.5-1 5-4 5-6.5v-4L8 1z" />
      <path d="M6.5 7l1.5 1.5L11 6" />
    </svg>
  );
}

function KeyIcon({ className = 'shrink-0' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="5.5" cy="10.5" r="3" />
      <path d="M8 8l5-5M11 3l2 2" />
    </svg>
  );
}

// -- A1 Logo --

function A1Logo() {
  return (
    <div className="flex items-center justify-center shrink-0 rounded-[7px] bg-[#F58C32] size-9">
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <text x="0" y="15" fontFamily="Arial" fontSize="16" fontWeight="900" fontStyle="italic" fill="#FFFFFF">
          <tspan>A</tspan>
          <tspan fill="#111111">1</tspan>
        </text>
      </svg>
    </div>
  );
}

// -- Styled Input wrapper --

function StyledInput({
  id,
  type = 'text',
  icon,
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  maxLength,
  inputMode,
  pattern,
  isFocused,
  rightElement,
}: {
  id: string;
  type?: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  inputMode?: 'numeric' | 'text';
  pattern?: string;
  isFocused?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className={`flex items-center h-12 rounded-lg px-3.5 gap-2.5 bg-[#F5F5F3] [border-width:1.5px] border-solid ${isFocused ? 'border-[#F58C32]' : 'border-[#E8E8E6]'} transition-colors focus-within:border-[#F58C32]`}>
      {icon}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
        className="flex-1 bg-transparent font-display text-sm text-[#111111] placeholder:text-[#CCCCCC] outline-none"
      />
      {rightElement}
    </div>
  );
}

// -- Styled Label --

function StyledLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="uppercase tracking-[0.6px] text-[#333333] font-display font-semibold text-xs">
      {children}
    </label>
  );
}

// -- Error Alert (Paper design) --

function ErrorAlert({ error }: { error: Error | null }) {
  if (!error) return null;
  const correlationId =
    error && 'correlationId' in error
      ? (error as { correlationId?: string }).correlationId
      : undefined;

  return (
    <div role="alert" className="flex items-start rounded-[7px] py-3 px-3.5 gap-2.5 bg-[#F5F5F3] border border-solid border-[#E8E8E6]">
      <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 mt-px rounded-full bg-[#111111]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <path d="M5 2v3M5 7.5h.01" />
        </svg>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="text-[#111111] font-display font-semibold text-[13px] leading-4">
          {error.message}
        </div>
        {correlationId && (
          <button
            type="button"
            className="text-[#888888] font-display text-xs leading-4 text-left hover:underline"
            onClick={() => {
              navigator.clipboard.writeText(correlationId);
              toast.info('Correlation ID copiado');
            }}
          >
            ID: {correlationId}
          </button>
        )}
      </div>
    </div>
  );
}

// -- Divider + Footer --

function CardFooter() {
  return (
    <>
      <div className="flex items-center gap-3 mt-7 mb-5">
        <div className="flex-1 h-px bg-[#E8E8E6]" />
        <span className="text-[#BBBBBB] font-display text-xs">acesso restrito</span>
        <div className="flex-1 h-px bg-[#E8E8E6]" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldIcon />
          <span className="text-[#AAAAAA] font-display text-[11px] leading-[14px]">Conexão segura (TLS)</span>
        </div>
        <div className="flex items-center gap-[5px]">
          <HelpIcon />
          <span className="text-[#888888] font-display font-medium text-[11px] leading-[14px]">Suporte</span>
        </div>
      </div>
    </>
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
  const [showPassword, setShowPassword] = useState(false);

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
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col mb-9 gap-1.5">
        <h1 className="tracking-[-0.5px] text-[#111111] font-display font-extrabold text-2xl leading-[30px]">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-[#888888] font-display leading-[round(up,150%,1px)]">
          Insira suas credenciais para acessar o portal.
        </p>
      </div>

      {error && <div className="mb-4"><ErrorAlert error={error} /></div>}

      <div className="flex flex-col mb-4 gap-[7px]">
        <StyledLabel htmlFor="login-email">E-mail</StyledLabel>
        <StyledInput
          id="login-email"
          type="email"
          icon={<EnvelopeIcon />}
          placeholder="seu@grupoa1.com.br"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
          maxLength={255}
        />
      </div>

      <div className="flex flex-col mb-4 gap-[7px]">
        <div className="flex items-center justify-between">
          <StyledLabel htmlFor="login-password">Senha</StyledLabel>
          <button
            type="button"
            onClick={onForgotClick}
            className="text-[#F58C32] font-display font-medium text-xs hover:underline"
          >
            Esqueci a senha
          </button>
        </div>
        <StyledInput
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          icon={<LockIcon />}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="shrink-0" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
      </div>

      <div className="flex items-center gap-2 mb-7">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-[#E8E8E6] accent-[#F58C32]"
        />
        <label htmlFor="remember-me" className="text-sm font-display text-[#888888]">
          Manter conectado
        </label>
      </div>

      <Button
        type="submit"
        isLoading={loading}
        className="h-[52px] mb-5 rounded-lg gap-2 bg-[#F58C32] hover:bg-[#e07d28] text-white font-display font-bold text-[15px] tracking-[0.2px]"
      >
        Entrar
        {!loading && <ArrowRightIcon />}
      </Button>

      <CardFooter />
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
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col mb-9 gap-1.5">
        <h1 className="tracking-[-0.5px] text-[#111111] font-display font-extrabold text-2xl leading-[30px]">
          Verificar código
        </h1>
        <p className="text-sm text-[#888888] font-display leading-[round(up,150%,1px)]">
          Digite o código do seu autenticador.
        </p>
      </div>

      {error && <div className="mb-4"><ErrorAlert error={error} /></div>}

      <div className="flex flex-col mb-7 gap-[7px]">
        <StyledLabel htmlFor="mfa-code">Código TOTP</StyledLabel>
        <StyledInput
          id="mfa-code"
          type="text"
          icon={<ShieldCodeIcon />}
          placeholder="000000"
          value={code}
          onChange={setCode}
          autoComplete="one-time-code"
          required
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]{6}"
        />
      </div>

      <Button
        type="submit"
        isLoading={loading}
        className="h-[52px] mb-5 rounded-lg gap-2 bg-[#F58C32] hover:bg-[#e07d28] text-white font-display font-bold text-[15px] tracking-[0.2px]"
      >
        Verificar código
        {!loading && <ArrowRightIcon />}
      </Button>

      <CardFooter />
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
      <div className="flex flex-col items-center text-center">
        <div className="flex flex-col mb-9 gap-1.5">
          <h1 className="tracking-[-0.5px] text-[#111111] font-display font-extrabold text-2xl leading-[30px]">
            E-mail enviado
          </h1>
          <p className="text-sm text-[#888888] font-display leading-[round(up,150%,1px)]">
            Se o e-mail estiver cadastrado, você receberá um link em breve.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="h-[52px] w-full mb-5 rounded-lg border border-[#E8E8E6] bg-white text-[#111111] font-display font-bold text-[15px] tracking-[0.2px] hover:bg-[#F5F5F3] transition-colors"
        >
          Voltar ao login
        </button>
        <CardFooter />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col mb-9 gap-1.5">
        <h1 className="tracking-[-0.5px] text-[#111111] font-display font-extrabold text-2xl leading-[30px]">
          Recuperar senha
        </h1>
        <p className="text-sm text-[#888888] font-display leading-[round(up,150%,1px)]">
          Informe seu e-mail para receber o link de redefinição.
        </p>
      </div>

      <div className="flex flex-col mb-7 gap-[7px]">
        <StyledLabel htmlFor="forgot-email">E-mail</StyledLabel>
        <StyledInput
          id="forgot-email"
          type="email"
          icon={<EnvelopeIcon />}
          placeholder="seu@grupoa1.com.br"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
          maxLength={255}
        />
      </div>

      <Button
        type="submit"
        isLoading={loading}
        className="h-[52px] mb-3 rounded-lg gap-2 bg-[#F58C32] hover:bg-[#e07d28] text-white font-display font-bold text-[15px] tracking-[0.2px]"
      >
        Enviar link
        {!loading && <ArrowRightIcon />}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="h-[44px] w-full mb-2 rounded-lg text-[#888888] font-display font-medium text-sm hover:text-[#111111] transition-colors"
      >
        Voltar ao login
      </button>

      <CardFooter />
    </form>
  );
}

// -- Reset Password Panel --

function ResetPasswordPanel({ token, onBack }: { token: string; onBack: () => void }) {
  const { resetPassword, loading, error, success } = useResetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      <div className="flex flex-col items-center text-center">
        <div className="flex flex-col mb-9 gap-1.5">
          <h1 className="tracking-[-0.5px] text-[#111111] font-display font-extrabold text-2xl leading-[30px]">
            Senha redefinida
          </h1>
          <p className="text-sm text-[#888888] font-display leading-[round(up,150%,1px)]">
            Senha redefinida com sucesso. Faça login.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="h-[52px] w-full mb-5 rounded-lg border border-[#E8E8E6] bg-white text-[#111111] font-display font-bold text-[15px] tracking-[0.2px] hover:bg-[#F5F5F3] transition-colors"
        >
          Ir para login
        </button>
        <CardFooter />
      </div>
    );
  }

  const validationErr = validationError
    ? ({ message: validationError } as Error)
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col mb-9 gap-1.5">
        <h1 className="tracking-[-0.5px] text-[#111111] font-display font-extrabold text-2xl leading-[30px]">
          Redefinir senha
        </h1>
        <p className="text-sm text-[#888888] font-display leading-[round(up,150%,1px)]">
          Escolha uma nova senha para sua conta.
        </p>
      </div>

      {(error || validationErr) && (
        <div className="mb-4"><ErrorAlert error={error ?? validationErr} /></div>
      )}

      <div className="flex flex-col mb-4 gap-[7px]">
        <StyledLabel htmlFor="reset-password">Nova senha</StyledLabel>
        <StyledInput
          id="reset-password"
          type={showNew ? 'text' : 'password'}
          icon={<KeyIcon />}
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          rightElement={
            <button type="button" onClick={() => setShowNew(!showNew)} className="shrink-0" aria-label={showNew ? 'Ocultar senha' : 'Mostrar senha'}>
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
      </div>

      <div className="flex flex-col mb-7 gap-[7px]">
        <StyledLabel htmlFor="reset-confirm">Confirmar senha</StyledLabel>
        <StyledInput
          id="reset-confirm"
          type={showConfirm ? 'text' : 'password'}
          icon={<LockIcon />}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          rightElement={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="shrink-0" aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
      </div>

      <Button
        type="submit"
        isLoading={loading}
        className="h-[52px] mb-5 rounded-lg gap-2 bg-[#F58C32] hover:bg-[#e07d28] text-white font-display font-bold text-[15px] tracking-[0.2px]"
      >
        Redefinir senha
        {!loading && <ArrowRightIcon />}
      </Button>

      <CardFooter />
    </form>
  );
}

// -- Branding Panel (left side) --

function BrandingPanel() {
  return (
    <aside className="hidden lg:flex w-[580px] shrink-0 flex-col justify-between py-16 px-[72px] bg-[#111111]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <A1Logo />
        <div className="flex flex-col gap-px">
          <div className="tracking-[-0.3px] text-white font-display font-extrabold text-base leading-5">
            Grupo A1
          </div>
          <div className="tracking-[0.2px] text-[#444444] font-display text-[11px] leading-[14px]">
            Portal Interno
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h2 className="text-[44px] leading-[round(up,110%,1px)] tracking-[-1.5px] text-white font-display font-extrabold">
            Soluções<br />para a<br />indústria.
          </h2>
          <p className="text-[15px] leading-[round(up,170%,1px)] max-w-[360px] text-[#555555] font-display">
            Plataforma de gestão de processos, aprovações e integração com Protheus — desenvolvida para o Grupo A1.
          </p>
        </div>
        <div className="w-12 h-[3px] rounded-sm bg-[#F58C32]" />
      </div>

      {/* Bottom: units + copyright */}
      <div className="flex flex-col gap-3">
        <div className="uppercase tracking-[1.4px] text-[#333333] font-display font-semibold text-[10px] leading-3">
          Unidades do Grupo
        </div>
        <div className="flex flex-wrap gap-2">
          {['Engenharia', 'Industrial', 'Energia', 'Agro'].map((unit) => (
            <div key={unit} className="rounded-[20px] py-1.5 px-3.5 border border-[#222222]">
              <span className="text-white font-sans text-base leading-5">{unit}</span>
            </div>
          ))}
        </div>
        <div className="text-[#2A2A2A] font-display text-[11px] leading-[14px]">
          © 2026 Grupo A1 · Todos os direitos reservados
        </div>
      </div>
    </aside>
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
    <div className="flex min-h-screen font-display">
      {/* Left branding panel — hidden on mobile */}
      <BrandingPanel />

      {/* Right panel — form */}
      <main className="flex-1 flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-[420px] flex flex-col rounded-2xl py-[52px] px-12 bg-white border border-[#E8E8E6] lg:border-transparent lg:shadow-none">
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
      </main>
    </div>
  );
}

export default LoginPage;
