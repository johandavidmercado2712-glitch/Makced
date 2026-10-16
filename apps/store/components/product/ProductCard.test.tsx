/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ProductCard from "./ProductCard";

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

describe("ProductCard", () => {
  it("muestra el precio cuando se pasa la prop price", () => {
    render(<ProductCard name="Air Jordan" price="$189.900" />);
    expect(screen.getByText("$189.900")).toBeInTheDocument();
  });

  it("OCULTA el precio cuando price es undefined (mostrar_precios apagado)", () => {
    const { container } = render(
      <ProductCard name="Air Jordan" price={undefined} />,
    );
    expect(container.querySelector(".product-precio")).toBeNull();
    // la fila sigue existiendo (vacía) para no romper el layout
    expect(container.querySelector(".product-precio-fila")).not.toBeNull();
    expect(screen.getByText("Air Jordan")).toBeInTheDocument();
  });

  it("renderiza nombre, imagen por defecto y marca", () => {
    const { container } = render(
      <ProductCard name="Runner Pro" price="$95.000" />,
    );
    expect(screen.getByRole("heading", { name: "Runner Pro" })).toBeInTheDocument();
    const img = screen.getByRole("img", { name: "Runner Pro" });
    expect(img).toHaveAttribute("src", "/producto.jpg");
    expect(container.querySelector(".product-marca")).toHaveTextContent(
      "Deportivo",
    );
  });

  it("sin slug no genera enlace; con slug enlaza a verProducto", () => {
    const { rerender, container } = render(
      <ProductCard name="X" price="$1" />,
    );
    expect(container.querySelector("a")).toBeNull();

    rerender(<ProductCard name="X" price="$1" slug="nike-air-jordan" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/verProducto?slug=nike-air-jordan");
    expect(within(link).getByText("$1")).toBeInTheDocument();
  });

  it("modo loading muestra skeleton y nada de contenido", () => {
    const { container } = render(<ProductCard loading />);
    expect(container.querySelector(".skeleton")).not.toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(container.querySelector(".product-precio")).toBeNull();
  });
});
