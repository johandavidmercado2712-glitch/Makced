"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@makced/db/actions";
import { LogOut, LayoutDashboard, Package, Palette, Users } from "lucide-react";
import "./sidebar.css";

const navItems = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/diseno", label: "Diseño", icon: Palette },
  { href: "/administrador", label: "Administrador", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>MAKCED <span>Admin</span></h2>
        <label className="flex cursor-pointer gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
  <input type="checkbox" value="synthwave" className="toggle theme-controller" />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
</label>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={pathname === href ? "active" : ""}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>Administrador</p>
        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
