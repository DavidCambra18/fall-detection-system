// src/routes/auth.routes.ts
import { Router } from 'express';
import { registerController, loginController, googleLoginController} from '../controllers/auth.controller';
import { receiveTelemetry } from '../controllers/devices.controller';

const router = Router();

// POST /api/auth/register
router.post('/register', registerController);

// POST /api/auth/login
router.post('/login', loginController);

// POST /api/auth/google-login
router.post('/google-login', googleLoginController);

// Esta es la URL que pondrás en el ESP32 POST /api/auth/telemetry
router.post('/telemetry', receiveTelemetry);

export default router;
