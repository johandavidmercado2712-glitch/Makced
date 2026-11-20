import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CarritoPage from "./page";
import { CartProvider } from "../../components/auth/CartContext";
import ProductoSelector from "../../components/product/ProductoSelector";
import type { CartItem, ProductoCart } from "../../types/cart";

// next/link → <a> plano (sin router de App)
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

// insforge del carrito: mock que retorna un número de WhatsApp
// para que el enlace de WhatsApp tenga href en los tests
vi.mock("../../lib/insforge", () => {
  const query = {
    select: () => query,     // ← devuelve el MISMO objeto
    eq: () => query,         // ← devuelve el MISMO objeto
    maybeSingle: () =>
      Promise.resolve({ data: { whatsapp_numero: "573001234567" } }),
  };
  return { insforge: { database: { from: () => query } } };
}); 

// Intl es-CO emite NBSP (u00a0) tras el signo "$"; RTL lo colapsa a espacio
// normal al normalizar, así que el matcher usa el mismo texto plano.
const cop = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  })
    .format(valor)
    .replace(/\u00a0/g, " ");

const producto: ProductoCart & {
  colores?: { nombre: string; hex: string }[];
} = {
  id: "p1",
  slug: "nike-revolution-7",
  nombre: "Nike Revolution 7",
  precio: 95000,
  precio_descuento: null,
  imagen_url: "/hombre.jpg",
  colores: [{ nombre: "Negro", hex: "#111111" }],
};

const item = (sobrescribir: Partial<CartItem> = {}): CartItem => ({
  id: "p1",
  slug: "nike-revolution-7",
  nombre: "Nike Revolution 7",
  precio: 95000,
  imagen_url: "/hombre.jpg",
  cantidad: 1,
  talla: 40,
  ...sobrescribir,
});

const sembrar = (items: CartItem[]) =>
  localStorage.setItem("makced-cart", JSON.stringify(items));

const montar = (showPrices = true, conSelector = false) =>
  render(
    <CartProvider showPrices={showPrices}>
      {conSelector && <ProductoSelector producto={producto} />}
      <CarritoPage />
    </CartProvider>,
  );

beforeEach(() => {
  localStorage.clear();
});

describe("integración: ProductoSelector → CartProvider → carrito", () => {
  it("flujo completo: validar talla, agregar y ver el resumen con precios", async () => {
    const user = userEvent.setup();
    montar(true, true);

    // Esperar a que el componente se hidrate (deje de mostrar skeletons)
    await waitFor(() => {
      expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Selecciona una talla" }),
    ).toBeDisabled();
    expect(
      document.querySelector(".producto-talla-requerida"),
    ).toBeInTheDocument();

    // elegir talla y color → el CTA se habilita
    await user.click(screen.getByRole("button", { name: "40" }));
    await user.click(screen.getByRole("button", { name: "Negro" }));
    const cta = screen.getByRole("button", { name: "Agregar al carrito" });
    expect(cta).toBeEnabled();

    // agregar → feedback + el carrito (contexto compartido) se actualiza
    await user.click(cta);
    expect(
      screen.getByRole("button", { name: /Agregado/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nike Revolution 7")).toBeInTheDocument();
    expect(screen.getByText("Talla: 40")).toBeInTheDocument();
    expect(screen.getByText("Negro")).toBeInTheDocument();

    // persistencia en localStorage
    const guardado = JSON.parse(localStorage.getItem("makced-cart") ?? "[]");
    expect(guardado).toHaveLength(1);
    expect(guardado[0]).toMatchObject({ id: "p1", talla: 40, color: "Negro" });

    // resumen: subtotal + envío normal (subtotal < 200.000)
    expect(screen.getByText("Subtotal (1 producto)")).toBeInTheDocument();
    // línea de ítem + subtotal = 2; el total (110.000) es único
    expect(screen.getAllByText(cop(95000))).toHaveLength(2);
    expect(screen.getByText(cop(15000))).toBeInTheDocument();
    expect(screen.queryByText("Gratis")).toBeNull();
    expect(screen.getByText(cop(110000))).toBeInTheDocument();

    // mensaje de WhatsApp con precios
    const wa = screen.getByRole("link", { name: /Pedir por WhatsApp/ });
    const mensaje = decodeURIComponent(wa.getAttribute("href") ?? "");
    expect(mensaje).toContain("Hola, quiero pedir:");
    expect(mensaje).toContain("Total:");
  });

  it("envío gratis al superar el umbral de $200.000", async () => {
    sembrar([item({ precio: 250000 })]);
    montar(true);

    // Esperar a que el componente se hidrate
    await waitFor(() => {
      expect(screen.getByText("Subtotal (1 producto)")).toBeInTheDocument();
    });
    expect(screen.getByText("Gratis")).toBeInTheDocument();
    // ítem + subtotal + total = 3 apariciones (envío gratis no suma)
    expect(screen.getAllByText(cop(250000))).toHaveLength(3);
    expect(screen.queryByText(cop(15000))).toBeNull();
  });

  it("con showPrices=false oculta precios y usa el mensaje de WhatsApp de consulta", async () => {
    sembrar([item()]);
    montar(false);

    // Esperar a que el componente se hidrate
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Nike Revolution 7")).toBeInTheDocument();

    // sin precios en ningún punto
    expect(screen.queryByText(cop(95000))).toBeNull();
    expect(screen.queryByText(/Subtotal/)).toBeNull();
    expect(screen.queryByText(/Total/)).toBeNull();
    expect(
      screen.getByText(
        "Los precios y el costo de envío se confirmarán al solicitar tu pedido.",
      ),
    ).toBeInTheDocument();

    // WhatsApp: mensaje de consulta, sin precios
    // El <a> no tiene href cuando whatsappNumero es null, así que no es un "link" accesible
    const wa = document.querySelector(".carrito-whatsapp") as HTMLAnchorElement;
    expect(wa).not.toBeNull();
    expect(wa).toHaveTextContent(/Pedir por WhatsApp/);
    const mensaje = decodeURIComponent(wa.getAttribute("href") ?? "");
    expect(mensaje).toContain(
      "Hola, quiero consultar el precio de estos productos:",
    );
    expect(mensaje).not.toContain("Total:");
  });

  it("los items persisten al remontar el provider (localStorage)", async () => {
    sembrar([item({ cantidad: 2 })]);
    montar(true);

    // Esperar a que el componente se hidrate
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (2 productos)" }),
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });
});
