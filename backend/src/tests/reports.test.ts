import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('Reports & Events Integration Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: 'Admin1234!' });
    adminToken = res.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test: Listado y Filtrado 
  it('Debe filtrar los reportes por device_id (Filtro Marta - ESP32-001)', async () => {
    const res = await request(app)
      .get('/api/events?device_id=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    res.body.forEach((report: any) => {
      expect(report.device_id).toBe(1);
    });
  });

  // Test: Confirmación de Falsa Alarma 
  it('Debe permitir confirmar si una caída fue real o falsa alarma', async () => {
    const reportId = 2; 
    
    const res = await request(app)
      .patch(`/api/events/${reportId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ confirmed: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.confirmed).toBe(false);

    const dbCheck = await pool.query('SELECT confirmed FROM reports WHERE id = $1', [reportId]);
    expect(dbCheck.rows[0].confirmed).toBe(false);
  });

  // Test: Seguridad (RBAC)
  it('Debe denegar el acceso a reportes si no se envía token', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(401); 
  });
});