import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar"
import { Suspense, type CSSProperties } from "react"
import { ThemeProvider } from "../components/auth/ThemeProvider"
import { getConfigDiseno, getNavCategorias } from "./actions/store";
import { CartProvider } from "../components/auth/CartContext"
import { varsDesdeConfig } from "@makced/db/diseno";



const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MakcedStore - Tienda Online",
  description: "Tu tienda de calzado y ropa deportiva favorita",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categorias, { colorPrincipal, config, logoUrl }] = await Promise.all([
    getNavCategorias(),
    getConfigDiseno(),
  ]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${figtree.variable} h-full antialiased`}
      style={varsDesdeConfig(colorPrincipal, config) as CSSProperties}
    >
      <head>
        {config.tipografia !== "Figtree" && (
          <link
            rel="stylesheet"
            precedence="default"
            href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(
              config.tipografia,
            )}:wght@400;500;600;700&display=swap`}
          />
        )}
      </head>
      <body>
        <ThemeProvider>
          <CartProvider showPrices={config.mostrar_precios ?? true}>
            <div className="layout-wrapper">
              <Suspense>
                <Navbar
                  initialCategories={categorias}
                  logoUrl={logoUrl}
                  marca={config.pie.marca}
                />            {/* ← Dentro del Provider ✓ */}
              </Suspense>
              <main>
                {children}            {/* ← Una sola vez ✓ */}
              </main>
              <Footer categorias={categorias} pie={config.pie} />              {/* ← Dentro del Provider ✓ */}
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
