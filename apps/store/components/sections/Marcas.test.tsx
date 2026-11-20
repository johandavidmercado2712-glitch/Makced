/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import Marcas from "./Marcas";
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

const marcasMock: MarcaSimple[] = [
  { id: "1", nombre: "Nike", logo_url: "/nike.png", imagen_url: null },
  { id: "2", nombre: "Adidas", logo_url: "/adidas.png", imagen_url: null },
  { id: "3", nombre: "Puma", logo_url: null, imagen_url: null },
];

describe("Marcas", () => {
  it("renderiza las marcas iniciales", () => {
    render(<Marcas initialMarcas={marcasMock} />);

    expect(document.querySelector('[alt="Nike"]')).toBeInTheDocument();
    expect(document.querySelector('[alt="Adidas"]')).toBeInTheDocument();
    expect(document.querySelector('[alt="Puma"]')).toBeInTheDocument();
  });

  it("duplica las marcas para el carrusel infinito", () => {
    render(<Marcas initialMarcas={marcasMock} />);

    // 3 marcas × 2 = 6 elementos
    const links = document.querySelectorAll(".marcas-card");
    expect(links).toHaveLength(6);
  });

  it("cada marca tiene un link correcto", () => {
    render(<Marcas initialMarcas={marcasMock} />);

    const links = document.querySelectorAll(".marcas-card");
    expect(links[0]).toHaveAttribute(
      "href",
      "/marcasProductos?slug=Nike",
    );
    expect(links[1]).toHaveAttribute(
      "href",
      "/marcasProductos?slug=Adidas",
    );
    expect(links[2]).toHaveAttribute(
      "href",
      "/marcasProductos?slug=Puma",
    );
  });

  it("cada marca muestra su logo o placeholder", () => {
    render(<Marcas initialMarcas={marcasMock} />);

    const imagenes = document.querySelectorAll("img");
    expect(imagenes[0]).toHaveAttribute("src", "/nike.png");
    expect(imagenes[1]).toHaveAttribute("src", "/adidas.png");
    expect(imagenes[2]).toHaveAttribute("src", "/placeholder-marca.jpg");
  });

  it("maneja el caso cuando no hay marcas", () => {
    render(<Marcas initialMarcas={[]} />);

    const links = document.querySelectorAll(".marcas-card");
    expect(links).toHaveLength(0);
  });

  it("tiene aria-label en el section", () => {
    const { container } = render(<Marcas initialMarcas={marcasMock} />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-label", "Marcas destacadas");
  });

  it("encoda correctamente nombres con espacios en el link", () => {
    const marcasConEspacios: MarcaSimple[] = [
      { id: "1", nombre: "New Balance", logo_url: null, imagen_url: null },
    ];

    render(<Marcas initialMarcas={marcasConEspacios} />);

    const link = document.querySelector(".marcas-card");
    expect(link).toHaveAttribute(
      "href",
      "/marcasProductos?slug=New%20Balance",
    );
  });
});
