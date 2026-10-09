'use client';

import logoImg from './makced-logo.png';
import { useState } from 'react';
import {
  User,
  Mail,
  ArrowLeft,
  LockKeyhole,
  Check,
} from 'lucide-react';

import {
  initiateOAuth,
  signIn,
  signUp,
  verifyEmail,
  resetPassword,
} from '@makced/db/actions';

import './LoginForm.css';

type AuthResponse = {
  user: { id: string; email: string } | null;
  error: { message?: string; statusCode?: number } | null;
};

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002';

const MIN_PASSWORD_LENGTH = 8;

type Step = 'signin' | 'signup' | 'verify' | 'forgot-password';

function useLoginForm(initialStep: Step) {
  const [step, setStep] = useState<Step>(initialStep);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');

  function validate(): string | null {
    if (step === 'verify') {
      return otp.length === 6
        ? null
        : 'Ingresa el código de verificación de 6 dígitos';
    }

    if (step === 'signup' && name.trim() === '') {
      return 'Ingresa tu nombre completo';
    }

    if (!email.includes('@')) {
      return 'Ingresa un correo electrónico válido';
    }

    if (step === 'forgot-password') {
      return null;
    }

    if (!password.length) {
      return 'Ingresa una contraseña';
    }

    if (step === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    }

    if (step === 'signup' && password !== confirm) {
      return 'Las contraseñas no coinciden';
    }

    return null;
  }

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (step === 'verify') {
      const res = await verifyEmail(formData);

      if (res?.error) {
        setError(
          res.error.message ?? 'Código de verificación inválido'
        );
        return;
      }

      window.location.href = DASHBOARD_URL;
      return;
    }

    if (step === 'forgot-password') {
      const res = await resetPassword(formData);

      if (res?.error) {
        setError(res.error.message ?? 'No se pudo enviar el correo de restablecimiento de contraseña'
        );
        return;
      }

      setMessage(
        'Te hemos enviado un correo con intrucciones para restablecer tu contraseña.'
      );
      return; 
    }

    const res: AuthResponse =
      step === 'signup'
        ? await signUp(formData)
        : await signIn(formData);

    if (res.error) {
      setError(res.error.message ?? 'Error de autenticación');
      return;
    }

    if (step === 'signup') {
      setStep('verify');
      setMessage(
        'Revisa tu correo e ingresa el código de verificación de 6 dígitos.'
      );
      setPassword('');
      setConfirm('');
      return;
    }

    window.location.href = DASHBOARD_URL;
  }

  function switchMode() {
    setStep((v) => (v === 'signin' ? 'signup' : 'signin'));
    setMessage(null);
    setError(null);
    setConfirm('');
  }

  const inputClassName = (hasError: boolean) =>
    `form-input ${hasError ? 'input-invalid' : ''}`;

  return {
    step,
    setStep,
    message,
    error,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    otp,
    setOtp,
    handleSubmit,
    switchMode,
    inputClassName,
  };
}

/* =========================================================
   LOGO
========================================================= */

function MakcedLogo({
  compact = false,
}: {
  compact?: boolean;
}) {
  const imageSrc = typeof logoImg === 'string' ? logoImg : logoImg.src;

  return (
    <div className={`makced-logo ${compact ? 'makced-logo-compact' : ''}`}>
      <img
        src={imageSrc}
        alt="Makced Logo"
      />

      <div className="makced-logo-text">
        <span className="makced-logo-name">Makced</span>

        {!compact && (
          <span className="makced-logo-tagline">
            Tu e-commerce, tu crecimiento.
          </span>
        )}
      </div>
    </div>
  );
}



/* =========================================================
   LEFT BRANDING
========================================================= */

function WelcomeSection() {
  return (
    <section className="relative flex min-h-full flex-1 flex-col justify-start px-8 py-8 lg:px-12 lg:py-10">
      <MakcedLogo />

      <div className="max-w-85 pb-8 pt-16 lg:pb-20">
        <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#102E85] sm:text-5xl">
          ¡Bienvenido de{' '}
          <span className="text-[#00D2B4]">vuelta!</span>
        </h1>

        <p className="mt-6 max-w-85 text-sm leading-6 text-[#7D8DAA] sm:text-base">
          Inicia sesión para que accedas a tu panel de control y
          gestionar tu tienda de forma fácil y eficiente.
        </p>
      </div>

      {/* Decoración */}
      <div className="pointer-events-none absolute bottom-8 left-8 h-20 w-20 rounded-full bg-[#00D2B4]/10 blur-2xl" />
    </section>
  );
}

