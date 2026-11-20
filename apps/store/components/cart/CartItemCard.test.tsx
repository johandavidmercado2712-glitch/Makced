/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartItemCard from "./CartItemCard";
import type { CartItem } from "../../types/cart";
import { formatCOP } from "../../lib/format";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const textoCOP = (valor: number) => formatCOP(valor).replace(/\u00a0/g, " ");

const itemBase: CartItem = {
  id: "p1",
  slug: "air-jordan",
  nombre: "Air Jordan",
  precio: 189900,
  imagen_url: "/producto.jpg",
  cantidad: 2,
};

describe("CartItemCard", () => {
  it("muestra nombre, imagen, cantidad y precio total", () => {
    render(
      <CartItemCard
        item={itemBase}
        showPrices={true}
        isRemoving={false}
        onDecrease={vi.fn()}
        onIncrease={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Air Jordan")).toBeInTheDocument();
    const img = screen.getByAltText("Air Jordan");
    expect(img).toHaveAttribute("src", "/producto.jpg");
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(textoCOP(379800))).toBeInTheDocument();
  });

  it("oculta el precio cuando showPrices es false", () => {
    render(
      <CartItemCard
        item={itemBase}
        showPrices={false}
        isRemoving={false}
        onDecrease={vi.fn()}
        onIncrease={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByText(textoCOP(379800))).not.toBeInTheDocument();
    expect(screen.getByText("Air Jordan")).toBeInTheDocument();
  });

  it("muestra talla y color cuando existen", () => {
    render(
      <CartItemCard
        item={{ ...itemBase, talla: 42, color: "Negro" }}
        showPrices={true}
        isRemoving={false}
        onDecrease={vi.fn()}
        onIncrease={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Talla: 42")).toBeInTheDocument();
    expect(screen.getByText("Negro")).toBeInTheDocument();
  });

  it("no muestra talla ni color cuando no existen", () => {
    render(
      <CartItemCard
        item={itemBase}
        showPrices={true}
        isRemoving={false}
        onDecrease={vi.fn()}
        onIncrease={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Talla:/)).not.toBeInTheDocument();
    expect(screen.queryByText("Negro")).not.toBeInTheDocument();
  });

  it("llama onIncrease al hacer click en +", async () => {
    const user = userEvent.setup();
    const onIncrease = vi.fn();

    render(
      <CartItemCard
        item={itemBase}
        showPrices={true}
        isRemoving={false}
        onDecrease={vi.fn()}
        onIncrease={onIncrease}
        onRemove={vi.fn()}
      />,
    );

    const btnMas = screen.getByRole("button", { name: "Aumentar cantidad" });
    await user.click(btnMas);

    expect(onIncrease).toHaveBeenCalledTimes(1);
  });

  it("llama onDecrease al hacer click en -", async () => {
    const user = userEvent.setup();
    const onDecrease = vi.fn();

    render(
      <CartItemCard
        item={itemBase}
        showPrices={true}
        isRemoving={false}
        onDecrease={onDecrease}
        onIncrease={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const btnMenos = screen.getByRole("button", { name: "Reducir cantidad" });
    await user.click(btnMenos);

    expect(onDecrease).toHaveBeenCalledTimes(1);
  });

  it("llama onRemove al hacer click en eliminar", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <CartItemCard
        item={itemBase}
        showPrices={true}
        isRemoving={false}
        onDecrease={vi.fn()}
        onIncrease={vi.fn()}
        onRemove={onRemove}
      />,
    );

    const btnEliminar = screen.getByRole("button", {
      name: "Eliminar Air Jordan del carrito",
    });
    await user.click(btnEliminar);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("desactiva el botón de eliminar cuando isRemoving es true", () => {
    render(
      <CartItemCard
        item={itemBase}
        showPrices={true}
        isRemoving={true}
        onDecrease={vi.fn()}
        onIncrease={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const btnEliminar = screen.getByRole("button", {
      name: "Eliminar Air Jordan del carrito",
    });
    expect(btnEliminar).toBeDisabled();
  });

  it("aplica clase de remoción cuando isRemoving es true", () => {
    const { container } = render(
      <CartItemCard
        item={itemBase}
        showPrices={true}
        isRemoving={true}
        onDecrease={vi.fn()}
        onIncrease={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const card = container.querySelector(".carrito-product-card");
    expect(card).toHaveClass("carrito-product-card--removing");
  });
});
