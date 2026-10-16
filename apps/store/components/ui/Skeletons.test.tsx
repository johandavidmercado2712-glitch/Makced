import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoriaSkeleton from "./CategoriaSkeleton";
import MarcasSkeleton from "./MarcasSkeleton";
import ProductoDetalleSkeleton from "./ProductoDetalleSkeleton";

describe("Skeletons del store (daisyUI)", () => {
  it("CategoriaSkeleton pinta la rejilla real con siluetas y role=status", () => {
    const { container } = render(<CategoriaSkeleton count={4} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status.className).toContain("categoria-cards");
    expect(container.querySelectorAll(".categoria-card")).toHaveLength(4);
    expect(container.querySelectorAll(".skeleton")).toHaveLength(4);
  });

  it("MarcasSkeleton replica la estructura .card y oculta las filas ficticias", () => {
    const { container } = render(<MarcasSkeleton count={3} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll(".card")).toHaveLength(3);
    expect(container.querySelectorAll(".card[aria-hidden='true']")).toHaveLength(3);
    expect(container.querySelectorAll(".card-image .skeleton")).toHaveLength(3);
  });

  it("ProductoDetalleSkeleton muestra galería (1 + 4) e info sin contenido real", () => {
    const { container } = render(<ProductoDetalleSkeleton />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector(".producto-imagen-principal.skeleton")).not.toBeNull();
    expect(container.querySelectorAll(".producto-miniatura.skeleton")).toHaveLength(4);
    expect(screen.getByText("Cargando producto…")).toBeInTheDocument();
  });
});
