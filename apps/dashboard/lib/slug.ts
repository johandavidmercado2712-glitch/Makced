import { insforge } from "@/lib/insforge";

export const slugify = (valor: string) =>
  valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Genera un slug único dentro de `tabla` (columna `slug`).
 * Usa `ilike("slug", base%)` para traer candidatos y evita colisiones
 * añadiendo sufijos `-2`, `-3`, ...
 */
export async function generarSlugUnico(
  tabla: "productos" | "categorias",
  nombre: string,
  basePorDefecto = "item",
): Promise<string> {
  const base = slugify(nombre) || basePorDefecto;

  const { data } = await insforge.database
    .from(tabla)
    .select("slug")
    .ilike("slug", `${base}%`);

  const existentes = new Set(
    (data ?? []).map((fila) => fila.slug).filter(Boolean),
  );
  if (!existentes.has(base)) return base;

  let sufijo = 2;
  while (existentes.has(`${base}-${sufijo}`)) sufijo += 1;
  return `${base}-${sufijo}`;
}
