/* eslint-disable @next/next/no-img-element */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductGrid from "./ProductGrid";
import { getConfigDiseno } from "../../app/actions/store";
import { combinarDiseno } from "@makced/db/diseno";

vi.mock("../../app/actions/store", () => ({
  getConfigDiseno: vi.fn(),
}));

// ScrollReveal usa IntersectionObserver (no existe en jsdom)
vi.mock("../ui/ScrollReveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const mockedConfig = vi.mocked(getConfigDiseno);

const productos = [
  {
    id: "p1",
    nombre: "Nike Revolution 7",
    precio: 95000,
    imagen_url: "/hombre.jpg",
    slug: "nike-revolution-7",
  },
  {
    id: "p2",
    nombre: "Adidas Runner",
    precio: 120000,
    imagen_url: null,
    slug: "adidas-runner",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("integración: ProductGrid → ProductCard según config de la tienda", () => {
  it("sin precios cuando mostrar_precios=false (regresión del toggle)", async () => {
    mockedConfig.mockResolvedValue({
      id: null,
      colorPrincipal: "#4CE1AC",
      logoUrl: null,
      config: combinarDiseno({ mostrar_precios: false }),
    });

    const arbol = await ProductGrid({ productos });
    render(arbol);

    expect(document.querySelectorAll(".product-precio")).toHaveLength(0);
    expect(screen.getByText("Nike Revolution 7")).toBeInTheDocument();
    expect(screen.getByText("Adidas Runner")).toBeInTheDocument();
  });

  it("precios en formato es-CO cuando mostrar_precios=true", async () => {
    mockedConfig.mockResolvedValue({
      id: null,
      colorPrincipal: "#4CE1AC",
      logoUrl: null,
      config: combinarDiseno({ mostrar_precios: true }),
    });

    const arbol = await ProductGrid({ productos });
    render(arbol);

    expect(screen.getByText("$95.000")).toBeInTheDocument();
    expect(screen.getByText("$120.000")).toBeInTheDocument();
    expect(mockedConfig).toHaveBeenCalledTimes(1);
  });
});
