import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { ProductTableWithUndo } from "@/components/ProductTableWithUndo";
import { MarcasWithUndo } from "@/components/MarcasWithUndo";
import { Toast } from "@/components/Toast";
import type { CategoriaAdmin, MarcaAdmin, ProductoLista } from "@/types/database";

// Mock de server actions
vi.mock("@/actions/products", () => ({
  restaurarProducto: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("@/actions/marcas", () => ({
  eliminarMarca: vi.fn().mockResolvedValue({ ok: true }),
  eliminarCategoria: vi.fn().mockResolvedValue({ ok: true }),
  restaurarMarca: vi.fn().mockResolvedValue({ ok: true }),
  restaurarCategoria: vi.fn().mockResolvedValue({ ok: true }),
  guardarMarca: vi.fn().mockResolvedValue({ ok: true }),
  guardarCategoria: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock de next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// Mock de next/link
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const productosMock: ProductoLista[] = [
  {
    id: "p1",
    nombre: "Nike Air Max",
    descripcion: null,
    precio: 150000,
    precio_descuento: null,
    stock: 10,
    estado: true,
    es_nuevo: false,
    es_destacado: false,
    marca: { id: "m1", nombre: "Nike" },
    categoria: { id: "c1", nombre: "Running" },
    imagen_url: "/nike.jpg",
    imagen_key: null,
    slug: "nike-air-max",
  },
];

const marcasMock: MarcaAdmin[] = [
  {
    id: "m1",
    nombre: "Nike",
    logo_url: "/nike.png",
    logo_key: null,
    activa: true,
    created_at: "2024-01-01T00:00:00.000Z",
  },
];

const categoriasMock: CategoriaAdmin[] = [
  {
    id: "c1",
    nombre: "Running",
    slug: "running",
    imagen_url: "/running.jpg",
    imagen_key: null,
    activa: true,
    created_at: "2024-01-01T00:00:00.000Z",
  },
];

const onSaveMock = vi.fn().mockResolvedValue({ ok: true });
const onDeleteMock = vi.fn().mockResolvedValue({ ok: true });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Flujo de Undo Toast - Productos (integración)", () => {
  it("renderiza la tabla de productos", () => {
    render(
      <ProductTableWithUndo
        productos={productosMock}
        marcas={marcasMock}
        categorias={categoriasMock}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
      />,
    );

    expect(screen.getByText("Nike Air Max")).toBeInTheDocument();
  });

  it("muestra toast de celebración cuando es el primer producto", async () => {
    render(
      <ProductTableWithUndo
        productos={productosMock}
        marcas={marcasMock}
        categorias={categoriasMock}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
        esPrimerProducto={true}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("¡Tu primer producto está en la tienda!")).toBeInTheDocument();
    });
  });

  it("renderiza el componente Toast", () => {
    render(
      <ProductTableWithUndo
        productos={productosMock}
        marcas={marcasMock}
        categorias={categoriasMock}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
      />,
    );

    // El Toast no es visible inicialmente (visible: false)
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("Flujo de Undo Toast - Marcas (integración)", () => {
  it("muestra EmptyState cuando no hay marcas ni categorías", () => {
    render(<MarcasWithUndo marcas={[]} categorias={[]} />);

    expect(screen.getByText("¡Hola! Aquí aparecerán tus marcas")).toBeInTheDocument();
    expect(screen.getByText("¡Hola! Aquí aparecerán tus categorías")).toBeInTheDocument();
  });

  it("muestra las marcas cuando existen", () => {
    const marcas: MarcaAdmin[] = [
      {
        id: "m1",
        nombre: "Nike",
        logo_url: "/nike.png",
        logo_key: null,
        activa: true,
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ];

    render(<MarcasWithUndo marcas={marcas} categorias={[]} />);

    expect(screen.getByText("Nike")).toBeInTheDocument();
  });

  it("muestra las categorías cuando existen", () => {
    const categorias: CategoriaAdmin[] = [
      {
        id: "c1",
        nombre: "Running",
        slug: "running",
        imagen_url: "/running.jpg",
        imagen_key: null,
        activa: true,
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ];

    render(<MarcasWithUndo marcas={[]} categorias={categorias} />);

    expect(screen.getByText("Running")).toBeInTheDocument();
  });
});

describe("Toast (integración)", () => {
  it("muestra mensaje y botón deshacer", async () => {
    const onUndo = vi.fn();
    const onDismiss = vi.fn();

    render(
      <Toast
        state={{
          visible: true,
          message: "Producto eliminado",
          countdown: 5,
          undoAction: async () => {},
        }}
        onUndo={onUndo}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("Producto eliminado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Deshacer \(5\)/ })).toBeInTheDocument();
  });

  it("click en deshacer llama onUndo", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();

    render(
      <Toast
        state={{
          visible: true,
          message: "Eliminado",
          countdown: 3,
          undoAction: async () => {},
        }}
        onUndo={onUndo}
        onDismiss={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Deshacer \(3\)/ }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("click en cerrar llama onDismiss", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Toast
        state={{ visible: true, message: "Mensaje", undoAction: null, countdown: 0 }}
        onUndo={vi.fn()}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("no renderiza cuando visible es false", () => {
    const { container } = render(
      <Toast
        state={{ visible: false, message: "", undoAction: null, countdown: 0 }}
        onUndo={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
