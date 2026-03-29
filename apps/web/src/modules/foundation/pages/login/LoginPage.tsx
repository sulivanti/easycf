/**
 * @contract UX-001, UX-000-C02, FR-001, FR-004, FR-015
 * Unified login page — 4 panels on single /login route:
 * login, mfa, forgot-password, reset-password.
 * States: Loading (spinner on button via isLoading), Error (inline + toast RFC 9457).
 * Design: Split-screen 604/836 layout per 01-login-spec-v3.md + Penpot PEN-01.
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

// ══════════════════════════════════════
// SVG Icons (spec v3 §7)
// ══════════════════════════════════════

function EnvelopeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CCCCCC"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CCCCCC"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#AAAAAA"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#AAAAAA"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M1 12s4-8 11-8c2.5 0 4.6.7 6.3 1.8M23 12s-4 8-11 8c-2.5 0-4.6-.7-6.3-1.8" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#888888"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#AAAAAA"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#AAAAAA"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function ShieldCodeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CCCCCC"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M12 2L4 5.5v5.5c0 5.5 3.5 10 8 11.5 4.5-1.5 8-6 8-11.5V5.5L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// ══════════════════════════════════════
// Microsoft Logo (4 colored squares)
// ══════════════════════════════════════

function MicrosoftLogo() {
  return (
    <div className="grid grid-cols-2 gap-[2px] shrink-0" style={{ width: 18, height: 18 }}>
      <div style={{ background: '#F25022' }} />
      <div style={{ background: '#7FBA00' }} />
      <div style={{ background: '#00A4EF' }} />
      <div style={{ background: '#FFB900' }} />
    </div>
  );
}

// ══════════════════════════════════════
// A1 Logo (gradient icon + text)
// ══════════════════════════════════════

function A1Logo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center shrink-0 rounded-lg"
        style={{
          width: 44,
          height: 44,
          background: 'linear-gradient(135deg, #F5A04E, #F58C32)',
          boxShadow: '0 4px 16px rgba(245,140,50,0.25)',
        }}
      >
        <span className="font-display font-extrabold italic text-lg text-white">A1</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display font-bold text-[15px] leading-[18px] text-white">
          Grupo A1
        </span>
        <span
          className="font-display font-medium text-[10px] leading-3 uppercase tracking-[1.6px]"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          PORTAL INTERNO
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// Styled Input (spec v3: 340×48, r:10, border #E8E8E6)
// ══════════════════════════════════════

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
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex items-center h-12 rounded-[10px] px-3.5 gap-2.5 bg-white border border-[#E8E8E6] transition-colors focus-within:border-[#2E86C1]">
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

// ══════════════════════════════════════
// Styled Label (spec v3: 11px w700 UPPER ls:0.8 #333)
// ══════════════════════════════════════

function StyledLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-display font-bold text-[11px] leading-[14px] uppercase tracking-[0.8px] text-[#333333]"
    >
      {children}
    </label>
  );
}

// ══════════════════════════════════════
// Error Alert
// ══════════════════════════════════════

function ErrorAlert({ error }: { error: Error | null }) {
  if (!error) return null;
  const correlationId =
    error && 'correlationId' in error
      ? (error as { correlationId?: string }).correlationId
      : undefined;

  return (
    <div
      role="alert"
      className="flex items-start rounded-lg py-3 px-3.5 gap-2.5 bg-[#FEE2E2] border border-[#E74C3C]/20"
    >
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

// ══════════════════════════════════════
// Auth Divider ("OU CONTINUE COM")
// ══════════════════════════════════════

function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-[#E8E8E6]" />
      <span className="font-display font-semibold text-[11px] leading-[14px] uppercase tracking-[0.8px] text-[#AAAAAA] whitespace-nowrap">
        OU CONTINUE COM
      </span>
      <div className="flex-1 h-px bg-[#E8E8E6]" />
    </div>
  );
}

// ══════════════════════════════════════
// Microsoft SSO Button
// ══════════════════════════════════════

function MicrosoftSSOButton() {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2.5 w-full h-12 rounded-[10px] bg-white border border-[#E8E8E6] font-display font-semibold text-sm text-[#333333] hover:bg-[#FAFAFA] transition-colors"
    >
      <MicrosoftLogo />
      <span>Entrar com Microsoft</span>
    </button>
  );
}

// ══════════════════════════════════════
// Password Strength (spec v3 §9)
// ══════════════════════════════════════

function PasswordStrength({ password }: { password: string }) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  const colors = ['#E8E8E6', '#E74C3C', '#E67E22', '#27AE60', '#27AE60'];

  return (
    <div className="mt-2.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-sm transition-colors"
            style={{ background: i < strength ? colors[strength] : '#E8E8E6' }}
          />
        ))}
      </div>
      {password.length > 0 && (
        <span className="font-display text-[11px] text-[#AAAAAA] mt-1.5 block">
          {labels[strength]}
        </span>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// Card Footer (spec v3: border-top + TLS + Suporte)
// ══════════════════════════════════════

function CardFooter() {
  return (
    <div className="mt-7 pt-5 border-t border-[#E8E8E6]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldIcon />
          <span className="font-display font-medium text-xs text-[#AAAAAA]">
            Conexão segura (TLS)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <InfoIcon />
          <span className="font-display font-medium text-xs text-[#AAAAAA]">Suporte</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// Back Link ("← Voltar ao login")
// ══════════════════════════════════════

function BackToLogin({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 mb-5 font-display font-semibold text-[13px] text-[#888888] hover:text-[#555555] transition-colors"
    >
      <ArrowLeftIcon />
      Voltar ao login
    </button>
  );
}

// ══════════════════════════════════════
// Login Panel (spec v3 §6: 01-Login)
// ══════════════════════════════════════

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
      {/* Title + Subtitle */}
      <h1 className="font-display font-extrabold text-2xl leading-[30px] tracking-[-0.5px] text-[#111111]">
        Bem-vindo de volta
      </h1>
      <p className="font-display text-sm leading-5 text-[#888888] mt-1.5 mb-7">
        Acesse o portal do Grupo A1
      </p>

      {error && (
        <div className="mb-4">
          <ErrorAlert error={error} />
        </div>
      )}

      {/* Email field */}
      <div className="flex flex-col gap-2 mb-5">
        <StyledLabel htmlFor="login-email">E-MAIL CORPORATIVO</StyledLabel>
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

      {/* Password field */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <StyledLabel htmlFor="login-password">SENHA</StyledLabel>
          <button
            type="button"
            onClick={onForgotClick}
            className="font-display font-semibold text-xs leading-4 text-[#F58C32] hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>
        <StyledInput
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          icon={<LockIcon />}
          placeholder="Digite sua senha"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
      </div>

      {/* Checkbox */}
      <label className="flex items-center gap-2 mb-5 cursor-pointer">
        <span
          className="flex items-center justify-center shrink-0 rounded-[3px] border-[1.5px] border-[#E8E8E6] bg-white transition-colors"
          style={{ width: 16, height: 16 }}
        >
          {rememberMe && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="#2E86C1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 5l2.5 2.5L8 3" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="sr-only"
        />
        <span className="font-display text-[13px] leading-[18px] text-[#555555]">
          Manter conectado
        </span>
      </label>

      {/* Button Entrar */}
      <Button
        type="submit"
        isLoading={loading}
        className="h-[50px] rounded-[10px] gap-2 text-white font-display font-bold text-[15px] leading-5"
        style={{ background: '#2E86C1' }}
      >
        Entrar
        {!loading && <ArrowRightIcon />}
      </Button>

      {/* SSO Divider + Microsoft */}
      <AuthDivider />
      <MicrosoftSSOButton />

      {/* First access */}
      <p className="text-center mt-5 font-display text-[13px] leading-[18px]">
        <span className="text-[#888888]">Primeiro acesso? </span>
        <span className="font-bold text-[#333333]">Solicite ao administrador</span>
      </p>

      <CardFooter />
    </form>
  );
}

