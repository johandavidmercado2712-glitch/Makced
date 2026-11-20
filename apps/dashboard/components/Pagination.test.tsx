import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

const mockReplace = vi.fn();
const mockSearchParamsHolder = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParamsHolder.current,
}));

describe("Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsHolder.current = new URLSearchParams();
  });

  it("no renderiza nada cuando totalPages <= 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza la navegación cuando hay múltiples páginas", () => {
    render(<Pagination currentPage={1} totalPages={5} />);

    const nav = screen.getByRole("navigation", { name: "Paginación de productos" });
    expect(nav).toBeInTheDocument();
  });

  it("muestra botón Anterior deshabilitado en la primera página", () => {
    render(<Pagination currentPage={1} totalPages={5} />);

    const btnAnterior = screen.getByRole("button", { name: /Anterior/ });
    expect(btnAnterior).toBeDisabled();
  });

  it("muestra botón Siguiente deshabilitado en la última página", () => {
    render(<Pagination currentPage={5} totalPages={5} />);

    const btnSiguiente = screen.getByRole("button", { name: /Siguiente/ });
    expect(btnSiguiente).toBeDisabled();
  });

  it("muestra la página actual como activa", () => {
    render(<Pagination currentPage={3} totalPages={5} />);

    const btnPagina3 = screen.getByRole("button", { name: "Página 3" });
    expect(btnPagina3).toHaveClass("active");
    expect(btnPagina3).toHaveAttribute("aria-current", "page");
  });

  it("navega a la página anterior al hacer clic", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={5} />);

    const btnAnterior = screen.getByRole("button", { name: /Anterior/ });
    await user.click(btnAnterior);

    expect(mockReplace).toHaveBeenCalledWith("/productos?page=2");
  });

  it("navega a la página siguiente al hacer clic", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={5} />);

    const btnSiguiente = screen.getByRole("button", { name: /Siguiente/ });
    await user.click(btnSiguiente);

    expect(mockReplace).toHaveBeenCalledWith("/productos?page=4");
  });

  it("navega a una página específica al hacer clic", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={2} totalPages={5} />);

    const btnPagina3 = screen.getByRole("button", { name: "Página 3" });
    await user.click(btnPagina3);

    expect(mockReplace).toHaveBeenCalledWith("/productos?page=3");
  });

  it("elimina el parámetro page cuando se navega a la página 1", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={2} totalPages={5} />);

    const btnPagina1 = screen.getByRole("button", { name: "Página 1" });
    await user.click(btnPagina1);

    expect(mockReplace).toHaveBeenCalledWith("/productos?");
  });

  it("muestra puntos suspensivos para páginas lejanas", () => {
    render(<Pagination currentPage={5} totalPages={10} />);

    const gaps = screen.getAllByText("…");
    expect(gaps.length).toBeGreaterThan(0);
  });

  it("no navega si se hace clic en la página actual", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={5} />);

    const btnPagina3 = screen.getByRole("button", { name: "Página 3" });
    await user.click(btnPagina3);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("preserva los searchParams existentes al navegar", async () => {
    const user = userEvent.setup();
    mockSearchParamsHolder.current = new URLSearchParams("filter=active");
    render(<Pagination currentPage={1} totalPages={5} />);

    const btnPagina2 = screen.getByRole("button", { name: "Página 2" });
    await user.click(btnPagina2);

    expect(mockReplace).toHaveBeenCalledWith("/productos?filter=active&page=2");
  });
});
