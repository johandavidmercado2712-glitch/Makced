"use client"
import { useState, useEffect, useRef } from "react";
import { CartToast } from "../cart/CartToast";
import { useCartToast } from "../../hooks/useCartToast";
import { Search, ShoppingCart, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useTheme } from "../auth/ThemeProvider";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import SearchInput from "../ui/SearchInput";
import { useCart } from "../auth/CartContext";
import { useRutaTienda } from "../tenant/TenantProvider";
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
  const { state: toastState, show: showToast, hide: hideToast, undo } = useCartToast();
  const prevTotalItems = useRef(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ruta = useRutaTienda();
  const currentSlug = searchParams.get("slug");

  // Detectar primer producto agregado al carrito
  useEffect(() => {
    if (totalItems === 1 && prevTotalItems.current === 0) {
      showToast("¡Tu primer producto está en el carrito!", "celebration");
    }
    prevTotalItems.current = totalItems;
  }, [totalItems, showToast]);

  const dynamicLinks: NavLink[] = initialCategories.map((cat) => ({
    href: ruta(`/categoriaProductos?slug=${cat.slug}`),
    label: cat.nombre,
    hideOnMobile: true,
  }));

  const links: NavLink[] = [
    { ...fixedLinks[0], href: ruta(fixedLinks[0].href) },
  ...dynamicLinks,
    { ...fixedLinks[1], href: ruta(fixedLinks[1].href) },
    { ...fixedLinks[2], href: ruta(fixedLinks[2].href) },
    { ...fixedLinks[3], href: ruta(fixedLinks[3].href) },
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
    <>
    <header className="nav-main">
      <div className="nav-inner">
        <div className="nav-row">
          <Link href={ruta("/")} className="nav-header" aria-label={`${marca} - Inicio`}>
            {logoUrl && (
              <Image
                className="nav-logo"
                src={logoUrl}
                alt=""
                width={260}
                height={80}
                priority
                // El logo vive en el bucket de InsForge: la URL responde 302
                // hacia una URL firmada de CloudFront. El optimizador de Next
                // hace ese fetch en el servidor con un timeout interno de 7s;
                // si el CDN tarda mas, devuelve 504 y la imagen no carga.
                // El navegador no tiene ese limite, asi que lo servimos directo.
                unoptimized
              />
            )}
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
              onClick={() => router.push(ruta("/carrito"))}
              aria-label={`Carrito con ${totalItems} productos`}
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
      <CartToast visible={toastState.visible} message={toastState.message} variant={toastState.variant} countdown={toastState.countdown} onUndo={undo} onDismiss={hideToast} />
    </>
  );
}
