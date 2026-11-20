import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { CartProvider } from "../../components/auth/CartContext";
import ProductoSelector from "../../components/product/ProductoSelector";
import CarritoPage from "../../app/carrito/page";
import CheckoutForm from "../../components/cart/CheckoutForm";
import type { ProductoCart } from "../../types/cart";
import { formatCOP } from "../../lib/format";

// ─── Mocks ────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock de insforge para el número de WhatsApp de la tienda.
// El builder real devuelve `this` en cada método: la query se encadena
// tantas veces como haga falta. El mock debe tener la misma FORMA, no
// solo el caso concreto, si no el segundo `.eq(...)` se queda sin método.
vi.mock("../../lib/insforge", () => {
  const query = {
    select: () => query,
    eq: () => query,
    maybeSingle: () =>
      Promise.resolve({ data: { whatsapp_numero: "573001234567" } }),
  };
  return { insforge: { database: { from: () => query } } };
});

// ─── Helpers ──────────────────────────────────────────────────

const textoCOP = (valor: number) =>
  formatCOP(valor).replace(/\u00a0/g, " ");

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

const productoCaro: ProductoCart & {
  colores?: { nombre: string; hex: string }[];
} = {
  id: "p2",
  slug: "jordan-4",
  nombre: "Jordan 4 Retro",
  precio: 250000,
  precio_descuento: null,
  imagen_url: "/jordan4.jpg",
  colores: [{ nombre: "Blanco", hex: "#ffffff" }],
};

beforeEach(() => {
  localStorage.clear();
});

// ─── Tests ────────────────────────────────────────────────────

