/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import HomeMarcas from "./HomeMarcas";
import type { MarcaSimple } from "../../types/database";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const mockGetMarcas = vi.fn();

vi.mock("../../app/actions/store", () => ({
  getMarcas: (...args: unknown[]) => mockGetMarcas(...args),
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

const marcasMock: MarcaSimple[] = [
  { id: "1", nombre: "Nike", logo_url: "/nike.png", imagen_url: null },
  { id: "2", nombre: "Adidas", logo_url: "/adidas.png", imagen_url: null },
];

async function renderHomeMarcas() {
  const jsx = await HomeMarcas();
  return render(jsx);
}

describe("HomeMarcas", () => {
  it("hace fetch de marcas y las pasa al componente Marcas", async () => {
    mockGetMarcas.mockResolvedValue(marcasMock);

    await renderHomeMarcas();

    expect(mockGetMarcas).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[alt="Nike"]')).toBeInTheDocument();
    expect(document.querySelector('[alt="Adidas"]')).toBeInTheDocument();
  });

  it("maneja el caso cuando no hay marcas", async () => {
    mockGetMarcas.mockResolvedValue([]);

    await renderHomeMarcas();

    expect(mockGetMarcas).toHaveBeenCalledTimes(1);
    const links = document.querySelectorAll(".marcas-card");
    expect(links).toHaveLength(0);
  });

  it("renderiza la sección con aria-label", async () => {
    mockGetMarcas.mockResolvedValue(marcasMock);

    const { container } = await renderHomeMarcas();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-label", "Marcas destacadas");
  });
});
