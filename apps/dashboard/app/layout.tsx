import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/sidebar";
import { ThemeProvider } from "../components/theme";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@makced/db/server";

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001";

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

  return (
    <html lang="es" className={figtree.variable} suppressHydrationWarning>
      <body>
        {/* Aplica el tema ANTES del primer paint (evita el flash claro→oscuro
           al recargar). Mismo STORAGE_KEY "theme" que el store. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()',
          }}
        />
        <ThemeProvider>
          <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
