import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Verificar secreto compartido para seguridad
    const secret = request.headers.get("x-revalidate-secret");
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid secret" },
        { status: 401 }
      );
    }

    // Leer tags del body o usar defaults
    const body = await request.json().catch(() => ({}));
    const tags: string[] = body.tags ?? ["diseno", "tiendas"];
    const tiendaId: string | undefined = body.tienda_id;

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: "tags must be a non-empty array" },
        { status: 400 }
      );
    }

    // Invalidar cada tag
    for (const tag of tags) {
      revalidateTag(tag, "max");
    }

    // También invalidar paths específicos que pueden estar cacheados
    revalidatePath("/verProducto", "page");

    return NextResponse.json({
      success: true,
      revalidated: tags,
      tienda_id: tiendaId ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in revalidate endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
