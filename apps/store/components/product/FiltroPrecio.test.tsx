import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FiltroPrecio from "./FiltroPrecio";

const navegacion = vi.hoisted(() => ({
  replace: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navegacion.replace }),
  useSearchParams: () => navegacion.params,
}));

describe("FiltroPrecio", () => {
  beforeEach(() => {
    navegacion.replace.mockClear();
    navegacion.params = new URLSearchParams();
  });

  it("muestra la etiqueta 'hasta $X' con el máximo por defecto", () => {
    render(<FiltroPrecio maxPrice={100000} />);
    expect(screen.getByText("hasta $100.000")).toBeInTheDocument();
  });

  it("parte del maxPrice de la URL si existe", () => {
    navegacion.params = new URLSearchParams("maxPrice=50000");
    render(<FiltroPrecio maxPrice={100000} />);
    expect(screen.getByText("hasta $50.000")).toBeInTheDocument();
  });

  it("rechaza valores mayores al máximo y no navega", async () => {
    const user = userEvent.setup();
    render(<FiltroPrecio maxPrice={100000} />);
    const input = screen.getByLabelText("Precio máximo");

    await user.clear(input);
    await user.type(input, "999999");
    await user.tab();

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("filtro-precio-input--error");
    expect(navegacion.replace).not.toHaveBeenCalled();
  });

  it("al confirmar un valor válido setea maxPrice en la URL", async () => {
    const user = userEvent.setup();
    render(<FiltroPrecio maxPrice={100000} />);
    const input = screen.getByLabelText("Precio máximo");

    await user.clear(input);
    await user.type(input, "50000");
    await user.tab();

    expect(navegacion.replace).toHaveBeenCalledWith("?maxPrice=50000", {
      scroll: false,
    });
  });

  it("al confirmar el máximo exacto borra el parámetro de la URL", async () => {
    const user = userEvent.setup();
    render(<FiltroPrecio maxPrice={100000} />);
    const input = screen.getByLabelText("Precio máximo");

    await user.clear(input);
    await user.type(input, "100000");
    await user.tab();

    expect(navegacion.replace).toHaveBeenCalledWith("?", { scroll: false });
  });
});
