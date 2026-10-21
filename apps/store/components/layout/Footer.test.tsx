import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { combinarDiseno } from "@makced/db/diseno";
import Footer from "./Footer";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const categorias = [
  { id: "c1", nombre: "Deportivo", slug: "deportivo" },
  { id: "c2", nombre: "Niños", slug: "ropa niño" },
];

describe("Footer", () => {
  it("oculta columnas y redes sin URL configurada", () => {
    const { container } = render(
      <Footer categorias={categorias} pie={combinarDiseno(null).pie} />,
    );

    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByText("Deportivo")).toBeInTheDocument();
    expect(screen.queryByText("INFORMACIÓN")).toBeNull();
    expect(screen.queryByText("AYUDA")).toBeNull();
    expect(container.querySelector(".footer-social")).toBeNull();
    expect(container.querySelector('a[href="#"]')).toBeNull();
  });

  it("renderiza enlaces internos, externos y sociales configurados", () => {
    const { pie } = combinarDiseno({
      pie: {
        titulo_informacion: "Info",
        titulo_ayuda: "Ayuda",
        web_url: "https://tutienda.com",
        informacion: [
          { etiqueta: "Nosotros", url: "/nosotros" },
          { etiqueta: "Términos", url: "https://tutienda.com/terminos" },
          { etiqueta: "Muerto", url: "#" },
          { etiqueta: "Vacío", url: "" },
        ],
        ayuda: [{ etiqueta: "Correo", url: "mailto:hola@tutienda.com" }],
      },
    });

    render(<Footer categorias={categorias} pie={pie} />);

    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Ayuda")).toBeInTheDocument();
    expect(screen.queryByText("Muerto")).toBeNull();
    expect(screen.queryByText("Vacío")).toBeNull();

    const interno = screen.getByRole("link", { name: "Nosotros" });
    expect(interno).toHaveAttribute("href", "/nosotros");
    expect(interno).not.toHaveAttribute("target");

    const externo = screen.getByRole("link", { name: "Términos" });
    expect(externo).toHaveAttribute("target", "_blank");
    expect(externo).toHaveAttribute("rel", "noopener noreferrer");

    const correo = screen.getByRole("link", { name: "Correo" });
    expect(correo).toHaveAttribute("href", "mailto:hola@tutienda.com");
    expect(correo).not.toHaveAttribute("target");

    const social = screen.getByRole("link", { name: "Sitio web" });
    expect(social).toHaveAttribute("href", "https://tutienda.com");
    expect(social).toHaveAttribute("target", "_blank");

    const categoria = screen.getByRole("link", { name: "Niños" });
    expect(categoria).toHaveAttribute(
      "href",
      "/categoriaProductos?slug=ropa%20ni%C3%B1o",
    );
  });
});
