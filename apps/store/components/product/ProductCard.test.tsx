/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "./ProductCard";
import { CartProvider } from "../auth/CartContext";
import { formatCOP } from "../../lib/format";
import type { ProductoCardData } from "../../types/store";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
  }) => <img src={src} alt={alt} />,
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

const producto: ProductoCardData = {
  id: "p1",
  nombre: "Air Jordan",
  precio: 189900,
  precio_descuento: null,
  imagen_url: null,
  slug: "air-jordan",
  marca: "Nike",
};

const textoCOP = (valor: number) =>
  formatCOP(valor).replace(/\u00a0/g, " ");

beforeEach(() => {
  localStorage.clear();
});

describe("ProductCard", () => {
  it("muestra precio, marca y nombre", () => {
    render(<ProductCard producto={producto} />);

    expect(screen.getByText(textoCOP(189900))).toBeInTheDocument();
    expect(screen.getByText("Nike")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Air Jordan" }),
    ).toBeInTheDocument();
  });

  it("muestra el precio efectivo y tacha el original con descuento", () => {
    const { container } = render(
      <ProductCard
        producto={{ ...producto, precio_descuento: 150000 }}
      />,
    );

    expect(screen.getByText(textoCOP(150000))).toBeInTheDocument();
    const original = container.querySelector(".product-precio-original");
    expect(original).toHaveTextContent(textoCOP(189900));
  });

  it("OCULTA el precio cuando mostrarPrecios es false", () => {
    const { container } = render(
      <ProductCard producto={producto} mostrarPrecios={false} />,
    );

    expect(container.querySelector(".product-precio")).toBeNull();
    expect(screen.getByText("Air Jordan")).toBeInTheDocument();
  });

  it("sin slug no genera enlace; con slug enlaza a verProducto", () => {
    const { rerender, container } = render(
      <ProductCard producto={{ ...producto, slug: null }} />,
    );
    expect(container.querySelector("a")).toBeNull();

    rerender(<ProductCard producto={producto} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/verProducto?slug=air-jordan");
    expect(within(link).getByText("Air Jordan")).toBeInTheDocument();
  });

  it("el botón de carrito agrega el producto sin talla ni color", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductCard producto={producto} />
      </CartProvider>,
    );

    const boton = screen.getByRole("button", {
      name: "Añadir Air Jordan al carrito",
    });
    await user.click(boton);

    const guardado = JSON.parse(
      localStorage.getItem("makced-cart") ?? "[]",
    ) as Array<Record<string, unknown>>;
    expect(guardado).toHaveLength(1);
    expect(guardado[0]).toMatchObject({
      id: "p1",
      nombre: "Air Jordan",
      precio: 189900,
      cantidad: 1,
    });
    expect(guardado[0].talla).toBeUndefined();
    expect(guardado[0].color).toBeUndefined();
    expect(boton).toHaveAttribute("title", "Agregado");
  });

  it("modo loading muestra skeleton y nada de contenido", () => {
    const { container } = render(<ProductCard loading />);
    expect(container.querySelector(".skeleton")).not.toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(container.querySelector(".product-precio")).toBeNull();
  });
});
