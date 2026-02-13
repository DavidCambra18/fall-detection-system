import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

// Configurar conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface TelemetryInput {
  deviceId: string;
  accX: number;
  accY: number;
  accZ: number;
  fallDetected: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("=".repeat(50));
  console.log("📡 TELEMETRÍA RECIBIDA");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("=".repeat(50));

  try {
    const data: TelemetryInput = req.body;

    // Validar campos requeridos
    if (!data.deviceId) {
      throw new Error('Campo deviceId es requerido');
    }

    // Limpiar deviceId
    const cleanId = String(data.deviceId).replace(/:/g, '');

    // Buscar dispositivo en DB
    const deviceCheck = await pool.query(
      'SELECT id, user_id FROM devices WHERE device_id_logic=$1',
      [cleanId]
    );

    if (deviceCheck.rows.length === 0) {
      throw new Error(`Dispositivo no registrado en BD: ${cleanId}`);
    }

    const { id: dbDeviceId, user_id: dbUserId } = deviceCheck.rows[0];

    // Insertar telemetría
    const result = await pool.query(
      `INSERT INTO reports (user_id, device_id, acc_x, acc_y, acc_z, fall_detected)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [dbUserId, dbDeviceId, data.accX, data.accY, data.accZ, data.fallDetected]
    );

    console.log("✅ Telemetría registrada exitosamente:", result.rows[0]);

    return res.status(201).json({
      status: 'success',
      message: 'Telemetría recibida',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error("❌ Error al procesar telemetría:", error.message);
    console.error("Stack:", error.stack);

    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}
