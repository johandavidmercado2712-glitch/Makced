/* eslint-disable @next/next/no-img-element -- el mock de next/image debe renderizar un <img> */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import { CartProvider, useCart } from "../auth/CartContext";
import { ThemeProvider } from "../auth/ThemeProvider";

// ─── Mocks de Next.js ─────────────────────────────────────────

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    "aria-label": ariaLabel,
    "aria-current": ariaCurrent,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
    "aria-label"?: string;
    "aria-current"?: boolean | "date" | "time" | "page" | "true" | "false" | "step" | "location";
  }) => (
    <a href={href} className={className} aria-label={ariaLabel} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}));

// Mock de next/navigation con valores configurables
let mockPathname = "/";
let mockSearchParams = new URLSearchParams();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
}));

// Mock de useCartToast para no depender de timers reales
const mockShowToast = vi.fn();
const mockHideToast = vi.fn();
const mockUndo = vi.fn();

vi.mock("../../hooks/useCartToast", () => ({
  useCartToast: () => ({
    state: { visible: false, message: "", variant: "default", countdown: 0 },
    show: mockShowToast,
    hide: mockHideToast,
    undo: mockUndo,
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────

function renderNavbar(props?: Parameters<typeof Navbar>[0]) {
  return render(
    <ThemeProvider>
      <CartProvider>
        <Navbar {...props} />
      </CartProvider>
    </ThemeProvider>,
  );
}

const categorias = [
  { id: "1", nombre: "Running", slug: "running" },
  { id: "2", nombre: "Casual", slug: "casual" },
];

beforeEach(() => {
  localStorage.clear();
  mockPathname = "/";
  mockSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe("Navbar", () => {
  it("renderiza los links fijos (Inicio, Novedades, Marcas, Categorías)", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Novedades" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Marcas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Categorías" })).toBeInTheDocument();
  });

  it("renderiza links dinámicos de categorías", () => {
    renderNavbar({ initialCategories: categorias });

    expect(screen.getByRole("link", { name: "Running" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Casual" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Running" })).toHaveAttribute(
      "href",
      "/categoriaProductos?slug=running",
    );
  });

  it("renderiza el logo con marca y aria-label", () => {
    renderNavbar({ marca: "MAKCED", logoUrl: "/logo.png" });

    const logo = screen.getByRole("link", { name: "MAKCED - Inicio" });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("href", "/");

    const img = screen.getByAltText("");
    expect(img).toHaveAttribute("src", "/logo.png");
  });

  it("muestra el badge del carrito cuando hay items", () => {
    localStorage.setItem(
      "makced-cart",
      JSON.stringify([
        {
          id: "p1",
          slug: "test",
          nombre: "Test",
          precio: 100,
          imagen_url: "/img.jpg",
          cantidad: 3,
        },
      ]),
    );

    renderNavbar();

    const badge = screen.getByText("3");
    expect(badge).toHaveClass("cart-badge");
  });

  it("no muestra badge cuando el carrito está vacío", () => {
    renderNavbar();

    expect(document.querySelector(".cart-badge")).toBeNull();
  });

  it("marca el link activo con aria-current según la ruta", () => {
    mockPathname = "/novedades";
    renderNavbar();

    const linkNovedades = screen.getByRole("link", { name: "Novedades" });
    expect(linkNovedades).toHaveAttribute("aria-current", "page");

    const linkInicio = screen.getByRole("link", { name: "Inicio" });
    expect(linkInicio).not.toHaveAttribute("aria-current");
  });

  it("marca la categoría activa según el slug en searchParams", () => {
    mockPathname = "/categoriaProductos";
    mockSearchParams = new URLSearchParams("slug=running");
    renderNavbar({ initialCategories: categorias });

    const linkRunning = screen.getByRole("link", { name: "Running" });
    expect(linkRunning).toHaveAttribute("aria-current", "page");
  });

  it("el botón del carrito navega a /carrito", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const btnCarrito = screen.getByRole("button", {
      name: "Carrito con 0 productos",
    });
    await user.click(btnCarrito);

    expect(mockPush).toHaveBeenCalledWith("/carrito");
  });

  it("muestra toast de celebración al agregar el primer producto", async () => {
    // Helper que expone el contexto para agregar items desde el test
    let agregarDesdeTest: (() => void) | null = null;
    function CartHelper() {
      const { addItem } = useCart();
      agregarDesdeTest = () =>
        addItem({
          id: "p1",
          slug: "test",
          nombre: "Test",
          precio: 100,
          precio_descuento: null,
          imagen_url: null,
        });
      return null;
    }

    render(
      <ThemeProvider>
        <CartProvider>
          <Navbar />
          <CartHelper />
        </CartProvider>
      </ThemeProvider>,
    );

    // Agregar el primer producto a través del contexto (dispara write → emitChange)
    await act(async () => {
      agregarDesdeTest!();
    });

    // El useEffect del Navbar detecta el cambio 0 → 1 y llama showToast
    await vi.waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "¡Tu primer producto está en el carrito!",
        "celebration",
      );
    });
  });
});