/* =========================================================
   FORM HEADER
========================================================= */

function FormHeader({ step }: { step: Step }) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-3 flex justify-center">
        <MakcedLogo compact />
      </div>

      {step === 'forgot-password' ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-[#102E85]">
            ¡Volvamos a conectarnos!
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#8190AF]">
            ¿No recuerdas tu contraseña? No pasa nada.
            Déjanos tu correo y te ayudaremos a recuperar
            el acceso a tu cuenta.
          </p>
        </>
      ) : (
      <p className="text-base text-[#8190AF]">
        {step === 'signup'
          ? 'Crea tu cuenta para empezar'
          : step === 'verify'
          ? 'Verifica tu correo'
          : 'Inicia sesión a tu cuenta'}
      </p>
      )}
    </div>
  );
}

/* =========================================================
   CREDENTIAL FIELDS
========================================================= */

type CredentialsFieldsProps = {
  step: Step;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirm: string;
  setConfirm: (value: string) => void;
  inputClassName: (hasError: boolean) => string;
  onForgot: () => void;
};

function CredentialsFields({
  step,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirm,
  setConfirm,
  inputClassName,
  onForgot,
}: CredentialsFieldsProps) {
  return (
    <>
      {step === 'signup' && (
        <div className="input-group">
          <label htmlFor="name">Nombre completo</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName(
                name.length > 0 && name.trim() === ''
              )}
              required
            />
          </div>
        </div>
      )}

      <div className="input-group">
        <label htmlFor="email">Correo electrónico</label>

        <div className="input-wrapper">
          <Mail className="input-icon" size={18} />

          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName(
              email.length > 0 && !email.includes('@')
            )}
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="password">Contraseña</label>

        <div className="input-wrapper">
          <LockKeyhole className="input-icon" size={18} />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName(
              password.length > 0 &&
                password.length < MIN_PASSWORD_LENGTH
            )}
            required
          />
        </div>
      </div>

      {step === 'signin' && (
        <div className="-mt-0.5 flex items-center justify-between gap-4">
          <label className="remember-me">
            <input
              type="checkbox"
              name="rememberMe"
            />

            <span className="remember-checkbox">
              <Check size={11} strokeWidth={3} />
            </span>

            <span>Recordarme</span>
          </label>

          <button
            type="button"
            className="forgot-button"
            onClick={onForgot}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      {step === 'signup' && (
        <div className="input-group">
          <label htmlFor="confirm-password">
            Confirmar contraseña
          </label>

          <div className="input-wrapper">
            <LockKeyhole className="input-icon" size={18} />

            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="••••••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClassName(
                confirm.length > 0 && confirm !== password
              )}
              required
            />
          </div>
        </div>
      )}
    </>
  );
}


/* =========================================================
   FORGOT PASSWORD FIELDS
========================================================= */

type ForgotPasswordFieldsProps = {
  email: string;
  setEmail: (value: string) => void;
  inputClassName: (hasError: boolean) => string;
  onBack: () => void;
};

function ForgotPasswordFields({
  email,
  setEmail,
  inputClassName,
  onBack,
}: ForgotPasswordFieldsProps) {
  return ( 
    <>
      <div className="input-group">
        <label htmlFor="email">Correo electrónico</label>
        <div className="input-wrapper">
          <Mail className="input-icon" size={18} />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName(
              email.length > 0 && !email.includes('@')
            )}
            required
          />
        </div>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          className="forgot-button flex items-center gap-1.5"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Volver al inicio de sesión
        </button>
      </div>
    </>
  )
}



/* =========================================================
   VERIFY
========================================================= */

type VerifyFieldsProps = {
  email: string;
  otp: string;
  setOtp: (value: string) => void;
  inputClassName: (hasError: boolean) => string;
};

