import { pool } from '../db';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export class MCPService {
  
  /**
   * Lista todas las herramientas disponibles para ChatGPT
   */
  static getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'get_fall_events',
        description: 'Obtiene eventos de caídas detectadas. Puede filtrar por usuario, dispositivo, rango de fechas y estado de confirmación.',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: {
              type: 'number',
              description: 'ID del usuario para filtrar eventos'
            },
            device_id: {
              type: 'number',
              description: 'ID del dispositivo para filtrar eventos'
            },
            start_date: {
              type: 'string',
              description: 'Fecha de inicio en formato YYYY-MM-DD'
            },
            end_date: {
              type: 'string',
              description: 'Fecha de fin en formato YYYY-MM-DD'
            },
            confirmed: {
              type: 'boolean',
              description: 'Filtrar por eventos confirmados o no confirmados'
            },
            limit: {
              type: 'number',
              description: 'Número máximo de resultados (default: 50)'
            }
          }
        }
      },
      {
        name: 'get_device_info',
        description: 'Obtiene información detallada de un dispositivo específico o lista todos los dispositivos.',
        inputSchema: {
          type: 'object',
          properties: {
            device_id: {
              type: 'number',
              description: 'ID del dispositivo (opcional, si no se proporciona devuelve todos)'
            }
          }
        }
      },
      {
        name: 'get_user_info',
        description: 'Obtiene información de usuarios del sistema.',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: {
              type: 'number',
              description: 'ID del usuario (opcional, si no se proporciona devuelve todos)'
            },
            email: {
              type: 'string',
              description: 'Email del usuario para búsqueda'
            }
          }
        }
      },
      {
        name: 'get_statistics',
        description: 'Obtiene estadísticas del sistema: total de caídas, caídas confirmadas, dispositivos activos, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: {
              type: 'string',
              description: 'Fecha de inicio para estadísticas (formato: YYYY-MM-DD)'
            },
            end_date: {
              type: 'string',
              description: 'Fecha de fin para estadísticas (formato: YYYY-MM-DD)'
            }
          }
        }
      },
      {
        name: 'update_event_confirmation',
        description: 'Actualiza el estado de confirmación de un evento de caída.',
        inputSchema: {
          type: 'object',
          properties: {
            event_id: {
              type: 'number',
              description: 'ID del evento a actualizar'
            },
            confirmed: {
              type: 'boolean',
              description: 'Estado de confirmación (true para confirmar caída real, false para falsa alarma)'
            }
          },
          required: ['event_id', 'confirmed']
        }
      },
      {
        name: 'get_device_history',
        description: 'Obtiene el historial de lecturas de aceleración de un dispositivo específico.',
        inputSchema: {
          type: 'object',
          properties: {
            device_id: {
              type: 'number',
              description: 'ID del dispositivo'
            },
            start_date: {
              type: 'string',
              description: 'Fecha de inicio (formato: YYYY-MM-DD)'
            },
            end_date: {
              type: 'string',
              description: 'Fecha de fin (formato: YYYY-MM-DD)'
            },
            limit: {
              type: 'number',
              description: 'Número máximo de registros (default: 100)'
            }
          },
          required: ['device_id']
        }
      }
    ];
  }

  /**
   * Ejecuta una herramienta específica
   */
  static async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'get_fall_events':
        return await this.getFallEvents(args);
      
      case 'get_device_info':
        return await this.getDeviceInfo(args);
      
      case 'get_user_info':
        return await this.getUserInfo(args);
      
      case 'get_statistics':
        return await this.getStatistics(args);
      
      case 'update_event_confirmation':
        return await this.updateEventConfirmation(args);
      
      case 'get_device_history':
        return await this.getDeviceHistory(args);
      
      default:
        throw new Error(`Herramienta desconocida: ${toolName}`);
    }
  }

  /**
   * Obtiene eventos de caídas con filtros opcionales
   */
  private static async getFallEvents(filters: any) {
    let query = `
      SELECT 
        r.id,
        r.user_id,
        r.device_id,
        r.acc_x,
        r.acc_y,
        r.acc_z,
        r.fall_detected,
        r.confirmed,
        r.date_rep,
        u.name as user_name,
        u.surnames as user_surnames,
        d.device_id_logic,
        d.alias as device_alias
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN devices d ON r.device_id = d.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;

    if (filters.user_id) {
      query += ` AND r.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.device_id) {
      query += ` AND r.device_id = $${paramCount}`;
      params.push(filters.device_id);
      paramCount++;
    }

    if (filters.start_date) {
      query += ` AND r.date_rep >= $${paramCount}`;
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND r.date_rep <= $${paramCount}`;
      params.push(filters.end_date);
      paramCount++;
    }

    if (filters.confirmed !== undefined) {
      query += ` AND r.confirmed = $${paramCount}`;
      params.push(filters.confirmed);
      paramCount++;
    }

    if (filters.fall_detected !== false) {
      query += ` AND r.fall_detected = true`;
    }

    query += ` ORDER BY r.date_rep DESC`;

    const limit = filters.limit || 50;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);
    
    return {
      total: result.rows.length,
      events: result.rows
    };
  }

  /**
   * Obtiene información de dispositivos
   */
  private static async getDeviceInfo(args: any) {
    if (args.device_id) {
      const result = await pool.query(
        `SELECT 
          d.*,
          u.name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM reports WHERE device_id = d.id) as total_reports,
          (SELECT COUNT(*) FROM reports WHERE device_id = d.id AND fall_detected = true) as total_falls
        FROM devices d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.id = $1`,
        [args.device_id]
      );
      
      return result.rows[0] || null;
    } else {
      const result = await pool.query(
        `SELECT 
          d.*,
          u.name as user_name,
          u.email as user_email,
          (SELECT COUNT(*) FROM reports WHERE device_id = d.id) as total_reports,
          (SELECT COUNT(*) FROM reports WHERE device_id = d.id AND fall_detected = true) as total_falls
        FROM devices d
        LEFT JOIN users u ON d.user_id = u.id
        ORDER BY d.id`
      );
      
      return {
        total: result.rows.length,
        devices: result.rows
      };
    }
  }

  /**
   * Obtiene información de usuarios
   */
  private static async getUserInfo(args: any) {
    if (args.user_id) {
      const result = await pool.query(
        `SELECT 
          u.id,
          u.email,
          u.name,
          u.surnames,
          u.phone_num,
          u.date_born,
          u.role_id,
          (SELECT COUNT(*) FROM devices WHERE user_id = u.id) as devices_count,
          (SELECT COUNT(*) FROM reports WHERE user_id = u.id AND fall_detected = true) as total_falls
        FROM users u
        WHERE u.id = $1`,
        [args.user_id]
      );
      
      return result.rows[0] || null;
    } else if (args.email) {
      const result = await pool.query(
        `SELECT 
          u.id,
          u.email,
          u.name,
          u.surnames,
          u.phone_num,
          u.date_born,
          u.role_id,
          (SELECT COUNT(*) FROM devices WHERE user_id = u.id) as devices_count,
          (SELECT COUNT(*) FROM reports WHERE user_id = u.id AND fall_detected = true) as total_falls
        FROM users u
        WHERE u.email = $1`,
        [args.email]
      );
      
      return result.rows[0] || null;
    } else {
      const result = await pool.query(
        `SELECT 
          u.id,
          u.email,
          u.name,
          u.surnames,
          u.phone_num,
          u.role_id,
          (SELECT COUNT(*) FROM devices WHERE user_id = u.id) as devices_count,
          (SELECT COUNT(*) FROM reports WHERE user_id = u.id AND fall_detected = true) as total_falls
        FROM users u
        ORDER BY u.id`
      );
      
      return {
        total: result.rows.length,
        users: result.rows
      };
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  private static async getStatistics(args: any) {
    let dateFilter = '';
    const params: any[] = [];

    if (args.start_date && args.end_date) {
      dateFilter = 'WHERE date_rep >= $1 AND date_rep <= $2';
      params.push(args.start_date, args.end_date);
    } else if (args.start_date) {
      dateFilter = 'WHERE date_rep >= $1';
      params.push(args.start_date);
    } else if (args.end_date) {
      dateFilter = 'WHERE date_rep <= $1';
      params.push(args.end_date);
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE fall_detected = true) as total_falls,
        COUNT(*) FILTER (WHERE fall_detected = true AND confirmed = true) as confirmed_falls,
        COUNT(*) FILTER (WHERE fall_detected = true AND confirmed = false) as false_alarms,
        COUNT(*) FILTER (WHERE fall_detected = true AND confirmed IS NULL) as pending_confirmation,
        AVG(acc_x) as avg_acc_x,
        AVG(acc_y) as avg_acc_y,
        AVG(acc_z) as avg_acc_z
      FROM reports
      ${dateFilter}
    `;

    const devicesQuery = `
      SELECT 
        COUNT(*) as total_devices,
        COUNT(*) FILTER (WHERE status = 'active') as active_devices,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_devices,
        COUNT(*) FILTER (WHERE status = 'low battery') as low_battery_devices
      FROM devices
    `;

    const usersQuery = `SELECT COUNT(*) as total_users FROM users`;

    const [statsResult, devicesResult, usersResult] = await Promise.all([
      pool.query(statsQuery, params),
      pool.query(devicesQuery),
      pool.query(usersQuery)
    ]);

    return {
      period: {
        start: args.start_date || 'all time',
        end: args.end_date || 'now'
      },
      reports: statsResult.rows[0],
      devices: devicesResult.rows[0],
      users: usersResult.rows[0]
    };
  }

  /**
   * Actualiza el estado de confirmación de un evento
   */
  private static async updateEventConfirmation(args: any) {
    const result = await pool.query(
      `UPDATE reports 
       SET confirmed = $1 
       WHERE id = $2 
       RETURNING *`,
      [args.confirmed, args.event_id]
    );

    if (result.rows.length === 0) {
      throw new Error(`Evento con ID ${args.event_id} no encontrado`);
    }

    return {
      success: true,
      message: `Evento ${args.event_id} actualizado correctamente`,
      event: result.rows[0]
    };
  }

  /**
   * Obtiene el historial de lecturas de un dispositivo
   */
  private static async getDeviceHistory(args: any) {
    let query = `
      SELECT 
        id,
        acc_x,
        acc_y,
        acc_z,
        fall_detected,
        confirmed,
        date_rep
      FROM reports
      WHERE device_id = $1
    `;
    
    const params: any[] = [args.device_id];
    let paramCount = 2;

    if (args.start_date) {
      query += ` AND date_rep >= $${paramCount}`;
      params.push(args.start_date);
      paramCount++;
    }

    if (args.end_date) {
      query += ` AND date_rep <= $${paramCount}`;
      params.push(args.end_date);
      paramCount++;
    }

    query += ` ORDER BY date_rep DESC`;

    const limit = args.limit || 100;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);

    return {
      device_id: args.device_id,
      total_records: result.rows.length,
      history: result.rows
    };
  }
}