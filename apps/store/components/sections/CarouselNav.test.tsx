/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import CarouselNav from "./CarouselNav";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const slidesPersonalizados = [
  {
    palabra: "Calidad",
    parrafo: "Los mejores materiales",
    imagen: "/slide1.jpg",
  },
  {
    palabra: "Estilo",
    parrafo: "Diseño moderno",
    imagen: "/slide2.jpg",
  },
];

describe("CarouselNav", () => {
  it("renderiza todas las palabras de los slides", () => {
    render(<CarouselNav slides={slidesPersonalizados} />);

    const palabras = document.querySelectorAll(".text-rotate-word");
    expect(palabras).toHaveLength(2);
    expect(palabras[0]).toHaveTextContent("Calidad");
    expect(palabras[1]).toHaveTextContent("Estilo");
  });

  it("renderiza todos los párrafos de los slides", () => {
    render(<CarouselNav slides={slidesPersonalizados} />);

    const parrafos = document.querySelectorAll(".text-rotate-p-word");
    expect(parrafos).toHaveLength(2);
    expect(parrafos[0]).toHaveTextContent("Los mejores materiales");
    expect(parrafos[1]).toHaveTextContent("Diseño moderno");
  });

  it("renderiza todas las imágenes de los slides", () => {
    render(<CarouselNav slides={slidesPersonalizados} />);

    const imagenes = document.querySelectorAll(".carousel-nav-image img");
    expect(imagenes).toHaveLength(2);
    expect(imagenes[0]).toHaveAttribute("src", "/slide1.jpg");
    expect(imagenes[1]).toHaveAttribute("src", "/slide2.jpg");
  });

  it("usa slides por defecto cuando no se pasan props", () => {
    render(<CarouselNav />);

    const palabras = document.querySelectorAll(".text-rotate-word");
    expect(palabras.length).toBeGreaterThan(0);
  });

  it("usa slides por defecto cuando el array está vacío", () => {
    render(<CarouselNav slides={[]} />);

    const palabras = document.querySelectorAll(".text-rotate-word");
    expect(palabras.length).toBeGreaterThan(0);
  });

  it("cada slide tiene animationDelay configurado", () => {
    render(<CarouselNav slides={slidesPersonalizados} />);

    const palabras = document.querySelectorAll(".text-rotate-word");
    expect((palabras[0] as HTMLElement).style.animationDelay).toBe("0s");
    expect((palabras[1] as HTMLElement).style.animationDelay).toBe("4s");
  });

  it("tiene aria-label en el section", () => {
    const { container } = render(<CarouselNav slides={slidesPersonalizados} />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-label", "Presentación de la tienda");
  });

  it("el h1 tiene aria-label con la primera palabra", () => {
    render(<CarouselNav slides={slidesPersonalizados} />);

    const h1 = document.querySelector("h1");
    expect(h1).toHaveAttribute("aria-label", "Calidad");
  });

  it("las imágenes tienen aria-hidden", () => {
    render(<CarouselNav slides={slidesPersonalizados} />);

    const contenedorImagenes = document.querySelector(".carousel-nav-image");
    expect(contenedorImagenes).toHaveAttribute("aria-hidden", "true");
  });
});
