"use client"
import { useState } from "react";
import { Search, ShoppingCart, Sun, Moon } from "lucide-react";
import { useTheme } from "../auth/ThemeProvider";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import SearchInput from "../ui/SearchInput";
import { useCart } from "../auth/CartContext";
import "./navbar.css";

const fixedLinks = [
  { href: "/", label: "Inicio" },
  { href: "/novedades", label: "Novedades" },
  { href: "/marcas", label: "Marcas" },
  { href: "/categoria", label: "Categorías" },
];

interface NavLink {
  href: string;
  label: string;
  hideOnMobile?: boolean;
}

interface NavbarProps {
  initialCategories?: { id: string; nombre: string; slug: string }[];
  logoUrl?: string | null;
  marca?: string;
}

export default function Navbar({
  initialCategories = [],
  logoUrl = null,
  marca = "MAKCED",
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSlug = searchParams.get("slug");

  const dynamicLinks: NavLink[] = initialCategories.map((cat) => ({
    href: `/categoriaProductos?slug=${cat.slug}`,
    label: cat.nombre,
    hideOnMobile: true,
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
    <header className="nav-main">
      <div className="nav-inner">
        <div className="nav-row">
          <Link href="/" className="nav-header" aria-label={`${marca} - Inicio`}>
            {logoUrl && <img className="nav-logo" src={logoUrl} alt="" />}
            <span className="nav-brand">{marca}</span>
          </Link>

          <div
            className={`nav-icons-right${searchOpen ? " is-searching" : ""}`}
          >
            {searchOpen ? (
              <SearchInput onClose={() => setSearchOpen(false)} />
            ) : (
              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
              >
                <Search size={24} />
              </button>
            )}

            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => router.push("/carrito")}
              aria-label={`Carrito (${totalItems} productos)`}
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>

            <button
              type="button"
              className="nav-icon-btn theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Cambiar tema"
            >
              <Sun size={24} className="theme-icon theme-icon--sun" />
              <Moon size={24} className="theme-icon theme-icon--moon" />
            </button>
          </div>
        </div>

        <nav className="nav-sessiones" aria-label="Navegación principal">
          <div className="nav-session">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`${isActive(link.href) ? "active" : ""}${
                  link.hideOnMobile ? " nav-hide-mobile" : ""
                }`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
