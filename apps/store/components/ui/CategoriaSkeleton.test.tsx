import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import CategoriaSkeleton from "./CategoriaSkeleton";

describe("CategoriaSkeleton", () => {
  it("renderiza el número correcto de items por defecto", () => {
    const { container } = render(<CategoriaSkeleton />);

    const cards = container.querySelectorAll(".categoria-card");
    expect(cards).toHaveLength(6);
  });

  it("renderiza el número correcto de items personalizado", () => {
    const { container } = render(<CategoriaSkeleton count={3} />);

    const cards = container.querySelectorAll(".categoria-card");
    expect(cards).toHaveLength(3);
  });

  it("tiene atributos de accesibilidad correctos", () => {
    const { container } = render(<CategoriaSkeleton />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("aria-live", "polite");
  });

  it("tiene texto accesible oculto", () => {
    const { container } = render(<CategoriaSkeleton />);

    const textoOculto = container.querySelector(".sr-only");
    expect(textoOculto).toBeInTheDocument();
    expect(textoOculto).toHaveTextContent("Cargando categorías…");
  });

  it("los items tienen aria-hidden", () => {
    const { container } = render(<CategoriaSkeleton />);

    const cards = container.querySelectorAll(".categoria-card");
    cards.forEach((card) => {
      expect(card).toHaveAttribute("aria-hidden", "true");
    });
  });
});
