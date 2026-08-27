'use client';

import { useState } from 'react';
import { signIn, signUp } from '@makced/db/actions';
import './LoginForm.css';

type AuthResponse = {
  user: { id: string; email: string } | null;
  error: { message?: string; statusCode?: number } | null;
};

export default function LoginForm({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res: AuthResponse = isSignUp ? await signUp(formData) : await signIn(formData);

    if (res.error) {
      setMessage(res.error.message ?? 'Error de autenticacion');
    } else if (res.user) {
      setMessage('Sesion iniciada correctamente');
      window.location.href = '/dashboard';
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignUp ? 'Crear cuenta' : 'Iniciar sesion'}</h2>

        <form action={handleSubmit} className="login-form">
          {isSignUp && (
            <input name="name" type="text" placeholder="Nombre" required />
          )}
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Contrasena" required minLength={6} />

          <button type="submit">
            {isSignUp ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        <button
          type="button"
          className="login-toggle"
          onClick={() => {
            setIsSignUp((v) => !v);
            setMessage(null);
          }}
        >
          {isSignUp ? 'Ya tengo cuenta, iniciar sesion' : 'No tengo cuenta, registrarme'}
        </button>
      </div>
    </div>
  );
}
