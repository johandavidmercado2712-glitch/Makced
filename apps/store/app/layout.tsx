import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar"
import { ThemeProvider } from "../components/ThemeProvider"


const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MakcedStore - Tienda Online",
  description: "Tu tienda de calzado y ropa deportiva favorita",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${figtree.variable} h-full antialiased`}
    >
      <body>
        <ThemeProvider>
          <div className="layout-wrapper">
            <Navbar />
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
