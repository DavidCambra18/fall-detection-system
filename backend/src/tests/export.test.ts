import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('Export CSV Integration Tests', () => {
    let adminToken: string;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'Admin1234!' });
        adminToken = adminLogin.body.token;
    });

    afterAll(async () => {
        await pool.end();
    });

    it('Debe permitir a un admin exportar el historial de eventos a CSV', async () => {
        const res = await request(app)
            .get('/api/events/export')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        expect(res.header['content-type']).toContain('text/csv');

        expect(res.header['content-disposition']).toContain('attachment; filename=historial_caidas.csv');

        expect(res.text).toContain('ID,User_ID,Device_ID,Acc_X,Acc_Y,Acc_Z,Fall_Detected,Date,Confirmed');
        
        expect(res.text).toContain(',3,1,'); 
    });

    it('Debe permitir exportar solo los eventos de un dispositivo específico', async () => {
        const res = await request(app)
            .get('/api/events/export?device_id=2')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain(',2,'); 
        expect(res.text).not.toContain(',1,'); 
    });

    it('Debe denegar la exportación si no se proporciona un token válido', async () => {
        const res = await request(app).get('/api/events/export');
        
        expect(res.statusCode).toBe(401);
    });
});