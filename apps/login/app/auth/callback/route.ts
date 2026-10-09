import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { createAuthActions } from '@insforge/sdk/ssr';

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3002';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('insforge_code');
  const oauthError = request.nextUrl.searchParams.get('error');

  if (oauthError || !code) {
    if (oauthError) {
      console.warn('OAuth callback failed', { error: oauthError });
    }
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('insforge_code_verifier')?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/?error=missing_verifier', request.url));
  }

  const response = NextResponse.redirect(DASHBOARD_URL);
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  if (error || !data?.user) {
    if (error) {
      console.error('OAuth code exchange failed', error);
    }
    return NextResponse.redirect(new URL('/?error=exchange_failed', request.url));
  }

  response.cookies.delete('insforge_code_verifier');

  return response;
}
