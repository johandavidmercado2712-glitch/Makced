import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ScrollReveal from "./ScrollReveal";

// Mock del hook useScrollReveal para no depender de IntersectionObserver
vi.mock("../../hooks/useScrollReveal", () => ({
  useScrollReveal: () => ({ current: document.createElement("div") }),
}));

describe("ScrollReveal", () => {
  it("renderiza los children", () => {
    render(
      <ScrollReveal>
        <p>Contenido de prueba</p>
      </ScrollReveal>,
    );

    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  it("aplica la clase scroll-reveal", () => {
    const { container } = render(
      <ScrollReveal>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("scroll-reveal");
  });

  it("combina clase personalizada con scroll-reveal", () => {
    const { container } = render(
      <ScrollReveal className="mi-clase">
        <p>Contenido</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("scroll-reveal");
    expect(wrapper).toHaveClass("mi-clase");
  });

  it("aplica transitionDelay según la prop delay", () => {
    const { container } = render(
      <ScrollReveal delay={200}>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transitionDelay).toBe("200ms");
  });

  it("delay por defecto es 0", () => {
    const { container } = render(
      <ScrollReveal>
        <p>Contenido</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transitionDelay).toBe("0ms");
  });
});
