export interface Report {
  id: number;
  user_id: number;
  device_id: number;
  acc_x: number;
  acc_y: number;
  acc_z: number;
  fall_detected: boolean;
  date_rep: string; // Viene como string ISO de la DB
  confirmed: boolean | null;
  // Estos campos los uniremos en el backend para que la tabla sea legible
  user_name?: string;
  carer_id?: number; 
}