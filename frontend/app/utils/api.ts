/**
 * Utilidad para realizar peticiones autenticadas.
 * Cumple la función de un "interceptor" añadiendo el Bearer Token automáticamente.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Recuperamos el token del localStorage de forma segura en el cliente
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  /**
   * CAMBIO CLAVE: Dejamos baseUrl vacío. 
   * Al llamar a /api/..., el navegador no detecta cambio de puerto (se mantiene en el 4000)
   * y Next.js redirige internamente al 3000 según tu next.config.ts.
   */
  const baseUrl = ''; 
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    // Añadimos el token siguiendo el estándar Bearer para las rutas protegidas
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  // La petición ahora es relativa al origen (http://localhost:4000)
  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });
}