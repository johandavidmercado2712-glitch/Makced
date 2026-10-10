"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@makced/db/actions";
import { LogOut, LayoutDashboard, Package, Palette, Tags, Store } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "./sidebar.css";

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "http://localhost:3001";

const navItems = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/marcas", label: "Marcas y categorías", icon: Tags },
  { href: "/diseno", label: "Diseño", icon: Palette },
  { href: "/mi-tienda", label: "Mi tienda", icon: Store },
];

export default function Sidebar() {
  const pathname = usePathname();

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
        <h2>MAKCED <span>Admin</span></h2>
        <ThemeToggle />
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? "active" : ""}
                aria-label={label}
                title={label}
              >
                <Icon size={18} />
                <span className="sidebar-text">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>Administrador</p>
        <button onClick={handleLogout} className="sidebar-logout" aria-label="Cerrar sesión" title="Cerrar sesión">
          <LogOut size={18} />
          <span className="sidebar-text">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
