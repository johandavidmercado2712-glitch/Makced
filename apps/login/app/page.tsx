import LoginForm from "@makced/ui/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 py-12 px-4">
      <LoginForm mode="signin" />
    </main>
  );
}
