import type { Metadata } from "next";
import { Figtree, Poppins, Montserrat, Inter, Roboto } from "next/font/google";
import "./globals.css";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar"
import { Suspense, type CSSProperties } from "react"
import { ThemeProvider } from "../components/auth/ThemeProvider"
import { getConfigDiseno, getNavCategorias } from "./actions/store";
import { resolverTienda } from "@/lib/tenant";
import { TenantProvider } from "@/components/tenant/TenantProvider";
import { CartProvider } from "../components/auth/CartContext"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { OfflineBanner } from "../components/OfflineBanner"
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

// Script estático para aplicar el tema antes del primer paint (evita flash claro→oscuro)
const TEMA_INIT_SCRIPT =
  '(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()';

const FUENTES: Record<Tipografia, { variable: string }> = {
  Figtree: figtree,
  Poppins: poppins,
  Montserrat: montserrat,
  Inter: inter,
  Roboto: roboto,
};

export async function generateMetadata(): Promise<Metadata> {
  const tienda = await resolverTienda();
  const { config, esPreview } = await getConfigDiseno(tienda?.subdominio);
  const marca = config.pie.marca || "MakcedStore";

  return {
    title: {
      default: `${marca} - Tienda Online`,
      template: `%s | ${marca}`,
    },
    description:
      "Calzado y ropa deportiva. Envíos a todo el país y atención personalizada.",
    // La vista previa lleva token caducable en la query: fuera del índice.
    ...(esPreview ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tienda = await resolverTienda();
  const [categorias, { colorPrincipal, config, logoUrl, esPreview }] = await Promise.all([
    getNavCategorias(tienda?.id),
    getConfigDiseno(tienda?.subdominio),
  ]);

  const fuenteActiva = FUENTES[config.tipografia] ?? figtree;
  const vars = varsDesdeConfig(colorPrincipal, config);
  if (config.tipografia !== "Figtree") {
    vars["--font-figtree"] = `var(${fuenteActiva.variable})`;
  }

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fuenteActiva.variable} h-full antialiased`}
      style={vars as CSSProperties}
    >
      <body>
        {/* Solo con token de vista previa: avisa, dentro del iframe del
            dashboard y en la pestaña abierta, que esto NO está publicado. */}
        {esPreview && (
          <div className="preview-badge" role="status">
            <span className="preview-badge-dot" aria-hidden="true" />
            Vista previa · no publicado
          </div>
        )}
        {/* Aplica el tema ANTES del primer paint: lee localStorage y marca
           <html class="dark"> sin esperar a React. Evita el flash
           claro→oscuro al recargar (mismo patrón que next-themes). */}
        <script dangerouslySetInnerHTML={{ __html: TEMA_INIT_SCRIPT }} />
        <ThemeProvider>
          <TenantProvider tiendaId={tienda?.id ?? null} subdominio={tienda?.subdominio ?? null}>
            <CartProvider showPrices={config.mostrar_precios ?? true}>
            
              <div className="layout-wrapper">
              <a className="skip-link" href="#main-content">
                Saltar al contenido principal
              </a>
              <OfflineBanner />
              <Suspense>
                <Navbar
                  initialCategories={categorias}
                  logoUrl={logoUrl}
                  marca={config.pie.marca}
                />            {/* ← Dentro del Provider ✓ */}
              </Suspense>
              <main id="main-content" tabIndex={-1}>
                <ErrorBoundary>
                  {children}            {/* ← Una sola vez ✓ */}
                </ErrorBoundary>
              </main>
              <Footer categorias={categorias} pie={config.pie} subdominio={tienda?.subdominio} />             {/* ← Dentro del Provider ✓ */}
              </div>
             </CartProvider>
            </TenantProvider>
          </ThemeProvider>
        
      </body>
    </html>
  );
}
