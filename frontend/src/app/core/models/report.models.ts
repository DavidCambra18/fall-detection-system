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
  
  // Propiedades opcionales para UI y Joins de backend
  user_name?: string;
  carer_id?: number; 

  /** * Campo calculado en el frontend para distinguir 
   * entre caída física y pulsación de botón manual 
   */
  isPanicButton?: boolean; 
}