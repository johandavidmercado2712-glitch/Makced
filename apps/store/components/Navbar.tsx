"use client"
import { User, Search, Heart, ShoppingCart, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./navbar.css";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/categoriaProductos", label: "Hombres" },
  { href: "/categoriaProductos", label: "Mujeres" },
  { href: "/categoriaProductos", label: "Niños" },
  { href: "/categoriaProductos", label: "Novedades" },
  { href: "/marcas", label: "Marcas" },
  { href: "/categoria", label: "Categorias" },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="nav-main">
      <div className="nav-icon">
        <a href="#">
          <i><User size={34} /></i>
        </a>
        <h2>MAKCED</h2>
        <a className="nav-icon-links">
          <i><Search size={34} /></i>
          <i><Heart size={34} /></i>
          <i><ShoppingCart size={34} /></i>
          {mounted && (
            <i 
              className="theme-toggle" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{ cursor: "pointer" }}
            >
              {theme === "dark" ? <Sun size={34} /> : <Moon size={34} />}
            </i>
          )}
        </a>
      </div>


      <div className="nav-sessiones">
        <div className="nav-session">
          {links.map((link) => (
            <a 
              key={link.href + link.label}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
