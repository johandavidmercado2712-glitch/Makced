"use client";

import { useRouter, useSearchParams } from "next/navigation"; //useRouter navergar por medio de codigo . useSearchParams leer los parametros despues de ? para el filtro
import { useTransition } from "react"; //controllar el rendimiento 
import { Search } from "lucide-react";

export default function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString()); //crea una copia de la url actual 
    if (term) {
      params.set("search", term); // Si el usuario escribió algo, agrega o actualiza el parámetro "search
    } else {
      params.delete("search"); // Si el campo está vacío, borra el parámetro de la URL
    }
    params.delete("page"); // un cambio de búsqueda reinicia la paginación
    startTransition(() => {
      router.replace(`/productos?${params.toString()}`); //actualiza con los nuevos parametros dentro de una transicio para el rendimiento 
    });
  }

  return (
    <div className="db-filter-input">
      <Search size={16} className="db-filter-input-icon" />
      <input
        type="text"
        placeholder="Buscar por nombre..."
        aria-label="Buscar productos"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && <span style={{ fontSize: 12, color: "var(--db-text-muted)" }}>...</span>}
    </div>
  );
}
