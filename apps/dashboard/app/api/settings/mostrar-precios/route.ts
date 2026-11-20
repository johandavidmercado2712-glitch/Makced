import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';
import { requireAuth } from '@/actions/tienda';
import { revalidateTag } from 'next/cache';

/**
 * Invalida la caché de la tienda (aplicación Next.js separada en otro puerto).
 */
async function invalidarCacheTienda(tags: string[], tiendaId?: string): Promise<void> {
  const storeUrl = process.env.NEXT_PUBLIC_TIENDA_URL ?? 'http://localhost:3000';
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${storeUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ tags, tienda_id: tiendaId }),
    });
  } catch (error) {
    console.error('No se pudo invalidar caché de la tienda:', error);
  }
}

export async function POST(request: Request) {
  try {
    // Solo el dueño de la tienda puede cambiar este ajuste.
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      const status = authError === 'No autorizado. Inicia sesión.' ? 401 : 403;
      return NextResponse.json({ ok: false, error: authError }, { status });
    }

    const body = await request.json();
    const show = Boolean(body?.show);

    const server = createServerClient({ cookies: await cookies() });
    // Read-modify-write del jsonb: solo toca mostrar_precios, conserva el resto.
    const { data: actual, error: readError } = await server.database
      .from('tiendas')
      .select('diseno')
      .eq('id', tienda.id)
      .single();

    if (readError) {
      return NextResponse.json({ ok: false, error: readError.message }, { status: 500 });
    }

    const currentDiseno = actual?.diseno ?? {};
    const newDiseno = { ...(typeof currentDiseno === 'object' ? currentDiseno : {}), mostrar_precios: show };

    const { error } = await server.database
      .from('tiendas')
      .update({ diseno: newDiseno, updated_at: new Date().toISOString() })
      .eq('id', tienda.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Invalidar caché local y de la tienda
    revalidateTag('diseno', 'max');
    revalidateTag('tiendas', 'max');
    await invalidarCacheTienda(['diseno', 'tiendas'], tienda.id);

    return NextResponse.json({ ok: true, mostrar_precios: show });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
