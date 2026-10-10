'use server';

import { cookies } from 'next/headers';
import { createAuthActions, createServerClient } from '@insforge/sdk/ssr';

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? 'http://localhost:3001';

function FormatAuthError(error: { message?: string; statusCode?: number } | null) {
  if (!error) return null;

  const rawMessage = error.message ?? '';
  let message = rawMessage;

  if (rawMessage.includes('Invalid credentials')) {
    message = 'Correo electrónico o contraseña incorrectos';
  } else if (rawMessage.includes('Email verification required')) {
    message = 'Se requiere verificar el correo electrónico antes de iniciar sesión';
  } else if (rawMessage.includes('Service Temporarily Unavailable')) {
    message = 'El servicio no está disponible temporalmente';
  } else if (rawMessage.includes('Invalid or expired verification code')) {
    message = 'El código es inválido o expiró';
  }
  return { ...error, message };
}

function formValue(formData: FormData, key: string, trim = true): string {
  const value = formData.get(key);
  if (typeof value !== 'string') return '';
  return trim ? value.trim() : value;
}

export async function signIn(formData: FormData) {
  const email = formValue(formData, 'email');
  const password = formValue(formData, 'password', false);
  if (!email || !password) {
    return { user: null, error: { message: 'Ingresa tu correo y contraseña' } };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return {
      user: null,
      error: FormatAuthError(error) ?? { message: 'No se pudo iniciar sesión' },
    };
  }

  return {
    user: { id: data.user.id, email: data.user.email },
    error: null,
  };
}

export async function signUp(formData: FormData) {
  const email = formValue(formData, 'email');
  const password = formValue(formData, 'password', false);
  const name = formValue(formData, 'name');
  if (!email || !password || !name) {
    return { user: null, requiresVerification: false, error: { message: 'Completa todos los campos' } };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signUp({
    email,
    password,
    name,
    redirectTo: LOGIN_URL,
  });

  let verificationMethod: string = 'code';
  if (!error && data?.requireEmailVerification) {
    const client = createServerClient({ cookies: await cookies() });
    const { data: authConfig, error: configError } =
      await client.auth.getPublicAuthConfig();
    if (configError) {
      console.error('Could not read public InsForge auth config', configError);
    } else if (authConfig?.verifyEmailMethod) {
      verificationMethod = authConfig.verifyEmailMethod;
    }
  }

  return {
    user: data?.user ? { id: data.user.id, email: data.user.email } : null,
    requiresVerification: Boolean(data?.requireEmailVerification),
    verificationMethod,
    error: FormatAuthError(error),
  };
}

export async function verifyEmail(formData: FormData) {
  const email = formValue(formData, 'email');
  const otp = formValue(formData, 'otp');
  if (!email || !/^\d{6}$/.test(otp)) {
    return { user: null, error: { message: 'Ingresa el código de 6 dígitos enviado a tu correo' } };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.verifyEmail({ email, otp });
  if (error || !data?.user) {
    return {
      user: null,
      error: FormatAuthError(error) ?? { message: 'No se pudo verificar el correo' },
    };
  }
  return {
    user: { id: data.user.id, email: data.user.email },
    error: null,
  };
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = formValue(formData, 'email');
  if (!email) {
    return { error: { message: 'Ingresa tu correo electrónico' } };
  }

  const client = createServerClient({ cookies: await cookies() });
  const { error } = await client.auth.sendResetPasswordEmail({
    email,
    redirectTo: new URL('/?mode=reset-password', LOGIN_URL).toString(),
  });

  return { error: FormatAuthError(error) };
}

export async function resetPassword(formData: FormData) {
  const resetToken = formValue(formData, 'reset-token');
  const email = formValue(formData, 'email');
  const code = formValue(formData, 'otp');
  const newPassword = formValue(formData, 'newPassword', false);
  const confirmPassword = formValue(formData, 'confirm-password', false);
  if (
    (!resetToken && (!email || !/^\d{6}$/.test(code))) ||
    newPassword.length < 8 ||
    newPassword !== confirmPassword
  ) {
    return {
      error: {
        message: 'Ingresa el código de restablecimiento y confirma una contraseña de al menos 8 caracteres',
      },
    };
  }

  const client = createServerClient({ cookies: await cookies() });
  if (resetToken) {
    const { error } = await client.auth.resetPassword({
      newPassword,
      otp: resetToken,
    });
    return { error: FormatAuthError(error) };
  }

  const { data, error: exchangeError } =
    await client.auth.exchangeResetPasswordToken({ email, code });
  if (exchangeError || !data?.token) {
    return {
      error: FormatAuthError(exchangeError) ?? { message: 'No se pudo validar el código' },
    };
  }

  const { error } = await client.auth.resetPassword({
    newPassword,
    otp: data.token,
  });
  return { error: FormatAuthError(error) };
}

export async function signOut() {
  const auth = createAuthActions({ cookies: await cookies() });
  const { error } = await auth.signOut();
  return { error: FormatAuthError(error) };
}

export async function initiateOAuth(provider: string) {
  if (provider !== 'google' && provider !== 'facebook') {
    return { url: null, error: { message: 'Este proveedor de inicio de sesión no está permitido' } };
  }

  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: new URL('/auth/callback', LOGIN_URL).toString(),
    skipBrowserRedirect: true,
  });

  if (error || !data?.url || !data.codeVerifier) {
    return {
      url: null,
      error: FormatAuthError(error) ?? { message: 'No se pudo iniciar sesión con el proveedor' },
    };
  }

  cookieStore.set('insforge_code_verifier', data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return { url: data.url, error: null };
}
