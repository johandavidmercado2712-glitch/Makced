import ScrollReveal from "../ui/ScrollReveal";
import ProductCard from "./ProductCard";
import { getConfigDiseno } from "../../app/actions/store";
import type { ProductoCardData } from "../../types/store";

interface Props {
  productos: ProductoCardData[];
}

export default async function ProductGrid({ productos }: Props) {
  // Leer la configuración de diseño (server) para saber si mostrar precios
  const configResp = await getConfigDiseno();
  const mostrarPrecios = Boolean(configResp?.config?.mostrar_precios ?? true);

  return (
    <div className="div3">
      <ScrollReveal>
        <div className="Productos-cards">
          {productos.map((producto) => (
            <ScrollReveal key={producto.id}>
              <ProductCard
                producto={producto}
                mostrarPrecios={mostrarPrecios}
              />
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
