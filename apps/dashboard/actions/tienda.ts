"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@insforge/sdk/ssr";
import { getCurrentUser } from "@makced/db/server";
import type { Tienda } from "@/types/database";

// Persiste la tienda activa del usuario en una cookie.
export async function setTiendaActiva(
  tiendaId: string,
): Promise<{ ok: boolean; error: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autorizado." };

  const insforge = createServerClient({ cookies: await cookies() });
  const { data } = await insforge.database
    .from("tiendas")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("id", tiendaId)
    .maybeSingle();

  if (!data) return { ok: false, error: "Tienda no válida." };

  const store = await cookies();
  store.set("tienda-activa", tiendaId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/", "layout");
  return { ok: true, error: null };
}
export interface TiendaAutorizada {
  id: string;
  subdominio: string;
  diseno: unknown;
  color_principal: string | null;
  logo_url: string | null;
}

// Resuelve la tienda del usuario autenticado.
// NUNCA usa el cliente anónimo: usa server-client con cookies para que
// RLS (auth.uid()) aplique. Retorna null si no hay sesión o no es dueño.
// Nombre `requireAuth` (reconocido por react-doctor/server-auth-actions).
export async function requireAuth(): Promise<{
  tienda: TiendaAutorizada | null;
  tiendas: TiendaAutorizada[];
  error: string | null;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { tienda: null, tiendas: [], error: "No autorizado. Inicia sesión." };
  }

  const insforge = createServerClient({ cookies: await cookies() });
  const { data, error } = await insforge.database
    .from("tiendas")
    .select("id, subdominio, diseno, color_principal, logo_url")
    .eq("activa", true)
    .eq("usuario_id", user.id);

  if (error) {
    return { tienda: null, tiendas: [], error: `No se pudo verificar la tienda: ${error.message}` };
  }
  const lista = (data ?? []) as TiendaAutorizada[];
  if (lista.length === 0) {
    return { tienda: null, tiendas: [], error: "No tienes una tienda asignada" };
  }

  // Resolver tienda activa: cookie tienda-activa o primera
  let activa: TiendaAutorizada = lista[0];
  try {
    const store = await cookies();
    const cookieVal = store.get("tienda-activa")?.value;
    if (cookieVal) {
      const found = lista.find((t) => t.id === cookieVal);
      if (found) activa = found;
    }
  } catch {
    // cookies() no disponible en este contexto: usar primera
  }

  return { tienda: activa, tiendas: lista, error: null };
}

// Lectura de la tienda del usuario autenticado (layout ya exige sesión).
// Usa el cliente de SESIÓN (RLS: tiendas_owner_write, auth.uid() = usuario_id)
// y NUNCA el anónimo: la tienda pública solo puede leer la fila activa y un
// subconjunto de columnas, así que columnas privadas (usuario_id, propietario,
// plan_actual, created_at) jamás salen por anon.
export async function getTienda(): Promise<Tienda | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const insforge = createServerClient({ cookies: await cookies() });
  const { data } = await insforge.database
    .from("tiendas")
    .select(
      "id, usuario_id, nombre_tienda, propietario, subdominio, plan_actual, plantilla_id, color_principal, logo_url, descripcion, activa, created_at, diseno, whatsapp_numero",
    )
    .eq("usuario_id", user.id)
    .eq("activa", true);

  if (!data || data.length === 0) return null;

  let selected = data[0] as Tienda;
  try {
    const store = await cookies();
    const cookieVal = store.get("tienda-activa")?.value;
    if (cookieVal) {
      const found = (data as Tienda[]).find((t) => t.id === cookieVal);
      if (found) selected = found;
    }
  } catch {
    // ignore
  }
  return selected;
}

// Datos de cuenta del dueño (email + nombre público).
// Usa la SESIÓN (getCurrentUser → UserSchema, que sí trae email);
// getProfile es el endpoint público de perfil y NO incluye email.
export async function getUsuarioTienda(
  usuarioId?: string | null,
): Promise<{ email: string; nombre: string | null } | null> {
  if (!usuarioId) return null;
  const user = await getCurrentUser();
  if (!user || user.id !== usuarioId) return null;
  return { email: user.email, nombre: user.profile?.name ?? null };
}

// Lista de tiendas activas del usuario (para el selector).
export async function getTiendas(): Promise<Tienda[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const insforge = createServerClient({ cookies: await cookies() });
  const { data } = await insforge.database
    .from("tiendas")
    .select(
      "id, usuario_id, nombre_tienda, propietario, subdominio, plan_actual, plantilla_id, color_principal, logo_url, descripcion, activa, created_at, diseno, whatsapp_numero",
    )
    .eq("usuario_id", user.id)
    .eq("activa", true);
  return (data ?? []) as Tienda[];
}
// Valida formato: solo dígitos, 8–15 caracteres (ej. 573001234567).
export async function updateTiendaWhatsapp(
  numero: string,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    // Gate primero: la sesión se verifica antes de validar o tocar datos.
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }

    const limpio = numero.trim();
    if (!/^\d{8,15}$/.test(limpio)) {
      return {
        ok: false,
        error: "El número debe contener solo dígitos (8–15 caracteres), sin espacios ni símbolos.",
      };
    }

    const insforge = createServerClient({ cookies: await cookies() });
    const { error } = await insforge.database
      .from("tiendas")
      .update({ whatsapp_numero: limpio })
      .eq("id", tienda.id);

    if (error) {
      return { ok: false, error: `No se pudo guardar el número: ${error.message}` };
    }

    revalidatePath("/mi-tienda");
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}


