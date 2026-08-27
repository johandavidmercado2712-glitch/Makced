import { createServerClient } from '@insforge/sdk/ssr';
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const insforge = createServerClient({
    cookies: await cookies(),
  });

  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
}
