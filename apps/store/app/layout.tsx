import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar"
import {Suspense} from "react"
import { ThemeProvider } from "../components/ThemeProvider"
import { getNavCategorias } from "./actions/store";


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
  const categorias = await getNavCategorias();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${figtree.variable} h-full antialiased`}
    >
      <body>
        <ThemeProvider>
          <div className="layout-wrapper">
            <Suspense fallback={<nav className="nav-main"><div className="nav-icon"><h2>MAKCED</h2></div></nav>}>
              <Navbar initialCategories={categorias} />
            </Suspense>
            <main className="layout-main">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
