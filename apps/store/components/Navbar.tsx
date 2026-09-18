"use client"
import { useState } from "react";
import { User, Search, Heart, ShoppingCart, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import SearchInput from "./SearchInput";
import Formulario from "./formulario";
import "./navbar.css";

const fixedLinks = [
  { href: "/", label: "Inicio" },
  { href: "/novedades", label: "Novedades" },
  { href: "/marcas", label: "Marcas" },
  { href: "/categoria", label: "Categorias" },
];

interface NavLink {
  href: string;
  label: string;
  hideOnMobile?: boolean;
}

interface NavbarProps {
  initialCategories?: { id: string; nombre: string; slug: string }[];
}

const emptySubscribe = () => () => {};
const getServerSnapshot = () => false;

export default function Navbar({ initialCategories = [] }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSlug = searchParams.get("slug");
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    getServerSnapshot
  );

  const dynamicLinks: NavLink[] = initialCategories.map((cat) => ({
    href: `/categoriaProductos?slug=${cat.slug}`,
    label: cat.nombre,
  }));

  const links: NavLink[] = [
    fixedLinks[0],
    ...dynamicLinks,
    fixedLinks[1],
    fixedLinks[2],
    fixedLinks[3],
  ];

  const isActive = (href: string) => {
    const [linkPath, linkQuery] = href.split("?");
    if (pathname !== linkPath) return false;
    if (linkQuery) {
      const linkSlug = new URLSearchParams(linkQuery).get("slug");
      return linkSlug === currentSlug;
    }
    return !currentSlug;
  };

  return (
    <div className="nav-main">
      <div className="nav-icon">
        <button type="button" className="nav-user-btn" onClick={() => setShowLogin(true)} aria-label="Iniciar sesión">
          <i><User size={34} /></i>
        </button>
        <h2>MAKCED</h2>
        <div className="nav-icons-right">
          {searchOpen ? (
            <SearchInput onClose={() => setSearchOpen(false)} />
          ) : (
            <button type="button" className="nav-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <Search size={34} />
            </button>
          )}
          <i><Heart size={34} /></i>
          <button type="button" className="nav-icon-btn" onClick={() => window.location.href = "/carrito"} aria-label="Carrito">
            <ShoppingCart size={34} />
          </button>
          {mounted && (
            <button 
              type="button"
              className="nav-icon-btn theme-toggle" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Sun size={34} /> : <Moon size={34} />}
            </button>
          )}
        </div>
      </div>

      <div className="nav-sessiones">
        <div className="nav-session">
          {links.map((link) => (
            <a 
              key={link.href + link.label}
              href={link.href}
              className={`${isActive(link.href) ? "active" : ""}${link.hideOnMobile ? " nav-hide-mobile" : ""}`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {showLogin && <Formulario onClose={() => setShowLogin(false)} />}
    </div>
  );
}
