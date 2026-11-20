import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import ProductoDetalleSkeleton from "./ProductoDetalleSkeleton";

describe("ProductoDetalleSkeleton", () => {
  it("renderiza la estructura del skeleton", () => {
    const { container } = render(<ProductoDetalleSkeleton />);

    expect(container.querySelector(".ver-Producto")).not.toBeNull();
    expect(container.querySelector(".Producto-img")).not.toBeNull();
    expect(container.querySelector(".Producto-espeficacion")).not.toBeNull();
  });

  it("tiene atributos de accesibilidad correctos", () => {
    const { container } = render(<ProductoDetalleSkeleton />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("aria-live", "polite");
  });

  it("tiene texto accesible oculto", () => {
    const { container } = render(<ProductoDetalleSkeleton />);

    const textoOculto = container.querySelector(".sr-only");
    expect(textoOculto).toBeInTheDocument();
    expect(textoOculto).toHaveTextContent("Cargando producto…");
  });

  it("las partes decorativas tienen aria-hidden", () => {
    const { container } = render(<ProductoDetalleSkeleton />);

    const galeria = container.querySelector(".Producto-img");
    const info = container.querySelector(".Producto-espeficacion");

    expect(galeria).toHaveAttribute("aria-hidden", "true");
    expect(info).toHaveAttribute("aria-hidden", "true");
  });

  it("renderiza miniaturas de galería", () => {
    const { container } = render(<ProductoDetalleSkeleton />);

    const miniaturas = container.querySelectorAll(".producto-miniatura");
    expect(miniaturas).toHaveLength(4);
  });
});