// ══════════════════════════════════════
// MFA Panel
// ══════════════════════════════════════

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
      <h1 className="font-display font-extrabold text-2xl leading-[30px] tracking-[-0.5px] text-[#111111]">
        Verificar código
      </h1>
      <p className="font-display text-sm leading-5 text-[#888888] mt-1.5 mb-7">
        Digite o código do seu autenticador.
      </p>

      {error && (
        <div className="mb-4">
          <ErrorAlert error={error} />
        </div>
      )}

      <div className="flex flex-col gap-2 mb-7">
        <StyledLabel htmlFor="mfa-code">CÓDIGO TOTP</StyledLabel>
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
        className="h-[50px] rounded-[10px] gap-2 text-white font-display font-bold text-[15px] leading-5"
        style={{ background: '#2E86C1' }}
      >
        Verificar código
        {!loading && <ArrowRightIcon />}
      </Button>

      <CardFooter />
    </form>
  );
}

// ══════════════════════════════════════
// Forgot Password Panel (spec v3 §9: 01-Login-Forgot)
// ══════════════════════════════════════

function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  const { forgotPassword, loading, submitted } = useForgotPassword();
  const [email, setEmail] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await forgotPassword({ email });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <BackToLogin onClick={onBack} />

      <h1 className="font-display font-extrabold text-2xl leading-[30px] tracking-[-0.5px] text-[#111111]">
        Esqueceu a senha?
      </h1>
      <p className="font-display text-sm leading-5 text-[#888888] mt-1.5 mb-7">
        Informe seu e-mail corporativo e enviaremos um link para redefinição.
      </p>

      <div className="flex flex-col gap-2 mb-5">
        <StyledLabel htmlFor="forgot-email">E-MAIL CORPORATIVO</StyledLabel>
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
        className="h-[50px] rounded-[10px] gap-2 text-white font-display font-bold text-[15px] leading-5"
        style={{ background: '#2E86C1' }}
      >
        Enviar link
        {!loading && <ArrowRightIcon />}
      </Button>

      {/* Success message inline (spec v3) */}
      {submitted && (
        <div
          className="mt-4 rounded-lg p-3.5 font-display text-[13px] leading-[1.5]"
          style={{ background: '#E8F8EF', border: '1px solid #B5E8C9', color: '#1E7A42' }}
        >
          Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes.
          Verifique sua caixa de entrada e spam.
        </div>
      )}

      <CardFooter />
    </form>
  );
}

