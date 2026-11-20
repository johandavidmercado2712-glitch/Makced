import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/sidebar";
import { ThemeProvider } from "../components/theme";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@makced/db/server";
import { getTienda, getTiendas } from "@/actions/tienda";
import StoreSelector from "@/components/StoreSelector";

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001";

// Script estático para aplicar el tema antes del primer paint
const TEMA_INIT_SCRIPT =
  '(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()';

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "MakcedDashboard - Panel",
  description: "Panel de administración de Makced",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_URL);
  const usuario = user.profile?.name ?? "Tú";
  const tienda = await getTienda();
  const tiendas = await getTiendas();

  // Nonce generado por proxy.ts para permitir el script inline de tema bajo CSP.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="es" className={figtree.variable} suppressHydrationWarning>
      <body>
        {/* Aplica el tema ANTES del primer paint (evita el flash claro→oscuro
           al recargar). Mismo STORAGE_KEY "theme" que el store. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: TEMA_INIT_SCRIPT }} />
        <ThemeProvider>
          <div className="dashboard-layout">
            <a className="skip-link" href="#main-content">
              Saltar al contenido principal
            </a>
            <Sidebar usuario={usuario} tiendaNombre={tienda?.nombre_tienda} tiendaLogo={tienda?.logo_url} />
            <StoreSelector tiendas={tiendas} activaId={tienda?.id ?? null} />
            <main className="dashboard-main" id="main-content" tabIndex={-1}>
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
