// Utilidades de fetch con timeout y retry para resiliencia

export interface FetchOptions {
  timeout?: number;
  retries?: number;
  delay?: number;
  signal?: AbortSignal;
}

/**
 * Ejecuta una función async con timeout y retry automático.
 * Útil para llamadas a InsForge que pueden fallar por red.
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, retries = 2, delay = 1000, signal } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Si ya hay un signal externo, lo propagamos
      if (signal) {
        signal.addEventListener("abort", () => controller.abort());
      }

      const result = await fn();
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      if (signal?.aborted) {
        throw new Error("Operación cancelada");
      }

      if (attempt === retries) {
        throw error instanceof Error ? error : new Error("Error de red");
      }

      // Exponential backoff
      await new Promise((r) => setTimeout(r, delay * Math.pow(2, attempt)));
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Wrapper para llamadas a InsForge que maneja errores de forma consistente.
 */
export async function safeFetch<T>(
  fn: () => Promise<{ data: T | null; error: unknown }>,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await fetchWithRetry(fn, options);

    if (error) {
      const message =
        (error as { message?: string })?.message ?? "Error desconocido";
      return { data: null, error: message };
    }

    return { data, error: null };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return { data: null, error: "Tiempo de espera agotado" };
      }
      return { data: null, error: err.message };
    }
    return { data: null, error: "Error de red" };
  }
}

/**
 * Hook para detectar estado de conexión.
 */
export function useOnlineStatus() {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
