import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";
import {
  initiateOAuth,
  resetPassword,
  sendPasswordResetEmail,
  signIn,
  signUp,
  verifyEmail,
} from "@makced/db/actions";

vi.mock("@makced/db/actions", () => ({
  initiateOAuth: vi.fn(),
  resetPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  verifyEmail: vi.fn(),
  signOut: vi.fn(),
}));

const mockedSignIn = vi.mocked(signIn);
const mockedSignUp = vi.mocked(signUp);
const mockedSendReset = vi.mocked(sendPasswordResetEmail);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginForm (signin)", () => {
  it("valida el correo vacío sin llamar al backend", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Ingresa un correo electrónico válido");
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it("valida la contraseña vacía", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ingresa una contraseña",
    );
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it("muestra el error del servidor al iniciar sesión", async () => {
    mockedSignIn.mockResolvedValue({
      error: { message: "Credenciales inválidas" },
    } as Awaited<ReturnType<typeof signIn>>);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "secreta123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales inválidas",
    );
    expect(mockedSignIn).toHaveBeenCalledTimes(1);
  });
});

describe("LoginForm (signup)", () => {
  it("valida contraseña corta y contraseñas que no coinciden", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Crea tu cuenta" }));

    await user.type(screen.getByLabelText("Correo electrónico"), "n@b.com");
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Pérez");
    await user.type(screen.getByLabelText("Contraseña"), "123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La contraseña debe tener al menos 8 caracteres",
    );

    await user.clear(screen.getByLabelText("Contraseña"));
    await user.clear(screen.getByLabelText("Confirmar contraseña"));
    await user.type(screen.getByLabelText("Contraseña"), "12345678");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "12345679");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Las contraseñas no coinciden",
    );
    expect(mockedSignUp).not.toHaveBeenCalled();
  });

  it("tras registrarse con verificación por código pasa al paso verify", async () => {
    mockedSignUp.mockResolvedValue({
      error: null,
      requiresVerification: true,
      verificationMethod: "code",
    } as Awaited<ReturnType<typeof signUp>>);
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Crea tu cuenta" }));

    await user.type(screen.getByLabelText("Correo electrónico"), "n@b.com");
    await user.type(screen.getByLabelText("Nombre completo"), "Ana Pérez");
    await user.type(screen.getByLabelText("Contraseña"), "12345678");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "12345678");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(
      await screen.findByLabelText("Código de verificación"),
    ).toBeInTheDocument();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Revisa tu correo e ingresa el código de verificación de 6 dígitos",
    );
    expect(mockedSignUp).toHaveBeenCalledTimes(1);
  });
});

describe("LoginForm (forgot-password)", () => {
  it("solicita el código y avanza al paso de restablecer", async () => {
    mockedSendReset.mockResolvedValue({ error: null } as Awaited<
      ReturnType<typeof sendPasswordResetEmail>
    >);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(
      screen.getByRole("button", { name: "¿Olvidaste tu contraseña?" }),
    );
    await user.type(screen.getByLabelText("Correo electrónico"), "a@b.com");
    await user.click(
      screen.getByRole("button", { name: "Enviar código de recuperación" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Si existe una cuenta con ese correo",
    );
    expect(
      await screen.findByLabelText("Código enviado al correo"),
    ).toBeInTheDocument();
    expect(mockedSendReset).toHaveBeenCalledTimes(1);
  });
});
