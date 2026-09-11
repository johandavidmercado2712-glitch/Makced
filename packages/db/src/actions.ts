'use server';

import { cookies } from 'next/headers';
import { createAuthActions } from '@insforge/sdk/ssr';

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? 'http://localhost:3001';

function FormatAuthError(error: {message?: string, statusCode?: number} | null) {
  if (!error) return null;

  const rawMessage = error.message ?? '';
  let message = rawMessage;

  if (rawMessage.includes('Invalid credentials')){
    message = 'Correo electronico o contraseña incorrectos';
  } else if (rawMessage.includes('Email verification required')){
    message = 'Se requiere verificación de correo electrónico';
  } else if (rawMessage.includes('Service Temporarily Unavailable')){
    message= 'La solicitud falló: Servicio temporalmente no disponible';
  }
  return {... error, message};

}

export async function signIn(formData: FormData) {
  const auth = createAuthActions({ cookies: await cookies() });

  const { data, error } = await auth.signInWithPassword({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  });

  return { user: data?.user ?? null, error: FormatAuthError(error) };
}

export async function signUp(formData: FormData) {
  const auth = createAuthActions({ cookies: await cookies() });

  const { data, error } = await auth.signUp({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    name: String(formData.get('name') || ''),
    redirectTo: LOGIN_URL,
  });

  return { user: data?.user ?? null, error: FormatAuthError(error) };
}

export async function signOut() {
  const auth = createAuthActions({ cookies: await cookies() });
  const { error } = await auth.signOut();
  return { error: FormatAuthError(error) };
}
