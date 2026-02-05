/**
 * Utilidad para realizar peticiones autenticadas.
 * Cumple la función de un "interceptor" añadiendo el Bearer Token automáticamente.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Recuperamos el token del localStorage de forma segura en el cliente
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // BASE URL obtenida desde la variable de entorno pública
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || '';

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });
}