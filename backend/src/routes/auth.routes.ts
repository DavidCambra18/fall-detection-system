// src/routes/auth.routes.ts
import { Router } from 'express';
import { registerController, loginController } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register
router.post('/register', registerController);

// POST /api/auth/login
router.post('/login', loginController);

export default router;
