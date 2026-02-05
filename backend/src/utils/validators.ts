/**
 * Valida que el email tenga un formato correcto
 * @param email string
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida que la contraseña cumpla con criterios mínimos
 * - Al menos 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * @param password string
 * @returns boolean
 */
export const isValidPassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

/**
 * Valida que el nombre no esté vacío y tenga solo letras y espacios
 * @param name string
 * @returns boolean
 */
export const isValidName = (name: string): boolean => {
  // Permitir letras Unicode (tildes, ñ) y caracteres comunes en nombres
  const regex = /^\p{L}[\p{L}\s'\-]*$/u;
  return regex.test(name) && name.trim().length > 0;
};

/**
 * Valida que los apellidos no estén vacíos y tengan solo letras y espacios
 * @param surnames string
 * @returns boolean
 */
export const isValidSurnames = (surnames: string): boolean => {
  const regex = /^[\p{L}\s'\-]*$/u; // permite vacío y caracteres Unicode
  return regex.test(surnames);
};

/**
 * Valida que la fecha de nacimiento sea una fecha válida
 * @param dateStr string en formato YYYY-MM-DD
 * @returns boolean
 */
export const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Valida que el ID del dispositivo tenga un formato correcto (solo letras, números, guiones y guiones bajos)
 * @param id string
 * @returns boolean
 */
export const isValidDeviceId = (id: string): boolean => {
  return /^[A-Za-z0-9\-_]+$/.test(id);
};

/**
 * Valida que la dirección MAC tenga un formato correcto (XX:XX:XX:XX:XX:XX)
 * @param mac string
 * @returns boolean
 */
export const isValidMAC = (mac: string): boolean => {
  return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac);
};

/**
 * Valida que el número de teléfono tenga un formato correcto (permite +34, espacios y números)
 * @param phone string
 * @returns boolean
 */
export const isValidPhone = (phone: string): boolean => {
  // Permite +34, espacios y números
  const regex = /^\+?[0-9\s]{7,20}$/;
  return regex.test(phone);
};