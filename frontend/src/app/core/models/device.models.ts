export interface Device {
  id: number;
  user_id: number | null;
  model: string;      // Ej: "MPU6050-NodeJS"
  battery: number;    // 0 a 100
  status: 'online' | 'offline';
  last_connection: string;
  user_name?: string; // Para saber a quién pertenece
}