function VerifyFields({
  email,
  otp,
  setOtp,
  inputClassName,
}: VerifyFieldsProps) {
  return (
    <>
      <input
        type="hidden"
        name="email"
        value={email}
      />

      <div className="input-group">
        <label htmlFor="otp">
          Código de verificación
        </label>

        <div className="input-wrapper">
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`${inputClassName(
              otp.length > 0 && otp.length !== 6
            )} otp-input`}
            required
          />
        </div>
      </div>
    </>
  );
}

/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.68-.06-1.35-.18-1.98H12v3.75h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.16Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.37l3.24-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.13c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.23 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
      />
    </svg>
  );
}

/* =========================================================
   FACEBOOK ICON
========================================================= */

function FacebookIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#1877F2" />

      <path
        fill="#fff"
        d="M13.6 19v-6h2l.3-2.3h-2.3V9.2c0-.67.18-1.12 1.15-1.12h1.23V6.02c-.21-.03-.93-.09-1.77-.09-1.75 0-2.95 1.07-2.95 3.03v1.69H9.3V13h1.96v6h2.34Z"
      />
    </svg>
  );
}

/* =========================================================
   OAUTH
========================================================= */

function OAuthSection({
  step,
  onSwitch,
}: {
  step: Step;
  onSwitch: () => void;
}) {
  if (step === 'verify' || step === 'forgot-password') return null;

  return (
    <>
      <div className="oauth-divider">
        <span>continua con</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="oauth-button"
          onClick={() => initiateOAuth('google')}
        >
          <GoogleIcon />
          <span>Google</span>
        </button>

        <button
          type="button"
          className="oauth-button"
          onClick={() => initiateOAuth('facebook')}
        >
          <FacebookIcon />
          <span>Facebook</span>
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-[#8190AF]">
        {step === 'signup'
          ? '¿Ya tienes cuenta?'
          : '¿No tienes cuenta?'}

        <button
          type="button"
          className="switch-account-button"
          onClick={onSwitch}
        >
          {step === 'signup'
            ? 'Inicia sesión'
            : 'Crea tu cuenta'}
        </button>
      </div>
    </>
  );
}

/* =========================================================
   SUBMIT LABEL
========================================================= */

function submitLabel(step: Step) {
  return step === 'verify'
    ? 'Verificar correo'
    : step === 'signup'
      ? 'Crear cuenta'
      : step === 'forgot-password'
        ? 'Enviar enlace de recuperación'
      : 'Inicia sesión';
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LoginForm({
  mode = 'signin',
}: {
  mode?: 'signin' | 'signup';
}) {
  const {
    step,
    setStep,
    message,
    error,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    otp,
    setOtp,
    handleSubmit,
    switchMode,
    inputClassName,
  } = useLoginForm(
    mode === 'signup' ? 'signup' : 'signin'
  );

  return (
    <main className="login-page">
        <div className="login-neon-frame">
          <div className="login-inner">

          {/* =============================================
              LEFT SIDE
          ============================================= */}
          <WelcomeSection />

          {/* =============================================
              RIGHT SIDE
          ============================================= */}
          <section className="relative flex w-full items-center justify-center px-5 py-8 lg:w-[47%] lg:px-8">
            <div className="login-card">

              <FormHeader step={step} />

              <form
                action={handleSubmit}
                className="form-body"
                noValidate
              >
                {step === 'verify' ? (
                  <VerifyFields
                    email={email}
                    otp={otp}
                    setOtp={setOtp}
                    inputClassName={inputClassName}
                  />
                ) : step === 'forgot-password' ? (
                <ForgotPasswordFields
                  email={email}
                  setEmail={setEmail}
                  inputClassName={inputClassName}
                  onBack={() => {
                    setStep('signin');
                  }}
                />
              ) : (
                  <CredentialsFields
                    step={step}
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    confirm={confirm}
                    setConfirm={setConfirm}
                    inputClassName={inputClassName}
                    onForgot={() =>
                      setStep('forgot-password')
                    }
                  />
                )}

                <button
                  type="submit"
                  className="login-submit-button"
                >
                  {submitLabel(step)}
                </button>
              </form>

              {error && (
                <p className="login-message message-error">
                  {error}
                </p>
              )}

              {message && (
                <p className="login-message message-success">
                  {message}
                </p>
              )}

              <OAuthSection
                step={step}
                onSwitch={switchMode}
              />
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}