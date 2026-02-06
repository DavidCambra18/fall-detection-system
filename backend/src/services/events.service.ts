import { pool } from '../db';
import { Event } from '../types/express';

export class EventsService {

  static async getAll(filters?: { user_id?: number; device_id?: number; start?: string; end?: string }): Promise<Event[]> {
    let query = `SELECT * FROM reports WHERE 1=1`;
    const params: any[] = [];

    if (filters?.user_id) {
      params.push(filters.user_id);
      query += ` AND user_id = $${params.length}`;
    }
    if (filters?.device_id) {
      params.push(filters.device_id);
      query += ` AND device_id = $${params.length}`;
    }
    if (filters?.start) {
      params.push(filters.start);
      query += ` AND date_rep >= $${params.length}`;
    }
    if (filters?.end) {
      params.push(filters.end);
      query += ` AND date_rep <= $${params.length}`;
    }

    query += ` ORDER BY date_rep DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id: number): Promise<Event | null> {
    const result = await pool.query(`SELECT * FROM reports WHERE id=$1`, [id]);
    return result.rows[0] || null;
  }

  static async create(event: Partial<Event>): Promise<Event> {
    const { user_id, device_id, acc_x, acc_y, acc_z, fall_detected } = event;
    const result = await pool.query(
      `INSERT INTO reports (user_id, device_id, acc_x, acc_y, acc_z, fall_detected)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id, device_id, acc_x, acc_y, acc_z, fall_detected || false]
    );
    return result.rows[0];
  }

  static async confirmEvent(id: number, confirmed: boolean): Promise<Event | null> {
    const result = await pool.query(
      `UPDATE reports SET confirmed=$1 WHERE id=$2 RETURNING *`,
      [confirmed, id]
    );
    return result.rows[0] || null;
  }
}
