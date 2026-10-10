"use server";
import { cookies } from "next/headers";
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
export async function requireTiendaDelUsuario(): Promise<{
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
      "id, usuario_id, nombre_tienda, propietario, subdominio, plan_actual, plantilla_id, color_principal, logo_url, descripcion, activa, created_at, diseno",
    )
    .eq("activa", true)
    .single();
  return (data ?? null) as Tienda | null;
}

// Alias legacy para lecturas de página (layout ya exige sesión).
// Las acciones de ESCRITURA deben usar requireTiendaDelUsuario().
export async function getTienda(): Promise<Tienda | null> {
  return getTiendaPublica();
}

// Perfil del dueño por id de auth.users (solo nombre público, sin PII sensible).
// Lee el perfil de InsForge Auth en vez de la tabla legacy public.usuarios.
export async function getUsuarioTienda(
  usuarioId?: string | null,
): Promise<{ email: string; nombre: string | null } | null> {
  if (!usuarioId) return null;
  const insforge = createServerClient({ cookies: await cookies() });
  const { data } = await insforge.auth.getProfile(usuarioId);
  if (!data) return null;
  const perfil = data as { email?: string; profile?: { name?: string } | null };
  return { email: perfil.email ?? "", nombre: perfil.profile?.name ?? null };
}


