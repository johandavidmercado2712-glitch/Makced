import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "./ResetPasswordForm";
import { resetPassword } from "@makced/db/actions";

vi.mock("@makced/db/actions", () => ({
  resetPassword: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  verifyEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  initiateOAuth: vi.fn(),
  signOut: vi.fn(),
}));

const mockedReset = vi.mocked(resetPassword);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ResetPasswordForm", () => {
  it("rechaza contraseñas cortas sin llamar al backend", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token="tok-123" />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "123");
    await user.click(
      screen.getByRole("button", { name: "Restablecer contraseña" }),
    );

    expect(
      await screen.findByText("La contraseña debe tener al menos 8 caracteres"),
    ).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("rechaza confirmaciones que no coinciden", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token="tok-123" />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "segura1234");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "otra12345");
    await user.click(
      screen.getByRole("button", { name: "Restablecer contraseña" }),
    );

    expect(
      await screen.findByText("Las contraseñas no coinciden"),
    ).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("envía el token y la contraseña, y muestra el error del servidor", async () => {
    mockedReset.mockResolvedValue({
      error: { message: "Código inválido o expirado" },
    } as Awaited<ReturnType<typeof resetPassword>>);
    const user = userEvent.setup();
    render(<ResetPasswordForm token="tok-123" />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "segura1234");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "segura1234");
    await user.click(
      screen.getByRole("button", { name: "Restablecer contraseña" }),
    );

    expect(
      await screen.findByText("Código inválido o expirado"),
    ).toBeInTheDocument();
    expect(mockedReset).toHaveBeenCalledTimes(1);

    const formData = mockedReset.mock.calls[0][0];
    expect(formData.get("reset-token")).toBe("tok-123");
    expect(formData.get("newPassword")).toBe("segura1234");
    expect(formData.get("confirm-password")).toBe("segura1234");
  });
});
