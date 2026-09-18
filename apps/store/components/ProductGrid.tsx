import ScrollReveal from "./ScrollReveal";
import ProductCard from "./ProductCard";

interface ProductoCard {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  slug: string | null;
}

interface Props {
  productos: ProductoCard[];
}

export default function ProductGrid({ productos }: Props) {
  return (
    <div className="div3">
      <ScrollReveal>
        <div className="Productos-cards">
          {productos.map((producto) => (
            <ScrollReveal key={producto.id}>
              <ProductCard
                image={producto.imagen_url || "/producto.jpg"}
                name={producto.nombre}
                price={`$${producto.precio.toLocaleString("es-CO")}`}
                rating={4.5}
                slug={producto.slug || undefined}
              />
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
