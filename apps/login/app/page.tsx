import { redirect } from "next/navigation";
import LoginForm from "@makced/ui/LoginForm";
import { getCurrentUser } from "@makced/db/server";

export const dynamic = "force-dynamic";

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3002";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect(DASHBOARD_URL);
  }

  const { mode } = await searchParams;
  const initialMode = mode === "signup" ? "signup" : "signin";

  return (
    <main className="flex flex-col items-center justify-center flex-1 py-12 px-4">
      <LoginForm mode={initialMode} />
    </main>
  );
}