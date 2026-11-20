/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import HomeCategorias from "./HomeCategorias";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: ReactNode;
  }) => <a href={href}>{children}</a>,
}));

// Mock de ScrollReveal para no depender de IntersectionObserver
vi.mock("../ui/ScrollReveal", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const mockGetCategorias = vi.fn();

vi.mock("../../app/actions/store", () => ({
  getCategorias: (...args: unknown[]) => mockGetCategorias(...args),
}));

// jsdom no tiene headers()/cookies() de Next: requerirTienda() caería en
// notFound() (fail-closed de P0-2). El test necesita una tienda válida.
vi.mock("../../lib/tenant", async () => {
  const { combinarDiseno } = await import("@makced/db/diseno");
  const tienda = {
    id: "tienda-test",
    subdominio: "makced",
    nombreTienda: "Tienda de prueba",
    colorPrincipal: "#111111",
    logoUrl: null,
    config: combinarDiseno(null),
  };
  return {
    resolverTienda: async () => tienda,
    requerirTienda: async () => tienda,
    listarTiendasActivas: async () => [{ subdominio: "makced" }],
    subdominioSolicitado: async () => "makced",
  };
});

const categoriasMock = [
  { id: "1", nombre: "Running", slug: "running", imagen_url: "/running.jpg" },
  { id: "2", nombre: "Casual", slug: "casual", imagen_url: "/casual.jpg" },
  { id: "3", nombre: "Basketball", slug: "basketball", imagen_url: "/basketball.jpg" },
  { id: "4", nombre: "Training", slug: "training", imagen_url: "/training.jpg" },
  { id: "5", nombre: "Skate", slug: "skate", imagen_url: "/skate.jpg" },
];

async function renderHomeCategorias(titulo = "Categorías") {
  const jsx = await HomeCategorias({ titulo });
  return render(jsx);
}

describe("HomeCategorias", () => {
  it("renderiza el título de la sección", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias("Explora por categoría");

    expect(document.querySelector("h2")).toHaveTextContent(
      "Explora por categoría",
    );
  });

  it("muestra máximo 4 categorías", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias();

    const cards = document.querySelectorAll(".categoria-card");
    expect(cards).toHaveLength(4);
  });

  it("cada categoría tiene un link a su página", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias();

    const links = document.querySelectorAll(".categoria-cards a");
    expect(links[0]).toHaveAttribute(
      "href",
      "/s/makced/categoriaProductos?slug=running",
    );
    expect(links[1]).toHaveAttribute(
      "href",
      "/s/makced/categoriaProductos?slug=casual",
    );
  });

  it("cada categoría muestra su imagen o placeholder", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias();

    const imagenes = document.querySelectorAll("img");
    expect(imagenes[0]).toHaveAttribute("src", "/running.jpg");
  });

  it("usa placeholder cuando no hay imagen", async () => {
    const sinImagen = [
      { id: "1", nombre: "Running", slug: "running", imagen_url: null },
    ];
    mockGetCategorias.mockResolvedValue(sinImagen);

    await renderHomeCategorias();

    const imagen = document.querySelector("img");
    expect(imagen).toHaveAttribute("src", "/placeholder-categoria.jpg");
  });

  it("el link 'Ver Todas' apunta a /categoria con el conteo", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias();

    const verTodas = document.querySelector(
      ".categoria-titulo a",
    ) as HTMLAnchorElement;
    expect(verTodas).toHaveAttribute("href", "/s/makced/categoria");
    expect(verTodas).toHaveTextContent("Ver Todas (5)");
  });

  it("tiene aria-labelledby en el section", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    const { container } = await renderHomeCategorias();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "categorias-heading");
  });

  it("maneja el caso cuando no hay categorías", async () => {
    mockGetCategorias.mockResolvedValue([]);

    await renderHomeCategorias();

    const cards = document.querySelectorAll(".categoria-card");
    expect(cards).toHaveLength(0);
    expect(document.querySelector(".categoria-titulo a")).toHaveTextContent(
      "Ver Todas (0)",
    );
  });
});
