"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { revalidatePath } from "next/cache";
import { insforge } from "@/lib/insforge";
import { borrarArchivoStorage, resolverImagen, texto } from "@/lib/imagenes";
import { generarSlugUnico } from "@/lib/slug";
import { PRODUCTOS_POR_PAGINA } from "@/lib/paginacion";
import { getTienda, requireTiendaDelUsuario } from "./tienda";
import type { ProductoLista, ProductoUpdate, RefSimple } from "@/types/database";
import type { GuardadoResultado } from "@/types/components";

const PRODUCTO_SELECT = `
  id, nombre, descripcion, precio, precio_descuento, stock,
  imagen_url, imagen_key, slug,
  estado, es_nuevo, es_destacado,
  marca:marcas(id, nombre),
  categoria:categorias(id, nombre)
`;

type ProductoRowCrudo = Omit<ProductoLista, "marca" | "categoria"> & {
  marca?: RefSimple | RefSimple[] | null;
  categoria?: RefSimple | RefSimple[] | null;
};

const normalizarRef = (
  value: RefSimple | RefSimple[] | null | undefined,
): RefSimple | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

export async function getProductosPaginado(
  search?: string,
  marca?: string,
  categoria?: string,
  page = 1,
): Promise<{
  productos: ProductoLista[];
  total: number;
  totalPaginas: number;
  page: number;
}> {
  // Scoping por tienda del usuario (layout ya exige sesión).
  // Lectura: RLS permite SELECT público; el filtro tienda_id evita ver datos ajenos.
  const { tienda } = await requireTiendaDelUsuario();
  const tiendaId = tienda?.id;
  // total filtrado (mismos criterios que la página)
  let countQuery = insforge.database
    .from("productos")
    .select("*", { count: "exact", head: true });
  if (tiendaId) {
    countQuery = countQuery.eq("tienda_id", tiendaId);
  }
  if (search) {
    countQuery = countQuery.ilike("nombre", `%${search}%`);
  }
  if (marca) {
    countQuery = countQuery.eq("marca_id", marca);
  }
  if (categoria) {
    countQuery = countQuery.eq("categoria_id", categoria);
  }
  const { count } = await countQuery;
  const total = count ?? 0;

  // ajusta la página pedida al rango válido (evita páginas vacías)
  const totalPaginas = Math.max(1, Math.ceil(total / PRODUCTOS_POR_PAGINA));
  const pagina = Math.min(Math.max(1, page), totalPaginas);
  const desde = (pagina - 1) * PRODUCTOS_POR_PAGINA;

  let query = insforge.database.from("productos").select(PRODUCTO_SELECT);
  if (tiendaId) {
    query = query.eq("tienda_id", tiendaId);
  }
  if (search) {
    query = query.ilike("nombre", `%${search}%`);
  }
  if (marca) {
    query = query.eq("marca_id", marca);
  }
  if (categoria) {
    query = query.eq("categoria_id", categoria);
  }

  const { data } = await query
    .order("created_at", { ascending: false })
    .range(desde, desde + PRODUCTOS_POR_PAGINA - 1);
  const rows = (data ?? []) as ProductoRowCrudo[];

  return {
    productos: rows.map(({ marca: marcaCruda, categoria: categoriaCruda, ...resto }) => ({
      ...resto,
      marca: normalizarRef(marcaCruda),
      categoria: normalizarRef(categoriaCruda),
    })),
    total,
    totalPaginas,
    page: pagina,
  };
}

export async function getProductosCount() {
  const { tienda } = await requireTiendaDelUsuario();
  let q = insforge.database
    .from("productos")
    .select("*", { count: "exact", head: true });
  if (tienda?.id) {
    q = q.eq("tienda_id", tienda.id);
  }
  const { count } = await q;
  return count || 0;
}

