"use client";

import { useTransition } from "react";
import { setTiendaActiva } from "@/actions/tienda";

export default function StoreSelector({
  tiendas,
  activaId,
}: {
  tiendas: { id: string; nombre_tienda: string; subdominio: string }[];
  activaId: string | null;
}) {
  const [pending, startTransition] = useTransition();
  if (tiendas.length <= 1) return null;

  return (
    <div className="store-selector" style={{ padding: "8px 12px" }}>
      <label htmlFor="store-select" style={{ fontSize: 12, opacity: 0.7 }}>
        Tienda
      </label>
      <select
        id="store-select"
        disabled={pending}
        value={activaId ?? tiendas[0].id}
        onChange={(e) => {
          startTransition(async () => {
            await setTiendaActiva(e.target.value);
            window.location.reload();
          });
        }}
        style={{ width: "100%", marginTop: 4 }}
      >
        {tiendas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre_tienda} ({t.subdominio})
          </option>
        ))}
      </select>
    </div>
  );
}
