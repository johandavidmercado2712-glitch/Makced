import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "./EmptyState";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("EmptyState", () => {
  it("renderiza icono, título y descripción", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="No encontramos lo que buscas"
      />,
    );

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(screen.getByText("No encontramos lo que buscas")).toBeInTheDocument();
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("renderiza CTA principal cuando se proporciona", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
        cta={{ label: "Explorar", href: "/" }}
      />,
    );

    const link = screen.getByRole("link", { name: "Explorar" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("no renderiza CTA principal cuando no se proporciona", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renderiza CTAs secundarios cuando se proporcionan", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
        ctaSecondary={[
          { label: "Categorías", href: "/categoria" },
          { label: "Marcas", href: "/marcas" },
        ]}
      />,
    );

    const linkCategorias = screen.getByRole("link", { name: "Categorías" });
    const linkMarcas = screen.getByRole("link", { name: "Marcas" });

    expect(linkCategorias).toBeInTheDocument();
    expect(linkMarcas).toBeInTheDocument();
    expect(linkCategorias).toHaveAttribute("href", "/categoria");
    expect(linkMarcas).toHaveAttribute("href", "/marcas");
  });

  it("no renderiza CTAs secundarios cuando el array está vacío", () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
        ctaSecondary={[]}
      />,
    );

    expect(container.querySelector(".empty-state-cta-secondary")).toBeNull();
  });

  it("renderiza CTA principal y secundarios juntos", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        titulo="Sin resultados"
        descripcion="Descripción"
        cta={{ label: "Explorar", href: "/" }}
        ctaSecondary={[{ label: "Ayuda", href: "/ayuda" }]}
      />,
    );

    expect(screen.getByRole("link", { name: "Explorar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ayuda" })).toBeInTheDocument();
  });
});
