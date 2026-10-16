import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

function renderModal(
  props: Partial<React.ComponentProps<typeof Modal>> = {},
) {
  const onClose = vi.fn();
  const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) =>
    e.preventDefault(),
  );
  const utils = render(
    <Modal
      isOpen
      onClose={onClose}
      title="Editar categoría"
      subtitle="Actualiza los datos"
      body={<p>contenido del body</p>}
      errorGuardado={null}
      ocupado={false}
      submitLabel="Guardar cambios"
      onSubmit={onSubmit}
      idValue="cat-1"
      {...props}
    />,
  );
  return { ...utils, onClose, onSubmit };
}

describe("Modal", () => {
  it("el dialog es accesible: aria-labelledby apunta al título", () => {
    renderModal();
    const dialog = screen.getByRole("dialog");
    const title = screen.getByRole("heading", { name: "Editar categoría" });
    expect(dialog).toHaveAccessibleName("Editar categoría");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(screen.getByText("contenido del body")).toBeInTheDocument();
  });

  it("cierra con Cancelar y con el botón de equis", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Cerrar modal" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("muestra el error de guardado en un alert y bloquea al estar ocupado", async () => {
    const user = userEvent.setup();
    const { onSubmit, onClose } = renderModal({
      errorGuardado: "No se pudo guardar",
      ocupado: true,
    });

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");

    const submit = screen.getByRole("button", { name: "Guardar cambios" });
    const cancelar = screen.getByRole("button", { name: "Cancelar" });
    expect(submit).toBeDisabled();
    expect(cancelar).toBeDisabled();

    await user.click(submit);
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(cancelar);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("envía el form con el id oculto", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderModal({ idValue: "cat-99" });

    expect(
      container.querySelector('input[type="hidden"][name="id"]'),
    ).toHaveValue("cat-99");

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("cerrado (isOpen=false) no renderiza el contenido", () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText("contenido del body")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
