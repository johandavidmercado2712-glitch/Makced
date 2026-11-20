"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useRutaTienda } from "../tenant/TenantProvider";

export default function CarritoVacio() {
  const ruta = useRutaTienda();

  return (
    <div className="carrito-vacio">
      <ShoppingCart size={64} />
      <h2>Tu carrito está vacío</h2>
      <p>Explora nuestro catálogo y encuentra lo que buscas.</p>
      <Link href={ruta("/")} className="carrito-vacio-cta">
        Ver catálogo
      </Link>
      <div className="carrito-vacio-categorias">
        <Link href={ruta("/categoria")} className="carrito-vacio-categoria-link">
          Categorías
        </Link>
        <Link href={ruta("/marcas")} className="carrito-vacio-categoria-link">
          Marcas
        </Link>
        <Link href={ruta("/novedades")} className="carrito-vacio-categoria-link">
          Novedades
        </Link>
      </div>
    </div>
  );
}
