import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "@/components/Pagination";

const mockReplace = vi.fn();
const mockSearchParamsHolder = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => mockSearchParamsHolder.current,
}));

describe("Flujo de Paginación (integración)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsHolder.current = new URLSearchParams();
  });

  it("no renderiza cuando hay 1 página", () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza navegación con múltiples páginas", () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    expect(screen.getByRole("navigation", { name: "Paginación de productos" })).toBeInTheDocument();
  });

  it("flujo completo: navegar de página 1 a página 3", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={1} totalPages={5} />);

    // Página 1 activa
    expect(screen.getByRole("button", { name: "Página 1" })).toHaveClass("active");

    // Ir a página 2
    await user.click(screen.getByRole("button", { name: "Página 2" }));
    expect(mockReplace).toHaveBeenCalledWith("/productos?page=2");

    // Ir a página 5 (última, que sí está renderizada)
    await user.click(screen.getByRole("button", { name: "Página 5" }));
    expect(mockReplace).toHaveBeenCalledWith("/productos?page=5");
  });

  it("navegar con Anterior/Siguiente", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={5} />);

    // Anterior
    await user.click(screen.getByRole("button", { name: /Anterior/ }));
    expect(mockReplace).toHaveBeenCalledWith("/productos?page=2");

    // Siguiente
    await user.click(screen.getByRole("button", { name: /Siguiente/ }));
    expect(mockReplace).toHaveBeenCalledWith("/productos?page=4");
  });

  it("preserva searchParams al navegar", async () => {
    const user = userEvent.setup();
    mockSearchParamsHolder.current = new URLSearchParams("filter=active");
    render(<Pagination currentPage={1} totalPages={5} />);

    await user.click(screen.getByRole("button", { name: "Página 2" }));
    expect(mockReplace).toHaveBeenCalledWith("/productos?filter=active&page=2");
  });

  it("deshabilita Anterior en la primera página", () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
  });

  it("deshabilita Siguiente en la última página", () => {
    render(<Pagination currentPage={5} totalPages={5} />);
    expect(screen.getByRole("button", { name: /Siguiente/ })).toBeDisabled();
  });

  it("muestra puntos suspensivos para páginas lejanas", () => {
    render(<Pagination currentPage={5} totalPages={10} />);
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });
});
