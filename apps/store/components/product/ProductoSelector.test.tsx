import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductoSelector from "./ProductoSelector";
import { CartProvider } from "../auth/CartContext";
import type { ProductoCart } from "@/types/cart";

const producto: ProductoCart & { colores?: { nombre: string; hex: string }[] } = {
  id: "p1",
  slug: "air-jordan",
  nombre: "Air Jordan",
  precio: 189900,
  precio_descuento: null,
  imagen_url: null,
  colores: [
    { nombre: "Negro", hex: "#111111" },
    { nombre: "Blanco", hex: "#ffffff" },
  ],
};

beforeEach(() => {
  localStorage.clear();
});

function renderConCarrito(ui: React.ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe("ProductoSelector", () => {
  it("renderiza los colores disponibles", () => {
    renderConCarrito(<ProductoSelector producto={producto} />);

    const btnNegro = screen.getByRole("button", { name: "Negro" });
    const btnBlanco = screen.getByRole("button", { name: "Blanco" });

    expect(btnNegro).toBeInTheDocument();
    expect(btnBlanco).toBeInTheDocument();
    expect(btnNegro).toHaveAttribute("aria-pressed", "false");
    expect(btnBlanco).toHaveAttribute("aria-pressed", "false");
  });

  it("al hacer click en un color lo selecciona", async () => {
    const user = userEvent.setup();
    renderConCarrito(<ProductoSelector producto={producto} />);

    const btnNegro = screen.getByRole("button", { name: "Negro" });
    await user.click(btnNegro);

    expect(btnNegro).toHaveAttribute("aria-pressed", "true");
    expect(btnNegro).toHaveClass("selected");

    const btnBlanco = screen.getByRole("button", { name: "Blanco" });
    expect(btnBlanco).toHaveAttribute("aria-pressed", "false");
  });

  it("renderiza las 12 tallas (35-46)", () => {
    renderConCarrito(<ProductoSelector producto={producto} />);

    for (let talla = 35; talla <= 46; talla++) {
      expect(
        screen.getByRole("button", { name: String(talla) }),
      ).toBeInTheDocument();
    }
  });

  it("al hacer click en una talla la selecciona", async () => {
    const user = userEvent.setup();
    renderConCarrito(<ProductoSelector producto={producto} />);

    const btn42 = screen.getByRole("button", { name: "42" });
    await user.click(btn42);

    expect(btn42).toHaveAttribute("aria-pressed", "true");
    expect(btn42).toHaveClass("selected");
  });

  it("muestra 'Selecciona una talla' cuando no hay talla seleccionada", () => {
    renderConCarrito(<ProductoSelector producto={producto} />);

    // El span de feedback (no el botón disabled)
    const mensaje = document.querySelector(".producto-talla-requerida");
    expect(mensaje).toBeInTheDocument();
    expect(mensaje).toHaveTextContent("Selecciona una talla");
    expect(mensaje).toHaveAttribute("aria-live", "polite");
  });

  it("oculta 'Selecciona una talla' después de seleccionar una", async () => {
    const user = userEvent.setup();
    renderConCarrito(<ProductoSelector producto={producto} />);

    // El span de feedback existe al inicio
    expect(document.querySelector(".producto-talla-requerida")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "40" }));

    // El span desaparece tras seleccionar talla
    expect(document.querySelector(".producto-talla-requerida")).toBeNull();
  });

  it("el botón de agregar está deshabilitado sin talla", () => {
    renderConCarrito(<ProductoSelector producto={producto} />);

    const btn = screen.getByRole("button", { name: "Selecciona una talla" });
    expect(btn).toBeDisabled();
  });

  it("pasa talla y color al carrito al agregar", async () => {
    const user = userEvent.setup();
    renderConCarrito(<ProductoSelector producto={producto} />);

    // Seleccionar color y talla
    await user.click(screen.getByRole("button", { name: "Negro" }));
    await user.click(screen.getByRole("button", { name: "42" }));

    // Agregar al carrito
    const btnAgregar = screen.getByRole("button", { name: "Agregar al carrito" });
    await user.click(btnAgregar);

    const guardado = JSON.parse(
      localStorage.getItem("makced-cart") ?? "[]",
    ) as Array<Record<string, unknown>>;
    expect(guardado).toHaveLength(1);
    expect(guardado[0]).toMatchObject({
      id: "p1",
      talla: 42,
      color: "Negro",
    });
  });

  it("no renderiza la sección de colores cuando el producto no tiene colores", () => {
    const sinColores = { ...producto, colores: undefined };
    const { container } = renderConCarrito(
      <ProductoSelector producto={sinColores} />,
    );

    const seccionColores = container.querySelector(".colores-swatches");
    expect(seccionColores?.children.length).toBe(0);
  });
});
