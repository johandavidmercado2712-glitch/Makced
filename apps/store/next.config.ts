import type { NextConfig } from "next";

// Headers de seguridad. El CSP de la store es ESTATICO (no usa nonce) para no
// perder el ISR (un nonce obligaria a render dinamico en cada peticion).
// script-src mantiene 'unsafe-inline' (Next necesita hidratar sin nonce); el
// resto de la politica si queda en enforce. Login y dashboard usan CSP con
// nonce desde proxy.ts.
const cabecerasSeguridad = () => {
  const esDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${esDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://upload.wikimedia.org https://253fnuce.us-east.insforge.app https://cdn.insforge.dev https://worldvectorlogo.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://253fnuce.us-east.insforge.app https://cdn.insforge.dev",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    esDev ? null : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Content-Security-Policy", value: csp },
  ];

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }

  return headers;
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // En dev, el indicador circular de Next (dev tools) se confunde con un
  // skeleton/spinner de la tienda. No existe en producción.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "253fnuce.us-east.insforge.app",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: cabecerasSeguridad() }];
  },
};

export default nextConfig;
