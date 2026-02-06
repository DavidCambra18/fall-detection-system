import { pool } from '../db';
import jwt from 'jsonwebtoken';
import { isValidEmail, isValidPassword, isValidName, isValidPhone } from '../utils/validators';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  surnames?: string;
  date_born?: string; // YYYY-MM-DD
  phone_num: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (input: RegisterInput) => {
  const { email, password, name, surnames, date_born, phone_num } = input;

  if (!isValidEmail(email)) throw new Error('Email inválido');
  if (!isValidPassword(password)) throw new Error('Contraseña inválida');
  if (!isValidName(name)) throw new Error('Nombre inválido');
  if (!isValidPhone(phone_num)) throw new Error('Número de teléfono inválido');

  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) throw new Error('El email ya está registrado');

  const existingPhone = await pool.query(
    'SELECT id FROM users WHERE phone_num = $1',
    [phone_num]
  );

  if (existingPhone.rows.length > 0) {
    throw new Error('El número de teléfono ya está registrado');
  }

  const bcryptPkg = await import('bcrypt');
  const bcrypt: any = (bcryptPkg && (bcryptPkg.default ?? bcryptPkg));
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const roleId = 3;

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, surnames, date_born, phone_num, role_id)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING id, email, name, surnames, date_born, phone_num, role_id`,
    [
      email,
      hashedPassword,
      name,
      surnames || null,
      date_born || null,
      phone_num,
      roleId
    ]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    surnames: row.surnames,
    date_born: row.date_born,
    phone_num: row.phone_num,
    roleId: row.role_id,
  };
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  if (!isValidEmail(email)) throw new Error('Email inválido');
  if (!password) throw new Error('Contraseña requerida');

  const result = await pool.query('SELECT id, email, password_hash, role_id FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) throw new Error('Usuario no encontrado');

  const bcryptPkg = await import('bcrypt');
  const bcrypt: any = (bcryptPkg && (bcryptPkg.default ?? bcryptPkg));
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: user.id, email: user.email, roleId: user.role_id },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );

  return { token, user: { id: user.id, email: user.email, roleId: user.role_id } };
};


