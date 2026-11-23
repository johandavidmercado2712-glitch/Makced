import type { NextConfig } from "next";

// Headers de seguridad. El Content-Security-Policy (con nonce) lo define
// proxy.ts, ya que el nonce debe generarse por peticion; aqui solo van los
// headers estaticos.
const cabecerasSeguridad = () => {
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
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
  // Upgrade asistido por el agente de Next: permite que `next upgrade
  // --agent=security` aplique los fixes de seguridad de forma reproducible.
  experimental: {
    agentUpgrade: "security",
  },
  // Next 16 bloquea los requests cross-origin al dev server por defecto. Los
  // e2e apuntan a 127.0.0.1, que no es el hostname por defecto (localhost) →
  // sin esto la app no hidrata en esos tests. Solo aplica en desarrollo.
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [{ source: "/(.*)", headers: cabecerasSeguridad() }];
  },
};

export default nextConfig;
