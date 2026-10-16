import Marcas from "./Marcas"
import { getMarcas } from "../../app/actions/store"

/**
 * Sección de marcas del home: hace fetch internamente (igual que
 * FeaturedProducts) para poder ir dentro de <Suspense> y mostrar
 * su skeleton mientras resuelve, sin bloquear el resto de la página.
 */
export default async function HomeMarcas() {
  const marcas = await getMarcas()
  return <Marcas initialMarcas={marcas} />
}