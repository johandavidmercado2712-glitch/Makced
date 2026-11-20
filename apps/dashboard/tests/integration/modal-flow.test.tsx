import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalAcciones } from "@/components/modal/ModalAcciones";

describe("Flujo de Modal Acciones (integración)", () => {
  it("renderiza trigger cuando se proporciona", () => {
    const onAbrir = vi.fn();
    render(
      <ModalAcciones
        trigger={<span>Nuevo producto</span>}
        onAbrir={onAbrir}
        onEliminar={vi.fn()}
        puedeEliminar={false}
        ocupado={false}
        editarLabel="Editar"
        eliminarLabel="Eliminar"
      />,
    );

    const btn = screen.getByRole("button", { name: "Nuevo producto" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("db-btn-primary");
  });

  it("click en trigger llama onAbrir", async () => {
    const user = userEvent.setup();
    const onAbrir = vi.fn();
    render(
      <ModalAcciones
        trigger={<span>Nuevo producto</span>}
        onAbrir={onAbrir}
        onEliminar={vi.fn()}
        puedeEliminar={false}
        ocupado={false}
        editarLabel="Editar"
        eliminarLabel="Eliminar"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Nuevo producto" }));
    expect(onAbrir).toHaveBeenCalledTimes(1);
  });

  it("renderiza acciones de fila (editar/eliminar) cuando no hay trigger", () => {
    render(
      <ModalAcciones
        onAbrir={vi.fn()}
        onEliminar={vi.fn()}
        puedeEliminar={true}
        ocupado={false}
        editarLabel="Editar producto"
        eliminarLabel="Eliminar producto"
      />,
    );

    expect(screen.getByRole("button", { name: "Editar producto" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar producto" })).toBeInTheDocument();
  });

  it("no renderiza botón eliminar cuando puedeEliminar es false", () => {
    render(
      <ModalAcciones
        onAbrir={vi.fn()}
        onEliminar={vi.fn()}
        puedeEliminar={false}
        ocupado={false}
        editarLabel="Editar producto"
        eliminarLabel="Eliminar producto"
      />,
    );

    expect(screen.getByRole("button", { name: "Editar producto" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar producto" })).not.toBeInTheDocument();
  });

  it("deshabilita botón eliminar cuando ocupado es true", () => {
    render(
      <ModalAcciones
        onAbrir={vi.fn()}
        onEliminar={vi.fn()}
        puedeEliminar={true}
        ocupado={true}
        editarLabel="Editar producto"
        eliminarLabel="Eliminar producto"
      />,
    );

    const btnEliminar = screen.getByRole("button", { name: "Eliminar producto" });
    expect(btnEliminar).toBeDisabled();
  });

  it("click en editar llama onAbrir", async () => {
    const user = userEvent.setup();
    const onAbrir = vi.fn();
    render(
      <ModalAcciones
        onAbrir={onAbrir}
        onEliminar={vi.fn()}
        puedeEliminar={true}
        ocupado={false}
        editarLabel="Editar producto"
        eliminarLabel="Eliminar producto"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar producto" }));
    expect(onAbrir).toHaveBeenCalledTimes(1);
  });

  it("click en eliminar llama onEliminar", async () => {
    const user = userEvent.setup();
    const onEliminar = vi.fn();
    render(
      <ModalAcciones
        onAbrir={vi.fn()}
        onEliminar={onEliminar}
        puedeEliminar={true}
        ocupado={false}
        editarLabel="Editar producto"
        eliminarLabel="Eliminar producto"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar producto" }));
    expect(onEliminar).toHaveBeenCalledTimes(1);
  });
});
