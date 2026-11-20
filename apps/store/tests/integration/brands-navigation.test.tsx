/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import HomeMarcas from "../../components/sections/HomeMarcas";
import Marcas from "../../components/sections/Marcas";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import type { MarcaSimple } from "../../types/database";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
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
  { id: "3", nombre: "Puma", logo_url: null, imagen_url: null },
  { id: "4", nombre: "New Balance", logo_url: "/nb.png", imagen_url: null },
];

async function renderHomeMarcas() {
  const jsx = await HomeMarcas();
  return render(jsx);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Flujo de navegación por marcas (integración)", () => {
  it("HomeMarcas hace fetch y muestra las marcas", async () => {
    mockGetMarcas.mockResolvedValue(marcasMock);

    await renderHomeMarcas();

    expect(mockGetMarcas).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[alt="Nike"]')).toBeInTheDocument();
    expect(document.querySelector('[alt="Adidas"]')).toBeInTheDocument();
    expect(document.querySelector('[alt="Puma"]')).toBeInTheDocument();
    expect(document.querySelector('[alt="New Balance"]')).toBeInTheDocument();
  });

  it("cada marca tiene un link a su página de productos", async () => {
    mockGetMarcas.mockResolvedValue(marcasMock);

    await renderHomeMarcas();

    const links = document.querySelectorAll(".marcas-card");
    expect(links[0]).toHaveAttribute(
      "href",
      "/s/makced/marcasProductos?slug=Nike",
    );
    expect(links[1]).toHaveAttribute(
      "href",
      "/s/makced/marcasProductos?slug=Adidas",
    );
    expect(links[3]).toHaveAttribute(
      "href",
      "/s/makced/marcasProductos?slug=New%20Balance",
    );
  });

  it("cada marca muestra su logo o placeholder", async () => {
    mockGetMarcas.mockResolvedValue(marcasMock);

    await renderHomeMarcas();

    const imagenes = document.querySelectorAll("img");
    expect(imagenes[0]).toHaveAttribute("src", "/nike.png");
    expect(imagenes[1]).toHaveAttribute("src", "/adidas.png");
    expect(imagenes[2]).toHaveAttribute("src", "/placeholder-marca.jpg");
    expect(imagenes[3]).toHaveAttribute("src", "/nb.png");
  });

  it("Marcas duplica las marcas para el carrusel infinito", () => {
    render(<Marcas initialMarcas={marcasMock} />);

    // 4 marcas × 2 = 8 links
    const links = document.querySelectorAll(".marcas-card");
    expect(links).toHaveLength(8);

    // Verificar que las primeras 4 y las últimas 4 son las mismas marcas
    expect(links[0]).toHaveAttribute("href", "/marcasProductos?slug=Nike");
    expect(links[4]).toHaveAttribute("href", "/marcasProductos?slug=Nike");
  });

  it("Breadcrumbs muestra la ruta de navegación por marca", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Marcas", href: "/marcas" },
          { label: "Nike" },
        ]}
      />,
    );

    // Primer item es link
    const linkInicio = screen.getByText("Inicio").closest("a");
    expect(linkInicio).toHaveAttribute("href", "/");

    // Segundo item es link
    const linkMarcas = screen.getByText("Marcas").closest("a");
    expect(linkMarcas).toHaveAttribute("href", "/marcas");

    // Último item es texto plano
    const ultimo = screen.getByText("Nike");
    expect(ultimo.closest("a")).toBeNull();
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

  it("Marcas maneja array vacío sin errores", () => {
    render(<Marcas initialMarcas={[]} />);

    const links = document.querySelectorAll(".marcas-card");
    expect(links).toHaveLength(0);
  });
});
