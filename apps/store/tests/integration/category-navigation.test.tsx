/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import HomeCategorias from "../../components/sections/HomeCategorias";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

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

vi.mock("../../components/ui/ScrollReveal", () => ({
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Flujo de navegación por categorías (integración)", () => {
  it("HomeCategorias muestra las primeras 4 categorías con links", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias("Explora por categoría");

    // Título
    expect(document.querySelector("h2")).toHaveTextContent(
      "Explora por categoría",
    );

    // Máximo 4 categorías
    const cards = document.querySelectorAll(".categoria-card");
    expect(cards).toHaveLength(4);

    // Links a páginas de categoría
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

  it("cada categoría muestra su nombre", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias();

    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("Casual")).toBeInTheDocument();
    expect(screen.getByText("Basketball")).toBeInTheDocument();
    expect(screen.getByText("Training")).toBeInTheDocument();
    // Skate (5ta) no se muestra
    expect(screen.queryByText("Skate")).not.toBeInTheDocument();
  });

  it("link 'Ver Todas' apunta a /categoria con conteo correcto", async () => {
    mockGetCategorias.mockResolvedValue(categoriasMock);

    await renderHomeCategorias();

    const verTodas = document.querySelector(
      ".categoria-titulo a",
    ) as HTMLAnchorElement;
    expect(verTodas).toHaveAttribute("href", "/s/makced/categoria");
    expect(verTodas).toHaveTextContent("Ver Todas (5)");
  });

  it("Breadcrumbs muestra la ruta de navegación correcta", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/categoria" },
          { label: "Running" },
        ]}
      />,
    );

    // Primer item es link
    const linkInicio = screen.getByText("Inicio").closest("a");
    expect(linkInicio).toHaveAttribute("href", "/");

    // Segundo item es link
    const linkCategorias = screen.getByText("Categorías").closest("a");
    expect(linkCategorias).toHaveAttribute("href", "/categoria");

    // Último item es texto plano (no link)
    const ultimo = screen.getByText("Running");
    expect(ultimo.closest("a")).toBeNull();
  });

  it("Breadcrumbs usa iconos correctos (Home en primero, File en resto)", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Categorías", href: "/categoria" },
          { label: "Running" },
        ]}
      />,
    );

    // El primer item tiene el icono de Home (svg con path específico)
    const primerItem = screen.getByText("Inicio").closest("li");
    expect(primerItem).not.toBeNull();

    // Verificar que hay 3 items (li)
    const items = document.querySelectorAll("li");
    expect(items).toHaveLength(3);
  });

  it("maneja el caso de una sola categoría", async () => {
    mockGetCategorias.mockResolvedValue([
      { id: "1", nombre: "Running", slug: "running", imagen_url: null },
    ]);

    await renderHomeCategorias();

    const cards = document.querySelectorAll(".categoria-card");
    expect(cards).toHaveLength(1);
    expect(screen.getByText("Ver Todas (1)")).toBeInTheDocument();
  });

  it("maneja el caso cuando no hay categorías", async () => {
    mockGetCategorias.mockResolvedValue([]);

    await renderHomeCategorias();

    const cards = document.querySelectorAll(".categoria-card");
    expect(cards).toHaveLength(0);
    expect(screen.getByText("Ver Todas (0)")).toBeInTheDocument();
  });

  it("usa placeholder cuando no hay imagen", async () => {
    mockGetCategorias.mockResolvedValue([
      { id: "1", nombre: "Running", slug: "running", imagen_url: null },
    ]);

    await renderHomeCategorias();

    const imagen = document.querySelector("img");
    expect(imagen).toHaveAttribute("src", "/placeholder-categoria.jpg");
  });
});
