import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TablaSkeleton from "./TablaSkeleton";

describe("TablaSkeleton", () => {
  it("es accesible: role=status, aria-busy y texto para lectores de pantalla", () => {
    render(<TablaSkeleton />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Cargando tabla…");
  });

  it("pinta la fila de encabezado real y las filas ficticias marcadas como aria-hidden", () => {
    const { container } = render(<TablaSkeleton filas={3} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((th) => th.textContent)).toEqual([
      "PRODUCTO",
      "CATEGORÍA",
      "PRECIO",
      "ESTADO",
      "ACCIONES",
    ]);

    const filasFicticias = container.querySelectorAll("tbody tr[aria-hidden='true']");
    expect(filasFicticias).toHaveLength(3);
  });

  it("renderiza una celda por columna en cada fila", () => {
    const { container } = render(
      <TablaSkeleton columnas={["MARCA", "ESTADO", "ACCIONES"]} filas={2} />,
    );
    const filas = container.querySelectorAll("tbody tr[aria-hidden='true']");
    filas.forEach((fila) => {
      expect(fila.querySelectorAll("td")).toHaveLength(3);
    });
  });

  it("sin avatar no pinta el círculo, solo líneas", () => {
    const { container } = render(<TablaSkeleton filas={1} avatar={false} />);
    expect(container.querySelector(".db-skeleton-avatar")).toBeNull();
    expect(container.querySelectorAll(".db-skeleton-line").length).toBeGreaterThan(0);
  });

  it("con avatar pinta el círculo en la primera columna", () => {
    const { container } = render(<TablaSkeleton filas={1} />);
    expect(container.querySelector(".db-skeleton-avatar")).not.toBeNull();
  });
});
