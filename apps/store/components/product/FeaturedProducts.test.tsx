/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import FeaturedProducts from "./FeaturedProducts";
import { CartProvider } from "../auth/CartContext";
import type { ProductoCardData } from "../../types/store";
import { formatCOP } from "../../lib/format";

// ─── Mocks ────────────────────────────────────────────────────

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

// Mock de la server action
const mockGetProductosDestacados = vi.fn();

vi.mock("../../app/actions/products", () => ({
  getProductosDestacados: (...args: unknown[]) =>
    mockGetProductosDestacados(...args),
}));

// jsdom no tiene headers()/cookies() de Next: requerirTienda() caería en
// notFound() (ese es el fail-closed de P0-2). Para probar el render hace
// falta entregarle una tienda válida.
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

// Mock de ScrollReveal para no depender de IntersectionObserver
vi.mock("../ui/ScrollReveal", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// ─── Datos de prueba ──────────────────────────────────────────

const productosDestacados: ProductoCardData[] = [
  {
    id: "p1",
    nombre: "Air Jordan 1",
    precio: 250000,
    precio_descuento: null,
    imagen_url: "/jordan.jpg",
    slug: "air-jordan-1",
    marca: "Nike",
  },
  {
    id: "p2",
    nombre: "Ultraboost 22",
    precio: 320000,
    precio_descuento: 280000,
    imagen_url: "/ultraboost.jpg",
    slug: "ultraboost-22",
    marca: "Adidas",
  },
];

const textoCOP = (valor: number) =>
  formatCOP(valor).replace(/\u00a0/g, " ");

// FeaturedProducts es un async Server Component: lo llamamos como función
// y renderizamos el JSX resultante dentro del CartProvider.
async function renderFeatured(props?: Parameters<typeof FeaturedProducts>[0]) {
  const jsx = await FeaturedProducts(props ?? {});
  return render(<CartProvider>{jsx}</CartProvider>);
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe("FeaturedProducts", () => {
  it("renderiza los productos destacados", async () => {
    mockGetProductosDestacados.mockResolvedValue(productosDestacados);

    await renderFeatured();

    expect(screen.getByText("Air Jordan 1")).toBeInTheDocument();
    expect(screen.getByText("Ultraboost 22")).toBeInTheDocument();
    expect(screen.getByText("Nike")).toBeInTheDocument();
    expect(screen.getByText("Adidas")).toBeInTheDocument();
  });

  it("muestra los precios cuando mostrarPrecios es true", async () => {
    mockGetProductosDestacados.mockResolvedValue(productosDestacados);

    await renderFeatured({ mostrarPrecios: true });

    expect(screen.getByText(textoCOP(250000))).toBeInTheDocument();
    expect(screen.getByText(textoCOP(280000))).toBeInTheDocument();
  });

  it("oculta los precios cuando mostrarPrecios es false", async () => {
    mockGetProductosDestacados.mockResolvedValue(productosDestacados);

    const { container } = await renderFeatured({ mostrarPrecios: false });

    expect(container.querySelector(".product-precio")).toBeNull();
    expect(screen.getByText("Air Jordan 1")).toBeInTheDocument();
  });

  it("renderiza la lista vacía sin errores", async () => {
    mockGetProductosDestacados.mockResolvedValue([]);

    const { container } = await renderFeatured();

    const grid = container.querySelector(".Productos-cards");
    expect(grid).not.toBeNull();
    expect(grid?.children.length).toBe(0);
  });

  it("cada producto enlaza a su página de detalle", async () => {
    mockGetProductosDestacados.mockResolvedValue(productosDestacados);

    await renderFeatured();

    const linkJordan = screen.getByRole("link", { name: /Air Jordan 1/ });
    expect(linkJordan).toHaveAttribute(
      "href",
      "/verProducto?slug=air-jordan-1",
    );

    const linkUltraboost = screen.getByRole("link", { name: /Ultraboost 22/ });
    expect(linkUltraboost).toHaveAttribute(
      "href",
      "/verProducto?slug=ultraboost-22",
    );
  });
});
