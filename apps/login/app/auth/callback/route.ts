import { NextResponse, type NextRequest } from 'next/server';
import { createAuthActions } from '@insforge/sdk/ssr';

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002';

function loginError(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(
    new URL(`/?error=${encodeURIComponent(reason)}`, request.url),
  );
  response.cookies.delete('insforge_code_verifier');
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('insforge_code');
  if (request.nextUrl.searchParams.has('error') || !code) {
    return loginError(request, 'oauth_failed');
  }

  const codeVerifier = request.cookies.get('insforge_code_verifier')?.value;
  if (!codeVerifier) {
    return loginError(request, 'missing_verifier');
  }

  const response = NextResponse.redirect(DASHBOARD_URL);
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  if (error || !data?.user) {
    console.error('OAuth code exchange failed', error ?? 'No user returned');
    return loginError(request, 'exchange_failed');
  }

  response.cookies.delete('insforge_code_verifier');
  return response;
}
