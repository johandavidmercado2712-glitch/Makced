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
  async headers() {
    return [{ source: "/(.*)", headers: cabecerasSeguridad() }];
  },
};

export default nextConfig;
