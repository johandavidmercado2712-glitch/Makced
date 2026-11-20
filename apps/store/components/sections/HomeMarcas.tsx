import Marcas from "./Marcas"
import { getMarcas } from "../../app/actions/store"

/**
 * Sección de marcas del home: hace fetch internamente (igual que
 * FeaturedProducts) para poder ir dentro de <Suspense> y mostrar
 * su skeleton mientras resuelve, sin bloquear el resto de la página.
 */
import { requerirTienda,  } from "../../lib/tenant";

export default async function HomeMarcas() {
  const tienda = await requerirTienda();
  const marcas = await getMarcas(tienda?.id)
  return <Marcas initialMarcas={marcas} subdominio={tienda.subdominio} />;
}