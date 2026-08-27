import { redirect } from "next/navigation";
import { getCurrentUser } from "@makced/db/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("http://localhost:3001/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-semibold text-gray-900">Panel de control</h2>
        <p className="mb-4 text-sm text-gray-500">Sesion iniciada como:</p>

        <p className="rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm text-gray-800">
          {user.email}
        </p>

        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </main>
  );
}

async function logout() {
  "use server";
  const { signOut } = await import("@makced/db/actions");
  await signOut();
  redirect("http://localhost:3001/");
}
