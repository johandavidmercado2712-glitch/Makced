"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const irA = (pagina: number) => {
    if (pagina < 1 || pagina > totalPages || pagina === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    if (pagina <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(pagina));
    }
    startTransition(() => {
      router.replace(`/productos?${params.toString()}`);
    });
  };

  // 1 … (p-1) p (p+1) … N
  const cercanas = new Set<number>([1, totalPages]);
  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p >= 1 && p <= totalPages) cercanas.add(p);
  }
  const ordenadas = [...cercanas].sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  let anterior = 0;
  for (const p of ordenadas) {
    if (anterior && p - anterior > 1) items.push("…");
    items.push(p);
    anterior = p;
  }

  return (
    <nav className="db-pagination" aria-label="Paginación de productos">
      <button
        type="button"
        className="db-page-btn"
        onClick={() => irA(currentPage - 1)}
        disabled={isPending || currentPage <= 1}
      >
        <ChevronLeft size={14} /> Anterior
      </button>

      <div className="db-page-numbers">
        {items.map((item, i) =>
          item === "…" ? (
            <span key={`gap-${i}`} className="db-page-gap">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`db-page-num${item === currentPage ? " active" : ""}`}
              onClick={() => irA(item)}
              disabled={isPending}
              aria-current={item === currentPage ? "page" : undefined}
              aria-label={`Página ${item}`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className="db-page-btn"
        onClick={() => irA(currentPage + 1)}
        disabled={isPending || currentPage >= totalPages}
      >
        Siguiente <ChevronRight size={14} />
      </button>
    </nav>
  );
}
