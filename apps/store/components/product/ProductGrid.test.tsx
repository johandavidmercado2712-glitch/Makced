/* eslint-disable @next/next/no-img-element */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductGrid from "./ProductGrid";
import { formatCOP } from "../../lib/format";

const textoCOP = (valor: number) =>
  formatCOP(valor).replace(/\u00a0/g, " ");

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

const productos = [
  {
    id: "p1",
    nombre: "Nike Revolution 7",
    precio: 95000,
    precio_descuento: null,
    imagen_url: "/hombre.jpg",
    slug: "nike-revolution-7",
    marca: "Nike",
  },
  {
    id: "p2",
    nombre: "Adidas Runner",
    precio: 120000,
    precio_descuento: null,
    imagen_url: null,
    slug: "adidas-runner",
    marca: "Adidas",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("integración: ProductGrid → ProductCard según config de la tienda", () => {
  it("sin precios cuando mostrar_precios=false (regresión del toggle)", async () => {
    const arbol = await ProductGrid({ productos, mostrarPrecios: false });
    render(arbol);

    expect(document.querySelectorAll(".product-precio")).toHaveLength(0);
    expect(screen.getByText("Nike Revolution 7")).toBeInTheDocument();
    expect(screen.getByText("Adidas Runner")).toBeInTheDocument();
  });

  it("precios en formato es-CO cuando mostrar_precios=true", async () => {
    const arbol = await ProductGrid({ productos, mostrarPrecios: true });
    render(arbol);

    expect(screen.getByText(textoCOP(95000))).toBeInTheDocument();
    expect(screen.getByText(textoCOP(120000))).toBeInTheDocument();
    expect(screen.getByText("Nike")).toBeInTheDocument();
    expect(screen.getByText("Adidas")).toBeInTheDocument();
  });
});
