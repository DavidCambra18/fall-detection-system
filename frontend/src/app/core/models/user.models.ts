export interface User {
  id: number;
  email: string;
  phone_num: string;
  name: string;
  surnames?: string;
  date_born: string;
  role_id: number; // 1: Admin, 2: Cuidador, 3: Usuario (Paciente)
  carer_id?: number; // Referencia a otro usuario de tipo Cuidador
}

export interface Device {
  id: number;
  device_id_logic: string; // Ej: ESP32-001
  mac: string;
  alias: string;
  status: 'inactive' | 'active' | 'low battery';
  user_id: number;
}

export interface Report {
  id: number;
  user_id: number;
  device_id: number;
  acc_x: number;
  acc_y: number;
  acc_z: number;
  fall_detected: boolean;
  date_rep: string;
  confirmed: boolean | null;
}