// ══════════════════════════════════════
// Reset Password Panel (spec v3 §9: 01-Login-Reset)
// ══════════════════════════════════════

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
        <h1 className="font-display font-extrabold text-2xl leading-[30px] tracking-[-0.5px] text-[#111111]">
          Senha redefinida
        </h1>
        <p className="font-display text-sm leading-5 text-[#888888] mt-1.5 mb-7">
          Senha redefinida com sucesso. Faça login.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="h-[50px] w-full rounded-[10px] border border-[#E8E8E6] bg-white font-display font-bold text-[15px] text-[#111111] hover:bg-[#F5F5F3] transition-colors"
        >
          Ir para login
        </button>
        <CardFooter />
      </div>
    );
  }

  const validationErr = validationError ? ({ message: validationError } as Error) : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <BackToLogin onClick={onBack} />

      <h1 className="font-display font-extrabold text-2xl leading-[30px] tracking-[-0.5px] text-[#111111]">
        Redefinir senha
      </h1>
      <p className="font-display text-sm leading-5 text-[#888888] mt-1.5 mb-7">
        Crie uma nova senha segura para sua conta.
      </p>

      {(error || validationErr) && (
        <div className="mb-4">
          <ErrorAlert error={error ?? validationErr} />
        </div>
      )}

      {/* New password */}
      <div className="flex flex-col gap-2 mb-4">
        <StyledLabel htmlFor="reset-password">NOVA SENHA</StyledLabel>
        <StyledInput
          id="reset-password"
          type={showNew ? 'text' : 'password'}
          icon={<LockIcon />}
          placeholder="Mínimo 8 caracteres"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          rightElement={
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="shrink-0"
              aria-label={showNew ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
        <PasswordStrength password={newPassword} />
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-2 mb-7">
        <StyledLabel htmlFor="reset-confirm">CONFIRMAR SENHA</StyledLabel>
        <StyledInput
          id="reset-confirm"
          type={showConfirm ? 'text' : 'password'}
          icon={<LockIcon />}
          placeholder="Repita a nova senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="shrink-0"
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
      </div>

      <Button
        type="submit"
        isLoading={loading}
        className="h-[50px] rounded-[10px] gap-2 text-white font-display font-bold text-[15px] leading-5"
        style={{ background: '#2E86C1' }}
      >
        Redefinir
        {!loading && <ArrowRightIcon />}
      </Button>

      <CardFooter />
    </form>
  );
}