describe("Flujo completo del carrito (integración)", () => {
  it("agregar producto con talla y color muestra confirmación", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <ProductoSelector producto={producto} />
        <CarritoPage />
      </CartProvider>,
    );

    // Esperar a que la página del carrito se hidrate
    await waitFor(() => {
      expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    });

    // Seleccionar talla y color
    await user.click(screen.getByRole("button", { name: "40" }));
    await user.click(screen.getByRole("button", { name: "Negro" }));

    // Agregar al carrito
    const btnAgregar = screen.getByRole("button", {
      name: "Agregar al carrito",
    });
    expect(btnAgregar).toBeEnabled();
    await user.click(btnAgregar);

    // Confirmación en el botón
    expect(btnAgregar).toHaveTextContent("Agregado");

    // El carrito se actualizó
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Nike Revolution 7")).toBeInTheDocument();
    expect(screen.getByText("Talla: 40")).toBeInTheDocument();
    expect(screen.getByText("Negro")).toBeInTheDocument();

    // Persistencia en localStorage
    const guardado = JSON.parse(
      localStorage.getItem("makced-cart") ?? "[]",
    ) as Array<Record<string, unknown>>;
    expect(guardado).toHaveLength(1);
    expect(guardado[0]).toMatchObject({ id: "p1", talla: 40, color: "Negro" });
  });

  it("carrito con subtotal < $200.000 muestra mensaje de ánimo", async () => {
    // Sembrar un producto de $95.000 directamente
    localStorage.setItem(
      "makced-cart",
      JSON.stringify([
        {
          id: "p1",
          slug: "nike-revolution-7",
          nombre: "Nike Revolution 7",
          precio: 95000,
          imagen_url: "/hombre.jpg",
          cantidad: 1,
          talla: 40,
        },
      ]),
    );

    render(
      <CartProvider>
        <CarritoPage />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
      ).toBeInTheDocument();
    });

    // Banner de ánimo (no el de pedido completo)
    expect(
      screen.getByText("¡Ya casi! Revisa tu pedido y envíalo por WhatsApp"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("¡Tu pedido está completo, listo para enviar!"),
    ).not.toBeInTheDocument();

    // Resumen con envío de $15.000
    expect(screen.getByText("Subtotal (1 producto)")).toBeInTheDocument();
    // $95.000 aparece 2 veces: línea del ítem + subtotal
    expect(screen.getAllByText(textoCOP(95000))).toHaveLength(2);
    expect(screen.getByText(textoCOP(15000))).toBeInTheDocument();
    expect(screen.getByText(textoCOP(110000))).toBeInTheDocument();
    expect(screen.queryByText("Gratis")).toBeNull();

    // Barra de progreso parcial (~48%)
    const barra = screen.getByRole("progressbar", {
      name: "Progreso del pedido",
    });
    expect(barra).toHaveAttribute("aria-valuenow", "48");
  });

  it("carrito con subtotal >= $200.000 muestra mensaje de pedido completo", async () => {
    // Sembrar un producto de $250.000
    localStorage.setItem(
      "makced-cart",
      JSON.stringify([
        {
          id: "p2",
          slug: "jordan-4",
          nombre: "Jordan 4 Retro",
          precio: 250000,
          imagen_url: "/jordan4.jpg",
          cantidad: 1,
          talla: 42,
          color: "Blanco",
        },
      ]),
    );

    render(
      <CartProvider>
        <CarritoPage />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
      ).toBeInTheDocument();
    });

    // Banner de pedido completo ✅
    expect(
      screen.getByText("¡Tu pedido está completo, listo para enviar!"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("¡Ya casi! Revisa tu pedido y envíalo por WhatsApp"),
    ).not.toBeInTheDocument();

    // Resumen con envío gratis
    expect(screen.getByText("Subtotal (1 producto)")).toBeInTheDocument();
    expect(screen.getByText("Gratis")).toBeInTheDocument();
    expect(screen.queryByText(textoCOP(15000))).toBeNull();

    // Total = subtotal (sin envío)
    expect(screen.getAllByText(textoCOP(250000))).toHaveLength(3);

    // Barra de progreso al 100%
    const barra = screen.getByRole("progressbar", {
      name: "Progreso del pedido",
    });
    expect(barra).toHaveAttribute("aria-valuenow", "100");
  });

  it("modificar cantidades recalcula subtotal, envío y total", async () => {
    const user = userEvent.setup();

    // Sembrar un producto de $95.000
    localStorage.setItem(
      "makced-cart",
      JSON.stringify([
        {
          id: "p1",
          slug: "nike-revolution-7",
          nombre: "Nike Revolution 7",
          precio: 95000,
          imagen_url: "/hombre.jpg",
          cantidad: 1,
          talla: 40,
        },
      ]),
    );

    render(
      <CartProvider>
        <CarritoPage />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
      ).toBeInTheDocument();
    });

    // Total inicial: $95.000 + $15.000 = $110.000
    expect(screen.getByText(textoCOP(110000))).toBeInTheDocument();

    // Aumentar cantidad a 2 → subtotal $190.000 + envío $15.000 = $205.000
    await user.click(
      screen.getByRole("button", { name: "Aumentar cantidad" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (2 productos)" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Subtotal (2 productos)")).toBeInTheDocument();
    // $190.000 aparece 2 veces: línea del ítem + subtotal
    expect(screen.getAllByText(textoCOP(190000))).toHaveLength(2);
    expect(screen.getByText(textoCOP(205000))).toBeInTheDocument();

    // Aumentar a 3 → subtotal $285.000 → envío GRATIS
    await user.click(
      screen.getByRole("button", { name: "Aumentar cantidad" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("¡Tu pedido está completo, listo para enviar!"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Gratis")).toBeInTheDocument();
    // $285.000 aparece 3 veces: línea del ítem + subtotal + total
    expect(screen.getAllByText(textoCOP(285000))).toHaveLength(3);

    // Reducir a 2 → vuelve envío pago
    await user.click(
      screen.getByRole("button", { name: "Reducir cantidad" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("¡Ya casi! Revisa tu pedido y envíalo por WhatsApp"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(textoCOP(15000))).toBeInTheDocument();
  });

  it("checkout completo genera link de WhatsApp con el pedido", async () => {
    const user = userEvent.setup();

    // Sembrar producto
    localStorage.setItem(
      "makced-cart",
      JSON.stringify([
        {
          id: "p1",
          slug: "nike-revolution-7",
          nombre: "Nike Revolution 7",
          precio: 95000,
          imagen_url: "/hombre.jpg",
          cantidad: 1,
          talla: 40,
          color: "Negro",
        },
      ]),
    );

    render(
      <CartProvider>
        <CarritoPage />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
      ).toBeInTheDocument();
    });

    // El link de WhatsApp debe tener el mensaje con el pedido
    const wa = document.querySelector(".carrito-whatsapp") as HTMLAnchorElement;
    expect(wa).not.toBeNull();

    // Esperar a que el número de WhatsApp se cargue (mock de insforge)
    await waitFor(() => {
      expect(wa).toHaveAttribute(
        "href",
        expect.stringContaining("https://wa.me/573001234567"),
      );
    });

    const mensaje = decodeURIComponent(wa.getAttribute("href") ?? "");
    expect(mensaje).toContain("Hola, quiero pedir:");
    expect(mensaje).toContain("Nike Revolution 7");
    expect(mensaje).toContain("Talla 40");
    expect(mensaje).toContain("Negro");
    expect(mensaje).toContain("Total:");
  });

  it("formulario de checkout notifica validez al completar datos", async () => {
    const user = userEvent.setup();
    const onValidChange = vi.fn();

    render(<CheckoutForm onValidChange={onValidChange} />);

    // Completar todos los campos obligatorios
    await user.type(screen.getByLabelText(/Nombre completo/), "María García");
    await user.type(screen.getByLabelText(/Teléfono/), "3001234567");
    await user.type(
      screen.getByLabelText(/Dirección de entrega/),
      "Calle 123 #45-67, Centro",
    );

    // El formulario debe notificar que es válido
    await waitFor(() => {
      const ultima =
        onValidChange.mock.calls[onValidChange.mock.calls.length - 1];
      expect(ultima[1]).toBe(true);
      expect(ultima[0]).toMatchObject({
        nombre: "María García",
        telefono: "3001234567",
      });
    });

    // Datos persistidos en localStorage
    await waitFor(() => {
      const guardado = localStorage.getItem("checkout-datos");
      expect(guardado).not.toBeNull();
      expect(JSON.parse(guardado!)).toMatchObject({ nombre: "María García" });
    });
  });

  it("eliminar un producto del carrito lo quita del resumen", async () => {
    const user = userEvent.setup();

    // Sembrar 2 productos
    localStorage.setItem(
      "makced-cart",
      JSON.stringify([
        {
          id: "p1",
          slug: "nike-revolution-7",
          nombre: "Nike Revolution 7",
          precio: 95000,
          imagen_url: "/hombre.jpg",
          cantidad: 1,
          talla: 40,
        },
        {
          id: "p2",
          slug: "jordan-4",
          nombre: "Jordan 4 Retro",
          precio: 250000,
          imagen_url: "/jordan4.jpg",
          cantidad: 1,
          talla: 42,
        },
      ]),
    );

    render(
      <CartProvider>
        <CarritoPage />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu Carrito (2 productos)" }),
      ).toBeInTheDocument();
    });

    // Subtotal inicial: $345.000 (envío gratis)
    expect(screen.getByText("Gratis")).toBeInTheDocument();

    // Eliminar el producto caro ($250.000)
    await user.click(
      screen.getByRole("button", {
        name: "Eliminar Jordan 4 Retro del carrito",
      }),
    );

    // Esperar a que termine la animación de remoción (250ms)
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: "Tu Carrito (1 producto)" }),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Ahora subtotal $95.000 → envío pago
    expect(screen.queryByText("Jordan 4 Retro")).not.toBeInTheDocument();
    expect(screen.getByText(textoCOP(15000))).toBeInTheDocument();
    expect(
      screen.getByText("¡Ya casi! Revisa tu pedido y envíalo por WhatsApp"),
    ).toBeInTheDocument();
  });
});
