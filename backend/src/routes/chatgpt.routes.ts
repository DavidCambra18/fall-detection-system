import { Router } from 'express';
import { ChatGPTController } from '../controllers/chatgpt.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// POST /api/chatgpt/ask - Consulta general
router.post('/ask', ChatGPTController.ask);

// GET /api/chatgpt/analyze/:deviceId - Analizar dispositivo
router.get('/analyze/:deviceId', ChatGPTController.analyzeDevice);

// POST /api/chatgpt/report - Generar reporte
router.post('/report', ChatGPTController.generateReport);

// POST /api/chatgpt/suggest - Obtener sugerencias
router.post('/suggest', ChatGPTController.getSuggestions);

export default router;