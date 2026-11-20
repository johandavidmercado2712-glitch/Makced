import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumbs from "./Breadcrumbs";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("Breadcrumbs", () => {
  it("renderiza todos los items", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Calzado", href: "/categoria" },
          { label: "Nike" },
        ]}
      />,
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Calzado")).toBeInTheDocument();
    expect(screen.getByText("Nike")).toBeInTheDocument();
  });

  it("el último item es texto plano, no un link", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Calzado", href: "/categoria" },
          { label: "Nike" },
        ]}
      />,
    );

    const ultimo = screen.getByText("Nike");
    expect(ultimo.tagName).toBe("SPAN");
    expect(ultimo.closest("a")).toBeNull();
  });

  it("los items intermedios son links", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Calzado", href: "/categoria" },
          { label: "Nike" },
        ]}
      />,
    );

    const linkInicio = screen.getByText("Inicio").closest("a");
    const linkCalzado = screen.getByText("Calzado").closest("a");

    expect(linkInicio).toHaveAttribute("href", "/");
    expect(linkCalzado).toHaveAttribute("href", "/categoria");
  });

  it("un item sin href se renderiza como texto plano", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Calzado" },
        ]}
      />,
    );

    const item = screen.getByText("Calzado");
    expect(item.closest("a")).toBeNull();
  });

  it("usa clases CSS de daisyUI breadcrumbs", () => {
    const { container } = render(
      <Breadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Test" }]}
      />,
    );

    const breadcrumbs = container.querySelector(".breadcrumbs");
    expect(breadcrumbs).not.toBeNull();
    expect(breadcrumbs).toHaveClass("migaja-info");
  });
});
