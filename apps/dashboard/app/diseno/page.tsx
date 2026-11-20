import { getProductosDestacados } from "@/actions/resumen";
import { getTienda } from "@/actions/tienda";
import { combinarDiseno } from "@makced/db/diseno";
import EditorDiseno from "@/components/diseno/EditorDiseno";
import "../productos/productos.css";
import "./diseno.css";

export default async function DisenoPage() {
  const [tienda, destacados] = await Promise.all([
    getTienda(),
    getProductosDestacados(5),
  ]);
  const config = combinarDiseno(tienda?.diseno);
  const productoDestacado = destacados.find((producto) => producto.estado);
  const productoVistaPrevia = productoDestacado
    ? {
        nombre: productoDestacado.nombre,
        precio: productoDestacado.precio,
        imagenUrl: productoDestacado.imagen_url,
      }
    : null;

  return (
    <div className="dashboard">
      <EditorDiseno
        config={config}
        colorPrincipal={tienda?.color_principal ?? ""}
        logoUrl={tienda?.logo_url ?? null}
        subdominio={tienda?.subdominio ?? null}
        productoVistaPrevia={productoVistaPrevia}
      />
    </div>
  );
}
