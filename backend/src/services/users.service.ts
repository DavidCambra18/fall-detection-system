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

export async function updateUserById(userId: number, data: any) {
  const allowedFields = ['name', 'surnames', 'email', 'phone_num', 'date_born', 'carer_id'];

  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in data) {
    if (!allowedFields.includes(key)) continue;
    fields.push(`${key} = $${idx}`);
    values.push(data[key]);
    idx++;
  }

  if (fields.length === 0) return getUserById(userId);

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, name, surnames, email, phone_num, role_id, carer_id, date_born
  `;
  values.push(userId);

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function deleteUserById(userId: number) {
  const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
}