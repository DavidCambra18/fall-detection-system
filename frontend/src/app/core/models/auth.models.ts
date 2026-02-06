export interface User {
  id: number;
  email: string;
  name: string;
  roleId: number; // Basado en el role_id de PostgreSQL (1, 2 o 3)
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}