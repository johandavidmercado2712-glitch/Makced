import type { NextConfig } from "next";

// Headers de seguridad comunes. La CSP va en modo Report-Only: no bloquea
// (Next necesita 'unsafe-inline' para hidratar) y las violaciones se ven en
// la consola del navegador. El framing sí queda bloqueado por X-Frame-Options.
const cabecerasSeguridad = () => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://upload.wikimedia.org https://253fnuce.us-east.insforge.app",
    "font-src 'self' data:",
    "connect-src 'self' https://253fnuce.us-east.insforge.app",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Content-Security-Policy-Report-Only", value: csp },
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
