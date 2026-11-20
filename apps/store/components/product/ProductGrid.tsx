import ScrollReveal from "../ui/ScrollReveal";
import ProductCard from "./ProductCard";
import { EmptyState } from "../ui/EmptyState";
import { ShoppingBag } from "lucide-react";
import type { ProductoCardData } from "../../types/store";
import { rutaTienda } from "../../lib/rutas";

interface Props {
  productos: ProductoCardData[];
  mostrarPrecios?:boolean;
  subdominio?: string | null;
  emptyMessage?: string;
}

export default async function ProductGrid({ productos, mostrarPrecios = true, emptyMessage , subdominio}: Props) {
  // Leer la configuración de diseño (server) para saber si mostrar precios

  return (
    <div className="div3">
      <ScrollReveal>
        <div className="Productos-cards">
          {productos.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              titulo="No hay productos disponibles"
              descripcion={emptyMessage || "No encontramos productos en esta sección por ahora. Prueba con otra categoría o vuelve más tarde."}
              cta={{ label: "Explorar catálogo", href: rutaTienda(subdominio, "/") }}
            />
          ) : (
          productos.map((producto) => (
            <ScrollReveal key={producto.id}>
              <ProductCard
                producto={producto}
                mostrarPrecios={mostrarPrecios}
              />
            </ScrollReveal>
          ))
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
