import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImagenSelector } from "./ImagenSelector";

function renderSelector(
  props: Partial<React.ComponentProps<typeof ImagenSelector>> = {},
) {
  const onCambio = vi.fn();
  const onError = vi.fn();
  const utils = render(
    <ImagenSelector
      prefijo="ck"
      onCambio={onCambio}
      onError={onError}
      {...props}
    />,
  );
  return { ...utils, onCambio, onError };
}

const previewFondo = (container: HTMLElement): string =>
  container.querySelector(".db-modal-img-preview")?.getAttribute("style") ?? "";

describe("ImagenSelector", () => {
  it("resuelve la preview relativa contra la tienda (regresión 404)", () => {
    const { container } = renderSelector({
      urlActual: "/hombre.jpg",
      keyActual: "categorias/hombre.jpg",
      textoQuitada: "de la categoría",
    });
    // modo archivo (hay keyActual): preview de la URL guardada
    expect(previewFondo(container)).toContain(
      'url("http://localhost:3000/hombre.jpg")',
    );
    expect(previewFondo(container)).not.toContain('url("/hombre.jpg")');
  });

  it("en modo URL conserva el valor crudo en el input pero resuelve la preview", () => {
    const { container } = renderSelector({ urlActual: "/mujer.jpg" });
    // sin keyActual → modo URL
    const input = screen.getByLabelText("Imagen");
    expect(input).toHaveValue("/mujer.jpg");
    expect(previewFondo(container)).toContain(
      'url("http://localhost:3000/mujer.jpg")',
    );
  });

  it("al quitar muestra el aviso con texto configurable y al deshacer vuelve", async () => {
    const user = userEvent.setup();
    const { container, onCambio } = renderSelector({
      urlActual: "/deportivo.jpg",
      keyActual: "categorias/deportivo.jpg",
      textoQuitada: "de la categoría",
    });

    await user.click(screen.getByRole("button", { name: "Quitar imagen" }));
    expect(screen.getByText("Imagen quitada de la categoría.")).toBeInTheDocument();
    expect(onCambio).toHaveBeenLastCalledWith(
      expect.objectContaining({ quitar: true }),
    );
    expect(container.querySelector(".db-modal-img-preview")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Deshacer" }));
    expect(screen.queryByText(/Imagen quitada/)).toBeNull();
    expect(previewFondo(container)).toContain("http://localhost:3000/deportivo.jpg");
    expect(onCambio).toHaveBeenLastCalledWith(
      expect.objectContaining({ quitar: false }),
    );
  });

  it("rechaza archivos con formato no permitido y avisa al padre", async () => {
    const { onError } = renderSelector({
      urlActual: "/hombre.jpg",
      keyActual: "categorias/hombre.jpg",
    });

    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );
    expect(fileInput).not.toBeNull();
    const gif = new File(["x"], "anim.gif", { type: "image/gif" });
    // fireEvent: el input está hidden y user-event bloquea puntero en no-visibles
    fireEvent.change(fileInput!, { target: { files: [gif] } });

    expect(onError).toHaveBeenCalledWith(
      "Formato no válido. Usa JPG, PNG o WebP.",
    );
  });

  it("acepta un JPG válido y notifica al padre con el archivo", async () => {
    const { onError, onCambio } = renderSelector({
      urlActual: "/hombre.jpg",
      keyActual: "categorias/hombre.jpg",
    });

    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );
    const jpg = new File(["x"], "nuevo.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput!, { target: { files: [jpg] } });

    expect(onError).toHaveBeenCalledWith(null);
    expect(onCambio).toHaveBeenLastCalledWith(
      expect.objectContaining({ archivo: jpg }),
    );
  });
});
