import { pool } from '../db';
import { isValidDeviceId, isValidMAC } from '../utils/validators';
import { sendDiscordFallAlert } from "./discord.service";

export interface DeviceInput {
  device_id_logic: string;
  mac: string;
  alias?: string;
  status?: 'active' | 'inactive' | 'low battery';
  user_id?: number;
}

// Define la interfaz según lo que envía tu ESP32
export interface TelemetryInput {
  deviceId: string; // Es el "device_id_logic" o MAC que manda el ESP
  accX: number;
  accY: number;
  accZ: number;
  fallDetected: boolean;
}

export const createDevice = async (input: DeviceInput) => {
  const { device_id_logic, mac, alias, status = 'inactive', user_id } = input;

  if (!isValidDeviceId(device_id_logic)) throw new Error('Identificador inválido');
  if (!isValidMAC(mac)) throw new Error('MAC inválida');

  const exists = await pool.query(
    'SELECT id FROM devices WHERE device_id_logic=$1 OR mac=$2', 
    [device_id_logic, mac]
  );
  if (exists.rows.length > 0) throw new Error('Dispositivo ya registrado');

  const result = await pool.query(
    `INSERT INTO devices (device_id_logic, mac, alias, status, user_id)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [device_id_logic, mac, alias || null, status, user_id || null]
  );

  return result.rows[0];
};

export const getDevices = async () => {
  const result = await pool.query('SELECT * FROM devices ORDER BY id ASC');
  return result.rows;
};

export const getDeviceById = async (id: number) => {
  const result = await pool.query('SELECT * FROM devices WHERE id=$1', [id]);
  return result.rows[0];
};

export const updateDevice = async (id: number, input: Partial<DeviceInput>) => {
  const fields = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(input)) {
    if (['device_id_logic','mac','alias','status','user_id'].includes(key)) {
      fields.push(`${key}=$${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) throw new Error('Nada que actualizar');

  values.push(id);
  const result = await pool.query(
    `UPDATE devices SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`,
    values
  );

  return result.rows[0];
};

export const updateDeviceStatus = async (id: number, status: 'active' | 'inactive' | 'low battery') => {
  const result = await pool.query(
    'UPDATE devices SET status=$1 WHERE id=$2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

export const deleteDevice = async (id: number) => {
  await pool.query('DELETE FROM devices WHERE id=$1', [id]);
};



// --- FUNCIÓN CORREGIDA PARA TU NUEVA TABLA REPORTS ---
export const registerTelemetry = async (data: any) => {
  // 1. Validar que data y deviceId existan
  if (!data || !data.deviceId) {
    throw new Error("Petición inválida: Falta el campo 'deviceId'");
  }

  const { deviceId, accX, accY, accZ, fallDetected } = data;

  // 2. Limpieza segura (convertimos a String por si acaso)
  const cleanId = String(deviceId).replace(/:/g, '');

  // 3. Búsqueda en DB
  const deviceCheck = await pool.query(
    'SELECT id, user_id FROM devices WHERE device_id_logic=$1', 
    [cleanId]
  );

  if (deviceCheck.rows.length === 0) {
    // Esto lanzará un 400 en lugar de un 500 gracias al try/catch del router
    throw new Error(`Dispositivo no registrado en BD: ${cleanId}`);
  }

  const { id: dbDeviceId, user_id: dbUserId } = deviceCheck.rows[0];

  // 4. Inserción
  const result = await pool.query(
    `INSERT INTO reports (user_id, device_id, acc_x, acc_y, acc_z, fall_detected)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [dbUserId, dbDeviceId, accX, accY, accZ, fallDetected]
  );

  // Enviar alerta a Discord solo si se detecta una caída
  if (fallDetected) {
    try {
      await sendDiscordFallAlert({
        deviceId: cleanId,
        userId: dbUserId,
        accX,
        accY,
        accZ,
      });
    } catch (err) {
      console.error("Error enviando alerta a Discord", err);
    }
  }

  return result.rows[0];
};