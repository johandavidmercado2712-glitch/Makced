"use client";
// Logo de la tienda: URL de Storage (InsForge), sin optimización de borde a
// borde. `next/image` exigiría remotePatterns + dimensiones explícitas.
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@makced/db/actions";
import { LayoutDashboard, Palette, Package, Tags, Store, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "./sidebar.css";

interface SidebarProps {
  usuario: string;
  tiendaNombre?: string | null;
  tiendaLogo?: string | null;
}

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001";

const navItems = [
  { href: "/", label: "Resumen", mobileLabel: "Resumen", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", mobileLabel: "Productos", icon: Package },
  { href: "/marcas", label: "Marcas y categorías", mobileLabel: "Marcas", icon: Tags },
  { href: "/diseno", label: "Diseño", mobileLabel: "Diseño", icon: Palette },
  { href: "/mi-tienda", label: "Mi tienda", mobileLabel: "Mi tienda", icon: Store },
];

export default function Sidebar({
  usuario,
  tiendaNombre,
  tiendaLogo,
}: SidebarProps) {
  const pathname = usePathname();
  const nombre = tiendaNombre || usuario;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      window.alert(error.message ?? "No se pudo cerrar la sesión");
      return;
    }
    window.location.assign(LOGIN_URL);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-store">
          {tiendaLogo ? (
            <img
              src={tiendaLogo}
              alt={nombre}
              className="sidebar-store-logo"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <span className="sidebar-store-logo-fallback">M</span>
          )}
          <div className="sidebar-store-info">
            <p className="sidebar-store-name">{nombre}</p>
            <p className="sidebar-store-sub">{usuario} · Admin</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map(({ href, label, mobileLabel, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? "active" : ""}
                aria-current={pathname === href ? "page" : undefined}
                aria-label={label}
                title={label}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="sidebar-text">{label}</span>
                <span className="sidebar-mobile-text" aria-hidden="true">
                  {mobileLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout" aria-label="Cerrar sesión" title="Cerrar sesión">
          <LogOut size={18} />
          <span className="sidebar-text">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
