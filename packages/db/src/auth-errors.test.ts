import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatAuthError } from './auth-errors';

describe('formatAuthError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('devuelve null si no hay error', () => {
    expect(formatAuthError(null)).toBeNull();
  });

  it('traduce credenciales inválidas', () => {
    expect(formatAuthError({ message: 'Invalid credentials' })).toEqual({
      message: 'Correo electrónico o contraseña incorrectos',
    });
  });

  it('traduce errores de red a un mensaje amigable', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(formatAuthError({ message: 'Failed to fetch' })).toEqual({
      message:
        'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    });
    expect(formatAuthError({ message: 'fetch failed' })).toEqual({
      message:
        'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('oculta el texto crudo de errores desconocidos', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = formatAuthError({ message: 'INTERNAL_CODE_500_XYZ' });

    expect(result).toEqual({
      message: 'No se pudo completar la solicitud. Inténtalo de nuevo.',
    });
    expect(JSON.stringify(result)).not.toContain('INTERNAL_CODE_500_XYZ');
  });

  it('no propaga metadatos internos del error al cliente', () => {
    expect(
      formatAuthError({ message: 'Invalid credentials', statusCode: 401 }),
    ).toEqual({ message: 'Correo electrónico o contraseña incorrectos' });
  });
});
