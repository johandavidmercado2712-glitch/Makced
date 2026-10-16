"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@insforge/sdk/ssr";
import { getCurrentUser } from "@makced/db/server";
import type { Tienda } from "@/types/database";

export interface TiendaAutorizada {
  id: string;
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
  error: string | null;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { tienda: null, error: "No autorizado. Inicia sesión." };
  }

  const insforge = createServerClient({ cookies: await cookies() });
  const { data, error } = await insforge.database
    .from("tiendas")
    .select("id, diseno, color_principal, logo_url")
    .eq("activa", true)
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (error) {
    return { tienda: null, error: `No se pudo verificar la tienda: ${error.message}` };
  }
  if (!data) {
    return { tienda: null, error: "No tienes una tienda asignada" };
  }
  return { tienda: data as TiendaAutorizada, error: null };
}

// Lectura pública (store + dashboard resumen): mantiene cliente anónimo,
// RLS permite SELECT público. Solo para lecturas no sensibles.
export async function getTiendaPublica(): Promise<Tienda | null> {
  const { insforge } = await import("@/lib/insforge");
  const { data } = await insforge.database
    .from("tiendas")
    .select(
      "id, usuario_id, nombre_tienda, propietario, subdominio, plan_actual, plantilla_id, color_principal, logo_url, descripcion, activa, created_at, diseno, whatsapp_numero",
    )
    .eq("activa", true)
    .single();
  return (data ?? null) as Tienda | null;
}

// Alias legacy para lecturas de página (layout ya exige sesión).
// Las acciones de ESCRITURA deben usar requireAuth().
export async function getTienda(): Promise<Tienda | null> {
  return getTiendaPublica();
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

// Actualiza el número de WhatsApp de pedidos de la tienda del usuario.
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


