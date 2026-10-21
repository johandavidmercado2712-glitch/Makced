'use client';

import { useState } from 'react';

import logoImg from './makced-logo.png';
import PasswordField from './PasswordField';
import { resetPassword } from '@makced/db/actions';

import './LoginForm.css';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;

const LOGIN_URL =
  process.env.NEXT_PUBLIC_LOGIN_URL ?? 'http://localhost:3001';

function MakcedLogoCompact() {
  const imageSrc = typeof logoImg === 'string' ? logoImg : logoImg.src;

  return (
    <div className="makced-logo makced-logo-compact">
      <img
        src={imageSrc}
        alt="Makced Logo"
      />

      <span className="makced-logo-name">Makced</span>
    </div>
  );
}

export default function ResetPasswordForm({
  token,
}: {
  token: string;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate(): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    }
    if (password !== confirm) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

  async function handleSubmit(formData: FormData) {
    if (submitting) return;

    setMessage(null);
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(formData);

      if (res?.error) {
        setError(
          res.error.message ??
            'No se pudo restablecer la contraseña. Inténtalo de nuevo.'
        );
        return;
      }

      setMessage(
        'Tu contraseña se restableció correctamente. Te redirigimos al inicio de sesión.'
      );
      window.location.href = LOGIN_URL;
    } catch {
      setError(
        'No se pudo restablecer la contraseña. Revisa tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-neon-frame">
        <div className="login-inner">
          <section className="relative flex w-full items-center justify-center px-5 py-8 lg:px-8">
            <div className="login-card">
              <div className="mb-8 text-center">
                <div className="mb-3 flex justify-center">
                  <MakcedLogoCompact />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#102E85]">
                  Nueva contraseña
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#8190AF]">
                  Ingresa una nueva contraseña para tu cuenta y
                  podrás volver a acceder.
                </p>
              </div>

              <form
                action={handleSubmit}
                className="form-body"
                noValidate
              >
                <input type="hidden" name="reset-token" value={token} />

                <PasswordField
                  id="newPassword"
                  name="newPassword"
                  label="Nueva contraseña"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  show={showPassword}
                  onToggle={() => setShowPassword((visible) => !visible)}
                  maxLength={MAX_PASSWORD_LENGTH}
                  minLength={MIN_PASSWORD_LENGTH}
                  invalid={password.length > 0 && password.length < MIN_PASSWORD_LENGTH}
                />

                <PasswordField
                  id="confirm-password"
                  name="confirm-password"
                  label="Confirmar contraseña"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  show={showConfirm}
                  onToggle={() => setShowConfirm((visible) => !visible)}
                  maxLength={MAX_PASSWORD_LENGTH}
                  minLength={MIN_PASSWORD_LENGTH}
                  invalid={confirm.length > 0 && confirm !== password}
                />

                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Restableciendo...'
                    : 'Restablecer contraseña'}
                </button>
              </form>

              {error && (
                <p className="login-message message-error" role="alert">
                  {error}
                </p>
              )}

              {message && (
                <p className="login-message message-success" role="status">
                  {message}
                </p>
              )}

              <div className="oauth-divider mt-4">
                <span />
              </div>

              <div className="mt-1 text-center text-xs text-[#8190AF]">
                <a
                  className="forgot-button"
                  href={LOGIN_URL}
                >
                  Volver al inicio de sesión
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
