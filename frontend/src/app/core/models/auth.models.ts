/**
 * Representa los datos del usuario que viajan dentro del Token 
 * y que guardamos en el LocalStorage para la sesión activa.
 */
export interface UserSession {
  id: number;
  email: string;
  roleId: number; // Mapeado desde role_id en la BD
  name: string;
}

/**
 * Modelo completo del usuario para la tabla de gestión y perfiles.
 * Incluye los campos adicionales de tu script init.sql.
 */
export interface User extends UserSession {
  phone_num: string;
  surnames?: string;
  date_born?: string;
  carer_id?: number | null; // El ID del Cuidador (Manolo) si el rol es 3
}

/**
 * Respuesta del servidor tras un login exitoso.
 */
export interface AuthResponse {
  token: string;
  user: UserSession;
}

/**
 * Datos necesarios para el formulario de login.
 */
export interface LoginInput {
  email: string;
  password: string;
}