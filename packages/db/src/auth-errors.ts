export interface AuthErrorLike {
  message?: string;
  statusCode?: number;
}

const MENSAJE_GENERICO = 'No se pudo completar la solicitud. Inténtalo de nuevo.';
const MENSAJE_RED =
  'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

const FRAGMENTOS_RED = [
  'failed to fetch',
  'fetch failed',
  'networkerror',
  'network error',
  'load failed',
  'timeout',
  'timed out',
  'econnrefused',
  'econnreset',
  'enotfound',
  'socket hang up',
];

/**
 * Traduce un error de auth de InsForge a un mensaje apto para mostrar al
 * usuario. NUNCA devuelve el texto crudo del SDK/backend (evita que en la
 * pantalla aparezcan cosas como "Failed to fetch" o códigos internos).
 * El mensaje original se registra solo en el servidor.
 */
export function formatAuthError(error: AuthErrorLike | null) {
  if (!error) return null;

  const raw = error.message ?? '';
  let message: string;

  if (raw.includes('Invalid credentials')) {
    message = 'Correo electrónico o contraseña incorrectos';
  } else if (raw.includes('Email verification required')) {
    message = 'Se requiere verificar el correo electrónico antes de iniciar sesión';
  } else if (raw.includes('Service Temporarily Unavailable')) {
    message = 'El servicio no está disponible temporalmente';
  } else if (raw.includes('Invalid or expired verification code')) {
    message = 'El código es inválido o expiró';
  } else if (FRAGMENTOS_RED.some((fragmento) => raw.toLowerCase().includes(fragmento))) {
    message = MENSAJE_RED;
  } else {
    console.error('InsForge auth error:', raw || error);
    message = MENSAJE_GENERICO;
  }

  return { message };
}
