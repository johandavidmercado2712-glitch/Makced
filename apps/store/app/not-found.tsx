import Link from "next/link";

export const metadata = {
  title: "Página no encontrada | MakcedStore",
};

export default function NotFound() {
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
          ERROR 404
        </p>

        <h1
          className="mt-3 text-2xl font-bold sm:text-3xl"
          style={{ color: "var(--text-primary)" }}
        >
          Esta página no existe
        </h1>

        <p
          className="mt-3 text-sm leading-6"
          style={{ color: "var(--text-secondary)" }}
        >
          El enlace que seguiste puede estar roto o el producto ya no está disponible.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--primary-mint)",
            color: "var(--on-action)",
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
