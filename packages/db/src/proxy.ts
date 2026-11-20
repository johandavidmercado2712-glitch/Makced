import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@insforge/sdk/ssr/middleware';

type OpcionesProxy = {
  // 'nonce' genera un nonce por peticion y lo aplica a script-src (requiere
  // render dinamico). Sin csp, solo se refresca la sesion de InsForge.
  csp?: 'nonce';
  imageOrigins?: string[];
};

function construirCSP(nonce: string | null, imageOrigins: string[] = []): string {
  const dev = process.env.NODE_ENV === 'development';
  const evalDev = dev ? " 'unsafe-eval'" : '';
  const scriptSrc = nonce
    ? `'self' 'nonce-${nonce}' 'strict-dynamic'${evalDev}`
    : `'self' 'unsafe-inline'${evalDev}`;
  const validatedImageOrigins = imageOrigins.map((origin) => {
    const parsed = new URL(origin);
    if (
      (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
      parsed.origin !== origin
    ) {
      throw new Error(`Invalid Content Security Policy image origin: ${origin}`);
    }
    return origin;
  });
  const imageSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://upload.wikimedia.org',
    'https://253fnuce.us-east.insforge.app',
    'https://cdn.insforge.dev',
    'https://insforge-storage.s3.us-east-2.amazonaws.com',
    'https://worldvectorlogo.com',
    ...validatedImageOrigins,
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src ${imageSrc}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://253fnuce.us-east.insforge.app https://cdn.insforge.dev https://insforge-storage.s3.us-east-2.amazonaws.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Solo en produccion: en local (http) romperia las peticiones a localhost.
    dev ? null : 'upgrade-insecure-requests',
  ]
    .filter(Boolean)
    .join('; ');
}

export function crearProxy({ csp, imageOrigins = [] }: OpcionesProxy = {}) {
  return async function proxy(request: NextRequest) {
    const nonce =
      csp === 'nonce'
        ? Buffer.from(crypto.randomUUID()).toString('base64')
        : null;

    const requestHeaders = new Headers(request.headers);
    if (nonce) {
      requestHeaders.set('x-nonce', nonce);
    }

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    await updateSession({
      requestCookies: request.cookies,
      responseCookies: response.cookies,
    });

    if (csp) {
      response.headers.set(
        'Content-Security-Policy',
        construirCSP(nonce, imageOrigins),
      );
    }

    return response;
  };
}

// Alias por defecto: solo refresca la sesion (sin CSP). Lo usa la store, cuyo
// CSP se define de forma estatica en next.config.ts para no perder el ISR.
export const proxy = crearProxy();
