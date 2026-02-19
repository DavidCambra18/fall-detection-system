import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('Pruebas de Control de Acceso (RBAC)', () => {
  
  afterAll(async () => {
    await pool.end();
  });

  // Criterio: Login con credenciales incorrectas (401/400)
  it('Debe rechazar el login con contraseña errónea', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: 'wrongpassword' });
    
    expect(res.statusCode).toBe(400);
  });

  // Criterio: Usuario normal intenta cambiar rol (403)
  it('Debe denegar a un "Usuario" (Marta) el acceso a gestión de otros usuarios', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marta@gmail.com', password: 'Marta1234!' });
    
    const token = loginRes.body.token;

    // 2. Intentar obtener la lista de todos los usuarios (Solo Admin)
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Acceso denegado');
  });
});