import { getTienda } from "@/actions/tienda";
import { combinarDiseno } from "@makced/db/diseno";
import EditorDiseno from "@/components/diseno/EditorDiseno";
import "../productos/productos.css";
import "./diseno.css";

export default async function DisenoPage() {
  const tienda = await getTienda();

  return (
    <div className="dashboard">
      <EditorDiseno
        config={combinarDiseno(tienda?.diseno)}
        colorPrincipal={tienda?.color_principal ?? ""}
        logoUrl={tienda?.logo_url ?? null}
      />
    </div>
  );
}