export async function updateProducto(id: string, patch: ProductoUpdate) {
  const { tienda, error: authError } = await requireTiendaDelUsuario();
  if (!tienda) {
    throw new Error(authError ?? "No autorizado. Inicia sesión.");
  }
  // Verifica que el producto pertenezca a la tienda del usuario
  const server = createServerClient({ cookies: await cookies() });
  const { data: propio } = await server.database
    .from("productos")
    .select("id")
    .eq("id", id)
    .eq("tienda_id", tienda.id)
    .maybeSingle();
  if (!propio) {
    throw new Error("Producto no encontrado o no pertenece a tu tienda");
  }
  const { data, error } = await server.database
    .from("productos")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(`No se pudo actualizar el producto: ${error.message}`);
  }

  return data ?? [];
}

const numero = (fd: FormData, key: string) => {
  const valor = String(fd.get(key) ?? "").trim();
  if (valor === "") return null;
  const n = Number(valor);
  if (Number.isNaN(n)) throw new Error(`El campo "${key}" no es un número válido`);
  return n;
};

const booleano = (fd: FormData, key: string) => fd.get(key) === "true";

const patchDesdeForm = (formData: FormData): ProductoUpdate & { nombre: string } => {
  const nombre = texto(formData, "pm-nombre");
  if (!nombre) throw new Error("El nombre es obligatorio");

  const precio = numero(formData, "pm-precio");
  if (precio === null || precio < 0) throw new Error("El precio es obligatorio");

  return {
    nombre,
    descripcion: texto(formData, "pm-descripcion"),
    marca_id: texto(formData, "pm-marca"),
    categoria_id: texto(formData, "pm-categoria"),
    precio,
    precio_descuento: numero(formData, "pm-descuento"),
    stock: numero(formData, "pm-stock") ?? 0,
    estado: formData.get("pm-estado") === "true",
    es_destacado: booleano(formData, "es_destacado"),
    es_nuevo: booleano(formData, "es_nuevo"),
  };
};

export async function crearProducto(
  formData: FormData,
): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireTiendaDelUsuario();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }

    const patch = patchDesdeForm(formData);
    const imagen = resolverImagen(formData, "pm");
    const slug = await generarSlugUnico("productos", patch.nombre, "producto");

    const server = createServerClient({ cookies: await cookies() });
    const { error } = await server.database.from("productos").insert([
      {
        tienda_id: tienda.id,
        slug,
        ...patch,
        imagen_url: imagen.imagen_url,
        imagen_key: imagen.imagen_key,
      },
    ]);

    if (error) {
      return { ok: false, error: `No se pudo crear el producto: ${error.message}` };
    }

    if (imagen.claveAnterior && imagen.claveAnterior !== imagen.imagen_key) {
      await borrarArchivoStorage(imagen.claveAnterior);
    }

    revalidatePath("/productos");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo crear el producto",
    };
  }
}

export async function eliminarProducto(
  id: string,
): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireTiendaDelUsuario();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }
    const server = createServerClient({ cookies: await cookies() });
    const { data: fila } = await server.database
      .from("productos")
      .select("imagen_key")
      .eq("id", id)
      .eq("tienda_id", tienda.id)
      .maybeSingle();

    if (!fila) {
      return { ok: false, error: "Producto no encontrado o no pertenece a tu tienda" };
    }

    const { error } = await server.database
      .from("productos")
      .delete()
      .eq("id", id);

    if (error) {
      return { ok: false, error: `No se pudo eliminar el producto: ${error.message}` };
    }

    if (fila?.imagen_key) {
      await borrarArchivoStorage(fila.imagen_key);
    }

    revalidatePath("/productos");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo eliminar el producto",
    };
  }
}

export async function guardarProducto(
  formData: FormData,
): Promise<GuardadoResultado> {
  const id = String(formData.get("id") ?? "").trim();
  if (id) {
    return actualizarDesdeForm(id, formData);
  }
  return crearProducto(formData);
}

async function actualizarDesdeForm(
  id: string,
  formData: FormData,
): Promise<GuardadoResultado> {
  try {
    const patch = patchDesdeForm(formData);
    const { imagen_url, imagen_key, claveAnterior } = resolverImagen(formData, "pm");
    await updateProducto(id, { ...patch, imagen_url, imagen_key });
    revalidatePath("/productos");

    if (claveAnterior && claveAnterior !== imagen_key) {
      await borrarArchivoStorage(claveAnterior);
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudieron guardar los cambios",
    };
  }
}

