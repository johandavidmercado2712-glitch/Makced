import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Navbar from "../../components/layout/Navbar";
import { CartProvider } from "../../components/auth/CartContext";
import { ThemeProvider } from "../../components/auth/ThemeProvider";

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
    "aria-label": ariaLabel,
    "aria-current": ariaCurrent,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
    "aria-label"?: string;
    "aria-current"?: boolean | "date" | "time" | "page" | "true" | "false" | "step" | "location";
  }) => (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  ),
}));

// Mock de next/navigation
let mockPathname = "/";
let mockSearchParams = new URLSearchParams();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
}));

// Mock de useCartToast
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

// Mock de la action de búsqueda.
// SearchInput llama a buscarEnTienda (app/actions/search), que resuelve la
// tienda en el servidor: hay que mockear ESA, no la consulta interna.
const mockBuscarProductos = vi.fn();

vi.mock("../../app/actions/search", () => ({
  buscarEnTienda: (...args: unknown[]) => mockBuscarProductos(...args),
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockPathname = "/";
  mockSearchParams = new URLSearchParams();
});

function renderNavbar(props?: Parameters<typeof Navbar>[0]) {
  return render(
    <ThemeProvider>
      <CartProvider>
        <Navbar {...props} />
      </CartProvider>
    </ThemeProvider>,
  );
}

describe("Flujo de búsqueda (integración)", () => {
  it("abrir búsqueda muestra el input de búsqueda", async () => {
    const user = userEvent.setup();
    renderNavbar();

    // Click en el botón de buscar
    const btnBuscar = screen.getByRole("button", { name: "Buscar" });
    await user.click(btnBuscar);

    // El input de búsqueda aparece
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("cerrar búsqueda oculta el input", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar búsqueda" }));
    expect(screen.queryByPlaceholderText(" ")).not.toBeInTheDocument();
  });

  it("búsqueda con menos de 2 caracteres no muestra resultados", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    const input = screen.getByRole("textbox");
    await user.type(input, "a");

    // No se llama buscarProductos
    expect(mockBuscarProductos).not.toHaveBeenCalled();
    // No aparece el dropdown de resultados ni el mensaje de vacío
    expect(screen.queryByText(/No encontramos productos/)).not.toBeInTheDocument();
  });

  it("búsqueda con 2+ caracteres llama a buscarProductos", async () => {
    const user = userEvent.setup();
    mockBuscarProductos.mockResolvedValue([
      {
        id: "1",
        nombre: "Nike Air",
        precio: 150000,
        precio_descuento: null,
        imagen_url: "/nike.jpg",
        slug: "nike-air",
      },
    ]);

    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    const input = screen.getByRole("textbox");
    await user.type(input, "ni");

    // Esperar a que se llame buscarProductos (debounce de 300ms)
    await waitFor(
      () => {
        expect(mockBuscarProductos).toHaveBeenCalledWith("ni");
      },
      { timeout: 1000 },
    );
  });

  it("muestra resultados de búsqueda", async () => {
    const user = userEvent.setup();
    mockBuscarProductos.mockResolvedValue([
      {
        id: "1",
        nombre: "Nike Air Max",
        precio: 150000,
        precio_descuento: null,
        imagen_url: "/nike.jpg",
        slug: "nike-air-max",
      },
      {
        id: "2",
        nombre: "Nike Revolution",
        precio: 95000,
        precio_descuento: null,
        imagen_url: "/revolution.jpg",
        slug: "nike-revolution",
      },
    ]);

    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    const input = screen.getByRole("textbox");
    await user.type(input, "ni");

    // Esperar a que aparezcan los resultados
    await waitFor(
      () => {
        expect(screen.getByText("Nike Air Max")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    expect(screen.getByText("Nike Revolution")).toBeInTheDocument();
  });

  it("muestra mensaje de vacío cuando no hay resultados", async () => {
    const user = userEvent.setup();
    mockBuscarProductos.mockResolvedValue([]);

    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    const input = screen.getByRole("textbox");
    await user.type(input, "xyz");

    await waitFor(
      () => {
        expect(
          screen.getByText(/No encontramos productos/),
        ).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    expect(screen.getByText(/Intenta con otro término/)).toBeInTheDocument();
  });

  it("Escape cierra la búsqueda", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText(" ")).not.toBeInTheDocument();
  });
});
