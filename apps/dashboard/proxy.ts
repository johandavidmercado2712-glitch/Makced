import { crearProxy } from '@makced/db/proxy';

const URL_TIENDA =
  process.env.NEXT_PUBLIC_TIENDA_URL ?? 'http://localhost:3000';

const tiendaOrigin = (() => {
  try {
    return new URL(URL_TIENDA).origin;
  } catch {
    return 'http://localhost:3000';
  }
})();

export const proxy = crearProxy({
  csp: 'nonce',
  imageOrigins: [tiendaOrigin],
});

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
