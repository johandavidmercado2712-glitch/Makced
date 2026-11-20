import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddToCartButton from "./AddToCartButton";
import { CartProvider } from "../auth/CartContext";
import type { ProductoCart } from "@/types/cart";

const producto: ProductoCart = {
  id: "p1",
  slug: "air-jordan",
  nombre: "Air Jordan",
  precio: 189900,
  precio_descuento: null,
  imagen_url: null,
};

beforeEach(() => {
  localStorage.clear();
});

function renderConCarrito(ui: React.ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe("AddToCartButton", () => {
  it("renderiza el botón con texto 'Agregar al carrito'", () => {
    renderConCarrito(<AddToCartButton producto={producto} />);

    expect(
      screen.getByRole("button", { name: "Agregar al carrito" }),
    ).toBeInTheDocument();
  });

  it("al hacer click agrega el producto al carrito", async () => {
    const user = userEvent.setup();
    renderConCarrito(<AddToCartButton producto={producto} />);

    const btn = screen.getByRole("button", { name: "Agregar al carrito" });
    await user.click(btn);

    const guardado = JSON.parse(
      localStorage.getItem("makced-cart") ?? "[]",
    ) as Array<Record<string, unknown>>;
    expect(guardado).toHaveLength(1);
    expect(guardado[0]).toMatchObject({
      id: "p1",
      nombre: "Air Jordan",
      precio: 189900,
      cantidad: 1,
    });
  });

  it("pasa talla y color correctamente al carrito", async () => {
    const user = userEvent.setup();
    renderConCarrito(
      <AddToCartButton producto={producto} talla={42} color="Negro" />,
    );

    const btn = screen.getByRole("button", { name: "Agregar al carrito" });
    await user.click(btn);

    const guardado = JSON.parse(
      localStorage.getItem("makced-cart") ?? "[]",
    ) as Array<Record<string, unknown>>;
    expect(guardado[0]).toMatchObject({
      id: "p1",
      talla: 42,
      color: "Negro",
    });
  });

  it("cuando disabled=true muestra 'Selecciona una talla' y no agrega al carrito", async () => {
    const user = userEvent.setup();
    renderConCarrito(<AddToCartButton producto={producto} disabled={true} />);

    expect(
      screen.getByRole("button", { name: "Selecciona una talla" }),
    ).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: "Selecciona una talla" });
    expect(btn).toBeDisabled();
    await user.click(btn);

    const guardado = localStorage.getItem("makced-cart");
    expect(guardado).toBeNull();
  });

  it("muestra estado 'Agregado' temporalmente después de hacer click", async () => {
    const user = userEvent.setup();
    renderConCarrito(<AddToCartButton producto={producto} />);

    const btn = screen.getByRole("button", { name: "Agregar al carrito" });
    await user.click(btn);

    expect(btn).toHaveTextContent("Agregado");
    expect(btn).toHaveAttribute("class", expect.stringContaining("cta-btn--added"));
  });
});
