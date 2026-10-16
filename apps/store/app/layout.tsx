import type { Metadata } from "next";
import { Figtree, Poppins, Montserrat, Inter, Roboto } from "next/font/google";
import "./globals.css";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar"
import { Suspense, type CSSProperties } from "react"
import { ThemeProvider } from "../components/auth/ThemeProvider"
import { getConfigDiseno, getNavCategorias } from "./actions/store";
import { CartProvider } from "../components/auth/CartContext"
import { varsDesdeConfig, type Tipografia } from "@makced/db/diseno";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  preload: false,
});

const FUENTES: Record<Tipografia, { variable: string }> = {
  Figtree: figtree,
  Poppins: poppins,
  Montserrat: montserrat,
  Inter: inter,
  Roboto: roboto,
};

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

  const fuenteActiva = FUENTES[config.tipografia] ?? figtree;
  const vars = varsDesdeConfig(colorPrincipal, config);
  if (config.tipografia !== "Figtree") {
    vars["--font-figtree"] = `var(${fuenteActiva.variable})`;
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fuenteActiva.variable} h-full antialiased`}
      style={vars as CSSProperties}
    >
      <body>
        {/* Aplica el tema ANTES del primer paint: lee localStorage y marca
           <html class="dark"> sin esperar a React. Evita el flash
           claro→oscuro al recargar (mismo patrón que next-themes). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()',
          }}
        />
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
