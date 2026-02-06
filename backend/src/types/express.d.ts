declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      roleId?: number;
    };
  }
}

export interface Event {
  id: number;
  user_id: number;
  device_id: number;
  acc_x: number;
  acc_y: number;
  acc_z: number;
  fall_detected: boolean;
  confirmed?: boolean | null;
  date_rep: string;
}