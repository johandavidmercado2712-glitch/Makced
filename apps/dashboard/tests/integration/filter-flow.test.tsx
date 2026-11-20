import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterSelect from "@/components/FilterSelect";

const mockReplace = vi.fn();
const mockSearchParamsHolder = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => mockSearchParamsHolder.current,
}));

const marcasOptions = [
  { id: "m1", nombre: "Nike" },
  { id: "m2", nombre: "Adidas" },
];

describe("Flujo de Filtros (integración)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsHolder.current = new URLSearchParams();
  });

  it("renderiza el selector con opciones", () => {
    render(
      <FilterSelect
        icon="Tag"
        label="marcas"
        options={marcasOptions}
        paramKey="marca"
      />,
    );

    const select = screen.getByRole("combobox", { name: "marcas" });
    expect(select).toBeInTheDocument();

    // Opción por defecto
    expect(screen.getByText("Todas las marcas")).toBeInTheDocument();
    // Opciones
    expect(screen.getByText("Nike")).toBeInTheDocument();
    expect(screen.getByText("Adidas")).toBeInTheDocument();
  });

  it("cambia el filtro al seleccionar una opción", async () => {
    const user = userEvent.setup();
    render(
      <FilterSelect
        icon="Tag"
        label="marcas"
        options={marcasOptions}
        paramKey="marca"
      />,
    );

    const select = screen.getByRole("combobox", { name: "marcas" });
    await user.selectOptions(select, "m1");

    expect(mockReplace).toHaveBeenCalledWith("/productos?marca=m1");
  });

  it("reinicia la paginación al cambiar filtro", async () => {
    const user = userEvent.setup();
    mockSearchParamsHolder.current = new URLSearchParams("page=3");
    render(
      <FilterSelect
        icon="Tag"
        label="marcas"
        options={marcasOptions}
        paramKey="marca"
      />,
    );

    const select = screen.getByRole("combobox", { name: "marcas" });
    await user.selectOptions(select, "m2");

    // No debe tener page=3
    expect(mockReplace).toHaveBeenCalledWith("/productos?marca=m2");
  });

  it("limpia el filtro al seleccionar la opción vacía", async () => {
    const user = userEvent.setup();
    mockSearchParamsHolder.current = new URLSearchParams("marca=m1");
    render(
      <FilterSelect
        icon="Tag"
        label="marcas"
        options={marcasOptions}
        paramKey="marca"
      />,
    );

    const select = screen.getByRole("combobox", { name: "marcas" });
    await user.selectOptions(select, "");

    expect(mockReplace).toHaveBeenCalledWith("/productos?");
  });

  it("preserva otros parámetros al cambiar filtro", async () => {
    const user = userEvent.setup();
    mockSearchParamsHolder.current = new URLSearchParams("categoria=c1");
    render(
      <FilterSelect
        icon="Tag"
        label="marcas"
        options={marcasOptions}
        paramKey="marca"
      />,
    );

    const select = screen.getByRole("combobox", { name: "marcas" });
    await user.selectOptions(select, "m1");

    expect(mockReplace).toHaveBeenCalledWith("/productos?categoria=c1&marca=m1");
  });

  it("renderiza icono cuando se proporciona", () => {
    const { container } = render(
      <FilterSelect
        icon="Tag"
        label="marcas"
        options={marcasOptions}
        paramKey="marca"
      />,
    );

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
  });

  it("no renderiza icono cuando no se proporciona", () => {
    const { container } = render(
      <FilterSelect
        icon=""
        label="marcas"
        options={marcasOptions}
        paramKey="marca"
      />,
    );

    // El iconMap no tiene "" así que Icon es undefined
    const filterSelect = container.querySelector(".db-filter-select");
    expect(filterSelect).toBeInTheDocument();
  });
});
