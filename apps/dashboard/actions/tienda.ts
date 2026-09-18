"use server";
import { insforge } from "@/lib/insforge";

export async function getTienda() {
    const { data } = await insforge.database
    .from ("tiendas")
    .select (`id , nombre_tienda , propietario , subdominio , plan_actual , color_principal , logo_url , descripcion , activa , created_at `)
    .single()
    return data
}


