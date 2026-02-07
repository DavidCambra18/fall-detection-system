// src/app/core/models/auth.models.ts

export interface User {
  id: number;
  email: string;
  name: string;
  roleId: number;     // Obligatorio para el sistema de roles
  surnames?: string;
  phone_num?: string;
  date_born?: string;
  carer_id?: number | null;
}

export interface AuthResponse {
  token: string;
  user: User; // Ahora usa el modelo unificado
}

export interface LoginInput {
  email: string;
  password: string;
}