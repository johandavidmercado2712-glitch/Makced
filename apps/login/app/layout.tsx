import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MakcedLogin - Acceso",
  description: "Acceso a la plataforma Makced",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
