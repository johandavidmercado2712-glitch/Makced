import ResetPasswordForm from '@makced/ui/ResetPasswordForm';

export const dynamic = 'force-dynamic';

const LOGIN_URL =
  process.env.NEXT_PUBLIC_LOGIN_URL ?? 'http://localhost:3001';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const token = getParam('token');
  const status = getParam('insforge_status');
  const type = getParam('insforge_type');

  const valid =
    type === 'reset_password' &&
    status === 'ready' &&
    typeof token === 'string' &&
    token.length > 0;

  if (!valid) {
    return (
      <main className="login-page">
        <div className="login-neon-frame">
          <div className="login-inner">
            <section className="relative flex w-full items-center justify-center px-5 py-8 lg:px-8">
              <div className="login-card">
                <div className="mb-8 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-[#102E85]">
                    Enlace inválido o expirado
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-[#8190AF]">
                    El enlace de restablecimiento que usaste no es
                    válido o ya expiró. Solicita uno nuevo desde la
                    pantalla de inicio de sesión.
                  </p>
                </div>

                <div className="mt-6 text-center text-xs text-[#8190AF]">
                  <a className="forgot-button" href={LOGIN_URL}>
                    Volver al inicio de sesión
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return <ResetPasswordForm token={token} />;
}
