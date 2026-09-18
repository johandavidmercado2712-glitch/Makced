"use server";
import { insforge } from "@/lib/insforge";

export async function getPedidosRecientes() {
  const { data } = await insforge.database
    .from("pedidos")
    .select("id, cliente_nombre, total, estado_pedido, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  return data || [];
}
