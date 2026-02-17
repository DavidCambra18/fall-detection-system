import axios from 'axios';
import { pool } from '../db';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL || 'openai/gpt-4o-mini';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class ChatGPTService {

  /**
   * Consulta a ChatGPT sobre datos del sistema
   */
  static async askChatGPT(userMessage: string, userId?: number): Promise<string> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('API Key de OpenRouter no configurada');
    }

    try {
      // Obtener contexto del sistema si hay userId
      let systemContext = this.getSystemPrompt();

      if (userId) {
        const context = await this.getUserContext(userId);
        systemContext += `\n\nContexto del usuario:\n${context}`;
      }

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: systemContext
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Fall Detection System'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error en ChatGPT:', error.response?.data || error.message);
      throw new Error('Error al consultar ChatGPT');
    }
  }

  /**
   * Analiza datos de caídas con IA
   */
  static async analyzeFallData(deviceId: number): Promise<string> {
    try {
      // Obtener últimos 10 eventos del dispositivo
      const events = await pool.query(
        `SELECT acc_x, acc_y, acc_z, fall_detected, date_rep 
         FROM reports 
         WHERE device_id = $1 
         ORDER BY date_rep DESC 
         LIMIT 10`,
        [deviceId]
      );

      if (events.rows.length === 0) {
        return 'No hay datos suficientes para analizar.';
      }

      const dataStr = events.rows.map((e: any) =>
        `Fecha: ${e.date_rep}, AccX: ${e.acc_x}, AccY: ${e.acc_y}, AccZ: ${e.acc_z}, Caída: ${e.fall_detected ? 'SÍ' : 'NO'}`
      ).join('\n');

      const prompt = `Analiza los siguientes datos de un sensor de caídas y dame un resumen breve sobre:
1. Patrones detectados
2. Nivel de actividad
3. Recomendaciones de seguridad

Datos:
${dataStr}

Responde en máximo 150 palabras, en español, de forma clara y profesional.`;

      return await this.askChatGPT(prompt);
    } catch (error: any) {
      console.error('Error analizando datos:', error);
      throw new Error('Error al analizar datos de caídas');
    }
  }

  /**
   * Genera reporte con IA
   */
  static async generateReport(userId: number, startDate?: string, endDate?: string): Promise<string> {
    try {
      let query = `
        SELECT r.*, d.device_id_logic, d.alias 
        FROM reports r
        JOIN devices d ON r.device_id = d.id
        WHERE r.user_id = $1
      `;
      const params: any[] = [userId];

      if (startDate) {
        params.push(startDate);
        query += ` AND r.date_rep >= $${params.length}`;
      }
      if (endDate) {
        params.push(endDate);
        query += ` AND r.date_rep <= $${params.length}`;
      }

      query += ` ORDER BY r.date_rep DESC LIMIT 50`;

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return 'No hay datos en el período seleccionado.';
      }

      const totalEvents = result.rows.length;
      const fallsDetected = result.rows.filter((r: any) => r.fall_detected).length;
      const devices = [...new Set(result.rows.map((r: any) => r.device_id_logic))];

      const prompt = `Genera un reporte médico/técnico breve sobre:

Total eventos: ${totalEvents}
Caídas detectadas: ${fallsDetected}
Dispositivos: ${devices.join(', ')}
Período: ${startDate || 'inicio'} a ${endDate || 'hoy'}

Incluye:
1. Resumen ejecutivo
2. Evaluación de riesgo
3. Recomendaciones

Máximo 200 palabras, español, tono profesional.`;

      return await this.askChatGPT(prompt);
    } catch (error: any) {
      console.error('Error generando reporte:', error);
      throw new Error('Error al generar reporte');
    }
  }

  /**
   * Prompt del sistema
   */
  private static getSystemPrompt(): string {
    return `Eres un asistente IA experto en sistemas de detección de caídas para personas mayores.
Tu trabajo es analizar datos de sensores (acelerómetros) y proporcionar información útil, clara y profesional.
Siempre responde en español, de forma concisa y enfocada en la seguridad del usuario.
No inventes datos, solo analiza lo que se te proporciona.`;
  }

  /**
   * Obtiene contexto del usuario
   */
  private static async getUserContext(userId: number): Promise<string> {
    try {
      // Datos del usuario
      const userResult = await pool.query(
        'SELECT name, surnames, date_born FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) return '';

      const user = userResult.rows[0];

      // Dispositivos del usuario
      const devicesResult = await pool.query(
        'SELECT device_id_logic, alias, status FROM devices WHERE user_id = $1',
        [userId]
      );

      // Últimas caídas
      const fallsResult = await pool.query(
        `SELECT COUNT(*) as total FROM reports 
         WHERE user_id = $1 AND fall_detected = true 
         AND date_rep >= NOW() - INTERVAL '30 days'`,
        [userId]
      );

      const context = `
Usuario: ${user.name} ${user.surnames || ''}
Edad aproximada: ${user.date_born ? this.calculateAge(user.date_born) : 'N/A'}
Dispositivos: ${devicesResult.rows.length}
Caídas últimos 30 días: ${fallsResult.rows[0]?.total || 0}
      `.trim();

      return context;
    } catch (error) {
      return '';
    }
  }

  /**
   * Calcula edad aproximada
   */
  private static calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}