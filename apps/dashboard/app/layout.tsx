import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/sidebar";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "MakcedDashboard - Panel",
  description: "Panel de administración de Makced",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={figtree.variable}>
      <body>
        <div className="dashboard-layout">
          <Sidebar />
          <main className="dashboard-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
