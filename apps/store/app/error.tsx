"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en la tienda:", error);
  }, [error]);

  return (
    <section className="flex min-h-[65vh] items-center justify-center px-6 py-20">
      <div
        className="w-full max-w-md rounded-2xl border p-8 text-center"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          className="text-xs font-semibold tracking-[0.2em]"
          style={{ color: "var(--text-secondary)" }}
        >
          ALGO SALIÓ MAL
        </p>

        <h1
          className="mt-3 text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          No pudimos cargar esta página
        </h1>

        <p
          className="mt-3 text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Inténtalo de nuevo. Si el problema persiste, vuelve al inicio.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "var(--primary-mint)",
              color: "var(--on-action)",
            }}
          >
            <RotateCcw size={16} /> Reintentar
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
