import { Request, Response } from 'express';
import { MCPService } from '../services/mcp.service';

export class MCPController {
  
  /**
   * Lista todas las herramientas disponibles
   * GET /api/mcp/tools
   */
  static async listTools(req: Request, res: Response) {
    try {
      const tools = MCPService.getAvailableTools();
      res.json({
        tools,
        version: '1.0.0',
        description: 'Sistema de detección de caídas - Herramientas MCP'
      });
    } catch (error: any) {
      console.error('Error listando herramientas MCP:', error);
      res.status(500).json({ 
        error: 'Error al listar herramientas',
        message: error.message 
      });
    }
  }

  /**
   * Ejecuta una herramienta específica
   * POST /api/mcp/execute
   */
  static async executeTool(req: Request, res: Response) {
    try {
      const { tool, arguments: args } = req.body;

      if (!tool) {
        return res.status(400).json({ 
          error: 'El campo "tool" es requerido' 
        });
      }

      const result = await MCPService.executeTool(tool, args || {});
      
      res.json({
        success: true,
        tool,
        result
      });
    } catch (error: any) {
      console.error('Error ejecutando herramienta MCP:', error);
      
      if (error.message.includes('desconocida')) {
        return res.status(404).json({ 
          error: 'Herramienta no encontrada',
          message: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al ejecutar herramienta',
        message: error.message 
      });
    }
  }

  /**
   * Endpoint para chatear con el sistema (integración con OpenAI)
   * POST /api/mcp/chat
   */
  static async chat(req: Request, res: Response) {
    try {
      const { message, conversation_history } = req.body;

      if (!message) {
        return res.status(400).json({ 
          error: 'El campo "message" es requerido' 
        });
      }

      // Aquí podrías integrar con OpenAI API si quieres un chat completo
      // Por ahora, devolvemos las herramientas disponibles y un mensaje guía
      
      const tools = MCPService.getAvailableTools();
      
      res.json({
        message: 'Sistema MCP activo. Herramientas disponibles:',
        tools: tools.map(t => ({
          name: t.name,
          description: t.description
        })),
        suggestion: 'Usa el endpoint /api/mcp/execute para ejecutar herramientas específicas'
      });
    } catch (error: any) {
      console.error('Error en chat MCP:', error);
      res.status(500).json({ 
        error: 'Error en el chat',
        message: error.message 
      });
    }
  }

  /**
   * Health check del servicio MCP
   * GET /api/mcp/health
   */
  static async health(req: Request, res: Response) {
    res.json({
      status: 'ok',
      service: 'MCP Server',
      timestamp: new Date().toISOString(),
      tools_count: MCPService.getAvailableTools().length
    });
  }
}