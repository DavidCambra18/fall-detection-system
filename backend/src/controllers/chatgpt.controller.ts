import { Request, Response } from 'express';
import { ChatGPTService } from '../services/chatgpt.service';

export class ChatGPTController {

  /**
   * POST /api/chatgpt/ask
   * Consulta general a ChatGPT
   */
  static async ask(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const userId = (req as any).user?.id;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: 'El mensaje es requerido' });
      }

      const response = await ChatGPTService.askChatGPT(message, userId);

      res.json({
        success: true,
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error en ask:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Error al consultar ChatGPT' 
      });
    }
  }

  /**
   * GET /api/chatgpt/analyze/:deviceId
   * Analiza datos de un dispositivo
   */
  static async analyzeDevice(req: Request, res: Response) {
    try {
      const deviceIdParam = req.params.deviceId;
      const deviceId = parseInt(Array.isArray(deviceIdParam) ? deviceIdParam[0] : deviceIdParam);

      if (isNaN(deviceId)) {
        return res.status(400).json({ message: 'ID de dispositivo inválido' });
      }

      const analysis = await ChatGPTService.analyzeFallData(deviceId);

      res.json({
        success: true,
        deviceId,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error en analyzeDevice:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Error al analizar dispositivo' 
      });
    }
  }

  /**
   * POST /api/chatgpt/report
   * Genera reporte con IA
   */
  static async generateReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { startDate, endDate } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const report = await ChatGPTService.generateReport(userId, startDate, endDate);

      res.json({
        success: true,
        report,
        period: {
          start: startDate || 'inicio',
          end: endDate || 'hoy'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error en generateReport:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Error al generar reporte' 
      });
    }
  }

  /**
   * POST /api/chatgpt/suggest
   * Obtiene sugerencias de seguridad
   */
  static async getSuggestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const prompt = `Proporciona 5 consejos breves de seguridad para prevenir caídas en personas mayores. 
Máximo 100 palabras total, formato lista numerada.`;

      const suggestions = await ChatGPTService.askChatGPT(prompt, userId);

      res.json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error en getSuggestions:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Error al obtener sugerencias' 
      });
    }
  }
}