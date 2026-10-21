import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

const STORAGE_KEY = "makced-cart";

const itemValido = {
  id: "p1",
  slug: "camiseta",
  nombre: "Camiseta",
  precio: 100000,
  imagen_url: "/producto.jpg",
  cantidad: 2,
};

type CartModule = typeof import("./CartContext");
let CartProvider!: CartModule["CartProvider"];
let useCart!: CartModule["useCart"];

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  const mod = await import("./CartContext");
  CartProvider = mod.CartProvider;
  useCart = mod.useCart;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CartContext", () => {
  it("descarta ítems inválidos y conserva los válidos", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        itemValido,
        { ...itemValido, id: "p2", cantidad: 0 },
        { ...itemValido, id: "p3", precio: -1 },
        null,
      ])
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe("p1");
    expect(result.current.subtotal).toBe(200000);
  });

  it("usa un carrito vacío si el JSON está corrupto", () => {
    localStorage.setItem(STORAGE_KEY, "{no-es-json");

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
  });

  it("usa un carrito vacío si la raíz no es un arreglo", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }));

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
  });

  it("sigue funcionando en memoria si localStorage.setItem falla", () => {
    localStorage.setItem(STORAGE_KEY, "[]");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Cuota excedida", "QuotaExceededError");
    });

    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addItem({
        id: "p1",
        slug: "camiseta",
        nombre: "Camiseta",
        precio: 100000,
        precio_descuento: null,
        imagen_url: null,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
  });

  it("no rompe si localStorage no está disponible", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage bloqueado");
    });

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
  });
});
