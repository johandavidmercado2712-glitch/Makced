import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import MarcasSkeleton from "./MarcasSkeleton";

describe("MarcasSkeleton", () => {
  it("renderiza el número correcto de items por defecto", () => {
    const { container } = render(<MarcasSkeleton />);

    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(8);
  });

  it("renderiza el número correcto de items personalizado", () => {
    const { container } = render(<MarcasSkeleton count={4} />);

    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(4);
  });

  it("tiene atributos de accesibilidad correctos", () => {
    const { container } = render(<MarcasSkeleton />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("aria-live", "polite");
  });

  it("tiene texto accesible oculto", () => {
    const { container } = render(<MarcasSkeleton />);

    const textoOculto = container.querySelector(".sr-only");
    expect(textoOculto).toBeInTheDocument();
    expect(textoOculto).toHaveTextContent("Cargando marcas…");
  });

  it("los items tienen aria-hidden", () => {
    const { container } = render(<MarcasSkeleton />);

    const cards = container.querySelectorAll(".card");
    cards.forEach((card) => {
      expect(card).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("cada card tiene la estructura correcta", () => {
    const { container } = render(<MarcasSkeleton count={1} />);

    const card = container.querySelector(".card");
    expect(card?.querySelector(".card-image")).not.toBeNull();
    expect(card?.querySelector(".card-info")).not.toBeNull();
    expect(card?.querySelector(".card-info-text")).not.toBeNull();
  });
});
