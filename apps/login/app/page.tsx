import { redirect } from "next/navigation";
import LoginForm from "@makced/ui/LoginForm";
import { getCurrentUser } from "@makced/db/server";

export const dynamic = "force-dynamic";

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3002";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    token?: string;
    error?: string;
    insforge_status?: string;
    insforge_type?: string;
    insforge_error?: string;
  }>;
}) {
  const {
    mode,
    token,
    error,
    insforge_status: authStatus,
    insforge_type: authType,
    insforge_error: authError,
  } = await searchParams;
  const user = await getCurrentUser();

  if (user && !token) {
    redirect(DASHBOARD_URL);
  }

  const initialMode = mode === "signup" ? "signup" : "signin";
  const initialMessage =
    authStatus === "success" && authType === "verify_email"
      ? "Correo verificado. Ya puedes iniciar sesión."
      : error === "oauth_failed" || error === "exchange_failed"
        ? "No se pudo completar el inicio de sesión. Inténtalo de nuevo."
        : error === "missing_verifier"
          ? "La sesión de inicio de sesión expiró. Inténtalo otra vez."
          : authStatus === "error" && authError
            ? "No se pudo verificar el correo. Solicita un nuevo enlace."
            : null;

  return (
    <main className="flex flex-col items-center justify-center flex-1 py-12 px-4">
      <LoginForm
        mode={initialMode}
        initialMessage={initialMessage}
        resetToken={token}
      />
    </main>
  );
}