"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

export default function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.replace(`/productos?${params.toString()}`);
    });
  }

  return (
    <div className="db-filter-input">
      <Search size={16} className="db-filter-input-icon" />
      <input
        type="text"
        placeholder="Buscar por nombre..."
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && <span style={{ fontSize: 12, color: "var(--db-text-muted)" }}>...</span>}
    </div>
  );
}
