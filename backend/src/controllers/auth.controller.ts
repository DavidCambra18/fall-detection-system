import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export const registerController = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'Usuario registrado', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const data = await loginUser(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};