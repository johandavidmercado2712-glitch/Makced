/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductoGaleria from "./ProductoGaleria";

vi.mock("next/image", () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

describe("ProductoGaleria", () => {
  it("renderiza la imagen principal", () => {
    render(
      <ProductoGaleria
        principal="/img1.jpg"
        referencias={[]}
        nombre="Air Jordan"
      />,
    );

    const img = screen.getByAltText("Air Jordan");
    expect(img).toHaveAttribute("src", "/img1.jpg");
    expect(img).toHaveClass("producto-imagen-principal");
  });

  it("no muestra miniaturas cuando solo hay una imagen", () => {
    const { container } = render(
      <ProductoGaleria
        principal="/img1.jpg"
        referencias={[]}
        nombre="Air Jordan"
      />,
    );

    const galeria = container.querySelector(".producto-galeria");
    expect(galeria).toBeNull();
  });

  it("muestra miniaturas cuando hay varias imágenes", () => {
    render(
      <ProductoGaleria
        principal="/img1.jpg"
        referencias={["/img2.jpg", "/img3.jpg"]}
        nombre="Air Jordan"
      />,
    );

    const miniaturas = screen.getAllByRole("button", {
      name: /Vista \d de Air Jordan/,
    });
    expect(miniaturas).toHaveLength(3);
  });

  it("la primera miniatura está activa por defecto", () => {
    render(
      <ProductoGaleria
        principal="/img1.jpg"
        referencias={["/img2.jpg"]}
        nombre="Air Jordan"
      />,
    );

    const primera = screen.getByRole("button", { name: "Vista 1 de Air Jordan" });
    expect(primera).toHaveAttribute("aria-pressed", "true");
    expect(primera).toHaveClass("is-active");

    const segunda = screen.getByRole("button", { name: "Vista 2 de Air Jordan" });
    expect(segunda).toHaveAttribute("aria-pressed", "false");
    expect(segunda).not.toHaveClass("is-active");
  });

  it("al hacer click en una miniatura cambia la imagen principal", async () => {
    const user = userEvent.setup();
    render(
      <ProductoGaleria
        principal="/img1.jpg"
        referencias={["/img2.jpg", "/img3.jpg"]}
        nombre="Air Jordan"
      />,
    );

    const imgPrincipal = screen.getByAltText("Air Jordan");
    expect(imgPrincipal).toHaveAttribute("src", "/img1.jpg");

    const miniatura3 = screen.getByRole("button", { name: "Vista 3 de Air Jordan" });
    await user.click(miniatura3);

    expect(imgPrincipal).toHaveAttribute("src", "/img3.jpg");
    expect(miniatura3).toHaveAttribute("aria-pressed", "true");
    expect(miniatura3).toHaveClass("is-active");
  });

  it("usa /producto.jpg como fallback cuando principal está vacío", () => {
    render(
      <ProductoGaleria principal="" referencias={[]} nombre="Air Jordan" />,
    );

    const img = screen.getByAltText("Air Jordan");
    expect(img).toHaveAttribute("src", "/producto.jpg");
  });

  it("ignora referencias vacías", () => {
    render(
      <ProductoGaleria
        principal="/img1.jpg"
        referencias={["", "/img2.jpg"]}
        nombre="Air Jordan"
      />,
    );

    const miniaturas = screen.getAllByRole("button", {
      name: /Vista \d de Air Jordan/,
    });
    // 2 imágenes (principal + img2), la vacía se filtra
    expect(miniaturas).toHaveLength(2);
  });
});
