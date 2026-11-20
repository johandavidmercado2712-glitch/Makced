import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import ProductGridSkeleton from "./ProductGridSkeleton";

// Mock de ProductCard para verificar que recibe loading=true
vi.mock("./ProductCard", () => ({
  default: ({ loading }: { loading?: boolean }) => (
    <div data-testid="product-card" data-loading={loading} />
  ),
}));

describe("ProductGridSkeleton", () => {
  it("renderiza el número correcto de cards por defecto", () => {
    const { container } = render(<ProductGridSkeleton />);

    const cards = container.querySelectorAll('[data-testid="product-card"]');
    expect(cards).toHaveLength(5);
  });

  it("renderiza el número correcto de cards personalizado", () => {
    const { container } = render(<ProductGridSkeleton count={3} />);

    const cards = container.querySelectorAll('[data-testid="product-card"]');
    expect(cards).toHaveLength(3);
  });

  it("cada card recibe loading=true", () => {
    const { container } = render(<ProductGridSkeleton count={2} />);

    const cards = container.querySelectorAll('[data-testid="product-card"]');
    cards.forEach((card) => {
      expect(card).toHaveAttribute("data-loading", "true");
    });
  });

  it("tiene la clase Productos-cards", () => {
    const { container } = render(<ProductGridSkeleton />);

    expect(container.querySelector(".Productos-cards")).not.toBeNull();
  });
});
