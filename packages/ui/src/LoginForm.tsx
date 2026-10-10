'use client';

import logoImg from './makced-logo.png';
import { useState } from 'react';
import {
  ArrowLeft,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import {
  initiateOAuth,
  resetPassword,
  sendPasswordResetEmail,
  signIn,
  signUp,
  verifyEmail,
} from '@makced/db/actions';
import './LoginForm.css';

type Step = 'signin' | 'signup' | 'verify' | 'forgot-password' | 'reset-password';

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002';
const MIN_PASSWORD_LENGTH = 8;

interface LoginFormProps {
  mode?: 'signin' | 'signup';
  initialMessage?: string | null;
  resetToken?: string | null;
}

function MakcedLogo({ compact = false }: { compact?: boolean }) {
  const imageSrc = typeof logoImg === 'string' ? logoImg : logoImg.src;

  return (
    <div className={`makced-logo${compact ? ' makced-logo-compact' : ''}`}>
      <img src={imageSrc} alt="Makced Logo" />
      <div className="makced-logo-text">
        <span className="makced-logo-name">Makced</span>
        {!compact && (
          <span className="makced-logo-tagline">Tu e-commerce, tu crecimiento.</span>
        )}
      </div>
    </div>
  );
}

function WelcomeSection() {
  return (
    <section className="login-welcome">
      <MakcedLogo />
      <div className="login-welcome-copy">
        <h1>
          ¡Bienvenido de <span>vuelta!</span>
        </h1>
        <p>
          Inicia sesión para que accedas a tu panel de control y gestionar tu tienda
          de forma fácil y eficiente.
        </p>
      </div>
      <div className="login-welcome-glow" />
    </section>
  );
}

function FormHeader({ step }: { step: Step }) {
  const title =
    step === 'signup'
      ? 'Crea tu cuenta para empezar'
      : step === 'verify'
        ? 'Verifica tu correo'
        : step === 'forgot-password'
          ? '¡Volvamos a conectarnos!'
          : step === 'reset-password'
            ? 'Crea una nueva contraseña'
            : 'Inicia sesión a tu cuenta';

  return (
    <div className="login-form-header">
      <div className="login-form-brand">
        <MakcedLogo compact />
      </div>
      {step === 'forgot-password' ? (
        <>
          <h2>{title}</h2>
          <p>
            ¿No recuerdas tu contraseña? No pasa nada. Déjanos tu correo y te
            ayudaremos a recuperar el acceso a tu cuenta.
          </p>
        </>
      ) : (
        <p>{title}</p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
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

function FacebookIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.6 19v-6h2l.3-2.3h-2.3V9.2c0-.67.18-1.12 1.15-1.12h1.23V6.02c-.21-.03-.93-.09-1.77-.09-1.75 0-2.95 1.07-2.95 3.03v1.69H9.3V13h1.96v6h2.34Z"
      />
    </svg>
  );
}

export default function LoginForm({
  mode = 'signin',
  initialMessage = null,
  resetToken = null,
}: LoginFormProps) {
  const [step, setStep] = useState<Step>(resetToken ? 'reset-password' : mode);
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  async function handleSubmit(formData: FormData) {
    clearFeedback();

    if (!email.includes('@') && !(step === 'reset-password' && resetToken)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }
    if (step === 'signup' && !name.trim()) {
      setError('Ingresa tu nombre completo');
      return;
    }
    if (step === 'verify' || (step === 'reset-password' && !resetToken)) {
      if (!/^\d{6}$/.test(otp)) {
        setError('Ingresa el código de 6 dígitos enviado a tu correo');
        return;
      }
    }
    if (step === 'signin' || step === 'signup') {
      if (!password) {
        setError('Ingresa una contraseña');
        return;
      }
      if (step === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
        setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
        return;
      }
      if (step === 'signup' && password !== confirm) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }
    if (step === 'reset-password') {
      const newPassword = String(formData.get('newPassword') ?? '');
      const confirmPassword = String(formData.get('confirm-password') ?? '');
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    setPending(true);
    try {
      if (step === 'verify') {
        const result = await verifyEmail(formData);
        if (result.error) {
          setError(result.error.message ?? 'No se pudo verificar el correo');
          return;
        }
        window.location.assign(DASHBOARD_URL);
        return;
      }

      if (step === 'forgot-password') {
        const result = await sendPasswordResetEmail(formData);
        if (result.error) {
          setError(result.error.message ?? 'No se pudo solicitar el restablecimiento');
          return;
        }
        setStep('reset-password');
        setMessage(
          'Si existe una cuenta con ese correo, recibirás un código para restablecer la contraseña.',
        );
        return;
      }

      if (step === 'reset-password') {
        const result = await resetPassword(formData);
        if (result.error) {
          setError(result.error.message ?? 'No se pudo cambiar la contraseña');
          return;
        }
        setStep('signin');
        setPassword('');
        setConfirm('');
        setOtp('');
        setMessage('Contraseña actualizada. Ya puedes iniciar sesión.');
        return;
      }

      if (step === 'signup') {
        const result = await signUp(formData);
        if (result.error) {
          setError(result.error.message ?? 'No se pudo crear la cuenta');
          return;
        }
        if (result.requiresVerification) {
          setPassword('');
          setConfirm('');
          if (result.verificationMethod === 'link') {
            setStep('signin');
            setMessage('Revisa tu correo y abre el enlace para verificar tu cuenta.');
          } else {
            setStep('verify');
            setMessage('Revisa tu correo e ingresa el código de verificación de 6 dígitos.');
          }
          return;
        }
      } else {
        const result = await signIn(formData);
        if (result.error) {
          setError(result.error.message ?? 'Error de autenticación');
          return;
        }
      }

      window.location.assign(DASHBOARD_URL);
    } catch {
      setError('No se pudo completar la solicitud. Inténtalo de nuevo.');
    } finally {
      setPending(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    clearFeedback();
    setPending(true);
    try {
      const result = await initiateOAuth(provider);
      if (result.error || !result.url) {
        setError(result.error?.message ?? 'No se pudo iniciar sesión con el proveedor');
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError('No se pudo iniciar sesión con el proveedor. Inténtalo de nuevo.');
    } finally {
      setPending(false);
    }
  }

  function changeStep(next: Step) {
    setStep(next);
    clearFeedback();
    setOtp('');
    setPassword('');
    setConfirm('');
  }

  const isSignup = step === 'signup';
  const isVerify = step === 'verify';
  const isForgot = step === 'forgot-password';
  const isReset = step === 'reset-password';
  const showCredentials = step === 'signin' || isSignup;

  return (
    <div className="login-page">
      <div className="login-neon-frame">
        <div className="login-inner">
          <WelcomeSection />

          <section className="login-form-panel">
            <div className="login-card">
              <FormHeader step={step} />

              <form action={handleSubmit} className="form-body" noValidate>
                {(showCredentials || isForgot) && (
                  <div className="input-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} aria-hidden="true" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                )}

                {isSignup && (
                  <div className="input-group">
                    <label htmlFor="name">Nombre completo</label>
                    <div className="input-wrapper">
                      <UserRound className="input-icon" size={18} aria-hidden="true" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                )}

                {showCredentials && (
                  <div className="input-group">
                    <label htmlFor="password">Contraseña</label>
                    <div className="input-wrapper">
                      <LockKeyhole className="input-icon" size={18} aria-hidden="true" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                )}

                {isSignup && (
                  <div className="input-group">
                    <label htmlFor="confirm-password">Confirmar contraseña</label>
                    <div className="input-wrapper">
                      <LockKeyhole className="input-icon" size={18} aria-hidden="true" />
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                )}

                {step === 'signin' && (
                  <div className="login-options login-options-single">
                    <button
                      type="button"
                      className="forgot-button"
                      onClick={() => changeStep('forgot-password')}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {isVerify && (
                  <>
                    <input type="hidden" name="email" value={email} />
                    <div className="input-group">
                      <label htmlFor="otp">Código de verificación</label>
                      <div className="input-wrapper">
                        <KeyRound className="input-icon" size={18} aria-hidden="true" />
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="000000"
                          value={otp}
                          onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="form-input otp-input"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {isForgot && (
                  <button
                    type="button"
                    className="forgot-button login-back-link"
                    onClick={() => changeStep('signin')}
                  >
                    <ArrowLeft size={16} /> Volver al inicio de sesión
                  </button>
                )}

                {isReset && (
                  <>
                    {resetToken ? (
                      <input type="hidden" name="reset-token" value={resetToken} />
                    ) : (
                      <>
                        <input type="hidden" name="email" value={email} />
                        <div className="input-group">
                          <label htmlFor="reset-otp">Código enviado al correo</label>
                          <div className="input-wrapper">
                            <KeyRound className="input-icon" size={18} aria-hidden="true" />
                            <input
                              id="reset-otp"
                              name="otp"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              placeholder="000000"
                              value={otp}
                              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="form-input otp-input"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="input-group">
                      <label htmlFor="new-password">Nueva contraseña</label>
                      <div className="input-wrapper">
                        <LockKeyhole className="input-icon" size={18} aria-hidden="true" />
                        <input
                          id="new-password"
                          name="newPassword"
                          type="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label htmlFor="confirm-reset-password">Confirmar contraseña</label>
                      <div className="input-wrapper">
                        <LockKeyhole className="input-icon" size={18} aria-hidden="true" />
                        <input
                          id="confirm-reset-password"
                          name="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={confirm}
                          onChange={(event) => setConfirm(event.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={pending}
                >
                  {pending && <LoaderCircle size={16} className="login-spinner" />}
                  {pending
                    ? 'Procesando…'
                    : isVerify
                      ? 'Verificar correo'
                      : isSignup
                        ? 'Crear cuenta'
                        : isForgot
                          ? 'Enviar código de recuperación'
                          : isReset
                            ? 'Cambiar contraseña'
                            : 'Iniciar sesión'}
                </button>
              </form>

              {error && <p className="login-message message-error" role="alert">{error}</p>}
              {message && <p className="login-message message-success" role="status">{message}</p>}

              {showCredentials && (
                <>
                  <div className="oauth-divider"><span>continúa con</span></div>
                  <div className="oauth-options">
                    <button
                      type="button"
                      className="oauth-button"
                      disabled={pending}
                      onClick={() => void handleOAuth('google')}
                    >
                      <GoogleIcon /><span>Google</span>
                    </button>
                    <button
                      type="button"
                      className="oauth-button"
                      disabled={pending}
                      onClick={() => void handleOAuth('facebook')}
                    >
                      <FacebookIcon /><span>Facebook</span>
                    </button>
                  </div>
                  <div className="login-switch">
                    {isSignup ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                      type="button"
                      className="switch-account-button"
                      onClick={() => changeStep(isSignup ? 'signin' : 'signup')}
                    >
                      {isSignup ? 'Inicia sesión' : 'Crea tu cuenta'}
                    </button>
                  </div>
                </>
              )}

              {(isVerify || isReset) && (
                <button
                  type="button"
                  className="forgot-button login-back-link"
                  onClick={() => changeStep('signin')}
                >
                  <ArrowLeft size={16} /> Volver al inicio de sesión
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