// ══════════════════════════════════════
// Branding Panel (spec v3 §6: left 604px)
// ══════════════════════════════════════

function BrandingPanel() {
  return (
    <aside
      className="hidden lg:flex w-[604px] shrink-0 flex-col justify-between"
      style={{
        background: 'linear-gradient(175deg, #1a2318 0%, #151a14 40%, #111111 100%)',
        padding: '40px 56px',
      }}
    >
      {/* Logo */}
      <A1Logo />

      {/* Tagline block */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <h2
            className="font-display font-extrabold italic text-white"
            style={{ fontSize: 42, lineHeight: '47px', letterSpacing: '-1.2px' }}
          >
            Soluções
            <br />
            para a
            <br />
            indústria.
          </h2>
          <p
            className="font-display max-w-[380px]"
            style={{ fontSize: 14, lineHeight: '23px', color: 'rgba(255,255,255,0.45)' }}
          >
            Plataforma de gestão de processos, aprovações e integração com Protheus — desenvolvida
            para o Grupo A1.
          </p>
        </div>
        <div className="rounded-sm" style={{ width: 56, height: 4, background: '#F58C32' }} />
      </div>

      {/* Footer: units + copyright */}
      <div className="flex flex-col gap-3">
        <span
          className="font-display font-bold uppercase"
          style={{
            fontSize: 9,
            lineHeight: '12px',
            letterSpacing: '1.4px',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          UNIDADES DO GRUPO
        </span>
        <div className="flex flex-wrap gap-2">
          {['Engenharia', 'Industrial', 'Energia', 'Agro'].map((unit) => (
            <div
              key={unit}
              className="rounded-[20px] py-1.5 px-4"
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <span
                className="font-display font-medium text-xs leading-4"
                style={{ color: 'rgba(255,255,255,0.50)' }}
              >
                {unit}
              </span>
            </div>
          ))}
        </div>
        <span
          className="font-display text-[11px] leading-[14px]"
          style={{ color: 'rgba(255,255,255,0.20)' }}
        >
          © 2026 Grupo A1 · Todos os direitos reservados
        </span>
      </div>
    </aside>
  );
}

// ══════════════════════════════════════
// Main LoginPage
// ══════════════════════════════════════

export function LoginPage() {
  const search = useSearch({ strict: false }) as { token?: string };
  const navigate = useNavigate();
  const resetToken = search.token ?? null;
  const [panel, setPanel] = useState<Panel>(resetToken ? 'reset-password' : 'login');
  const [mfaTempToken, setMfaTempToken] = useState('');

  function handleLoginSuccess() {
    window.location.href = '/';
  }

  return (
    <div className="flex min-h-screen font-display">
      {/* Left branding panel */}
      <BrandingPanel />

      {/* Right panel — form on #F5F5F3 bg */}
      <main
        className="flex-1 flex items-center justify-center p-4"
        style={{ background: '#F5F5F3' }}
      >
        <div
          className="w-full max-w-[420px] flex flex-col rounded-2xl bg-white border border-[#E8E8E6]"
          style={{ padding: '44px 40px 36px' }}
        >
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
