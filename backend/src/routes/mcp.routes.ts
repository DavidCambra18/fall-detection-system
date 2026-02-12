import { Router } from 'express';
import { MCPController } from '../controllers/mcp.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Health check (público)
router.get('/health', MCPController.health);

// Listar herramientas disponibles (requiere autenticación)
router.get('/tools', authenticateToken, MCPController.listTools);

// Ejecutar una herramienta (requiere autenticación)
router.post('/execute', authenticateToken, MCPController.executeTool);

// Chat con el sistema (requiere autenticación)
router.post('/chat', authenticateToken, MCPController.chat);

export default router;