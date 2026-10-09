'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAuthActions, createServerClient } from '@insforge/sdk/ssr';

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? 'http://localhost:3001';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002';

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
  } else if (rawMessage.includes('Invalid or expired verification code')){
    message = 'Código de verificación inválido o expirado';
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

  const redirectTo = `${LOGIN_URL}/auth/callback`;

  const { data, error } = await auth.signUp({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    name: String(formData.get('name') || ''),
    redirectTo,
  });

  return { user: data?.user ?? null, error: FormatAuthError(error) };
}

export async function signOut() {
  const auth = createAuthActions({ cookies: await cookies() });
  const { error } = await auth.signOut();
  return { error: FormatAuthError(error) };
}

export async function verifyEmail(formData: FormData) {
  const auth = createAuthActions({ cookies: await cookies() });

  const { data, error } = await auth.verifyEmail({
    email: String(formData.get('email')),
    otp: String(formData.get('otp')),
  });

  if (error) {
    return { user: null, error: FormatAuthError(error) };
  }

  redirect(DASHBOARD_URL);
}

export async function resetPassword(formData: FormData) {
  const client = createServerClient({ cookies: await cookies() });

  const email = String(formData.get('email'));
  const code = String(formData.get('otp'));
  const newPassword = String(formData.get('newPassword'));

  const { data: exchanged, error: exchangeError } =
    await client.auth.exchangeResetPasswordToken({ email, code });

  if (exchangeError) {
    return { success: false, error: FormatAuthError(exchangeError) };
  }

  const { error } = await client.auth.resetPassword({
    newPassword,
    otp: exchanged?.token ?? '',
  });

  if (error) {
    return { success: false, error: FormatAuthError(error) };
  }

  redirect(LOGIN_URL);
}

export async function initiateOAuth(provider: string) {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: new URL('/auth/callback', LOGIN_URL).toString(),
    skipBrowserRedirect: true,
  });

  if (error || !data?.url || !data.codeVerifier) {
    throw new Error(error?.message ?? 'OAuth init failed');
  }

  cookieStore.set('insforge_code_verifier', data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  redirect(data.url);
}
