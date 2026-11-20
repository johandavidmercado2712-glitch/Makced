import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchInput from "./SearchInput";

const buscarProductos = vi.hoisted(() => vi.fn());


vi.mock("@/app/actions/search", () =>
   ({ buscarEnTienda: buscarProductos }));

const resultado = {
  id: "p1",
  nombre: "Camiseta",
  precio: 100000,
  precio_descuento: null,
  imagen_url: null,
  slug: "camiseta",
};

describe("SearchInput", () => {
  beforeEach(() => {
    buscarProductos.mockReset();
  });

  it("no busca con menos de 2 caracteres", async () => {
    const user = userEvent.setup();
    render(<SearchInput onClose={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "a");
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(buscarProductos).not.toHaveBeenCalled();
  });

  it("busca con 2 o más caracteres y muestra el resultado", async () => {
    buscarProductos.mockResolvedValue([resultado]);
    const user = userEvent.setup();
    render(<SearchInput onClose={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "ca");
    await waitFor(() => expect(buscarProductos).toHaveBeenCalledWith("ca"));
    await waitFor(() => expect(screen.getByText("Camiseta")).toBeInTheDocument());
  });

  it("limpia los resultados al borrar hasta 1 carácter", async () => {
    buscarProductos.mockResolvedValue([resultado]);
    const user = userEvent.setup();
    render(<SearchInput onClose={vi.fn()} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "ca");
    await waitFor(() => expect(screen.getByText("Camiseta")).toBeInTheDocument());

    await user.type(input, "{backspace}");

    expect(screen.queryByText("Camiseta")).not.toBeInTheDocument();
  });

  it("no muestra resultados ni rompe si la búsqueda falla", async () => {
    buscarProductos.mockRejectedValue(new Error("sin red"));
    const user = userEvent.setup();
    render(<SearchInput onClose={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "ca");
    await waitFor(() => expect(buscarProductos).toHaveBeenCalledWith("ca"));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(screen.queryByText("Camiseta")).not.toBeInTheDocument();
  });

  it("limita el texto a 40 caracteres", () => {
    render(<SearchInput onClose={vi.fn()} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "40");
  });
});
