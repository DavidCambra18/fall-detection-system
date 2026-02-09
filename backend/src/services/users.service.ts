import { pool } from '../db';

export const getUsers = async () => {
    const result = await pool.query(`
    SELECT 
      u.id,
      u.email,
      u.name,
      u.surnames,
      u.phone_num,
      u.role_id,
      r.name AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.id ASC
  `);

    return result.rows;
};

export async function getUsersCaredByCarer(carerId: number) {
    const query = `
    SELECT id, name, surnames, email, phone_num, date_born
    FROM users
    WHERE carer_id = $1
  `;
    const { rows } = await pool.query(query, [carerId]);
    return rows;
}

export async function getUserById(userId: number) {
    const query = `
    SELECT
      id,
      name,
      surnames,
      email,
      phone_num,
      role_id,
      carer_id,
      date_born
    FROM users
    WHERE id = $1
  `;

    const { rows } = await pool.query(query, [userId]);
    return rows[0];
}