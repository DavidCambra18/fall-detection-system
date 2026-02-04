/**
 * Utilidad para realizar peticiones autenticadas.
 * Cumple la función de un "interceptor" añadiendo el Bearer Token automáticamente.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Tarea técnica: Almacenar/Recuperar el token del localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    // Si tenemos token, lo añadimos siguiendo el estándar Bearer
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });
}