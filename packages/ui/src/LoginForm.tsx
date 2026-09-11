'use client';

import { useState } from 'react';
import { signIn, signUp } from '@makced/db/actions';
import './LoginForm.css';

type AuthResponse = {
  user: { id: string; email: string } | null;
  error: { message?: string; statusCode?: number } | null;
};

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002';
const MIN_PASSWORD_LENGTH = 8;

export default function LoginForm({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  function validate(): string | null {
    if (isSignUp && name.trim() === '') {
      return 'Ingresa tu nombre completo';
    }

    if (!email.includes('@')) {
      return 'Ingresa un correo electrónico válido';
    }

    if (!password.length) {
      return 'Ingresa una contraseña';
    }

    if (isSignUp && password.length < MIN_PASSWORD_LENGTH) {
      return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    }

    if (isSignUp && password !== confirm) {
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

    const res: AuthResponse = isSignUp ? await signUp(formData) : await signIn(formData);

    if (res.error) {
      setError(res.error.message ?? 'Error de autenticación');
      return;
    }

    if (isSignUp) {
      setMessage('Cuenta creada correctamente. Revisa tu correo para verificarla e inicia sesión.');
      setIsSignUp(false);
      setPassword('');
      setConfirm('');
      return;
    }

    window.location.href = DASHBOARD_URL;
  }

  function switchMode() {
    setIsSignUp((v) => !v);
    setMessage(null);
    setError(null);
    setConfirm('');
  }

  const inputClassName = (hasError: boolean) =>
    `form-input${hasError ? ' input-invalid' : ''}`;

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <div className="form-header">
          <h1 className="logo-text">Makced</h1>
          <p className="form-title">
            {isSignUp ? 'Crea tu cuenta para empezar' : 'Inicia sesión a tu cuenta'}
          </p>
        </div>

        <form action={handleSubmit} className="form-body" noValidate>
          {isSignUp && (
            <div className="input-group">
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName(name.trim() === '')}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName(!email.includes('@'))}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName(password.length > 0 && password.length < MIN_PASSWORD_LENGTH)}
              required
            />
          </div>

          {isSignUp && (
            <div className="input-group">
              <label htmlFor="confirm-password">Confirmar contraseña</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClassName(confirm.length > 0 && confirm !== password)}
                required
              />
            </div>
          )}

          <button type="submit">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        {error && <p className="login-message message-error">{error}</p>}
        {message && <p className="login-message message-success">{message}</p>}

        <button
          type="button"
          className="login-toggle"
          onClick={switchMode}
        >
          {isSignUp ? 'Ya tengo cuenta, iniciar sesión' : '¿No tienes cuenta? Crea tu cuenta'}
        </button>
      </div>
    </div>
  );
}