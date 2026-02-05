declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      roleId?: number;
    };
  }
}
