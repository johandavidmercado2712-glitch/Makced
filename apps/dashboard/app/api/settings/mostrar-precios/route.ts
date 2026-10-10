import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';
import { requireTiendaDelUsuario } from '@/actions/tienda';

export async function POST(request: Request) {
  try {
    // Solo el dueño de la tienda puede cambiar este ajuste.
    const { tienda, error: authError } = await requireTiendaDelUsuario();
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

    return NextResponse.json({ ok: true, mostrar_precios: show });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
