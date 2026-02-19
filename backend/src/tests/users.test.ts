import request from 'supertest';
import app from '../app';
import { pool } from '../db';

describe('User Management & RBAC Tests', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'Admin1234!' });
        adminToken = adminLogin.body.token;

        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'marta@gmail.com', password: 'Marta1234!' });
        userToken = userLogin.body.token;
    });

    afterAll(async () => {
        await pool.end();
    });

    // Tarea: GET /api/users/:id
    it('Debe permitir a un admin obtener cualquier usuario por ID', async () => {
        const res = await request(app).get('/api/users/3')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe('marta@gmail.com');
    });

    // Criterio: Admin cambia rol correctamente
    it('Dado que un admin intenta cambiar el rol de un usuario entonces se realiza correctamente', async () => {
        const res = await request(app).put('/api/users/7')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ role_id: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body.role_id).toBe(2);
    });

    // Criterio: Usuario NO puede cambiar su rol (403)
    it('Dado que un usuario normal intenta cambiar su rol entonces devuelve error 403', async () => {
        const res = await request(app)
            .put('/api/users/3')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ role_id: 1 });

        expect(res.statusCode).toBe(403);
    });

    // Tarea: DELETE /api/users/:id
    it('Debe permitir a un admin borrar un usuario', async () => {
        const tempUser = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test_delete@example.com',
                password: 'Password123!',
                name: 'Usuario',
                surnames: 'Prueba',
                phone_num: '+34000111222'
            });

        const tempUserId = tempUser.body.user.id;

        const res = await request(app)
            .delete(`/api/users/${tempUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain('borrado correctamente');
    });

    // Tarea técnica: Cuidador no puede eliminar usuarios
    it('Debe denegar a un Cuidador (Role 2) el borrado de usuarios', async () => {
        const carerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'manolo@gmail.com', password: 'Manolo1234!' }); 

        const carerToken = carerLogin.body.token;

        const res = await request(app)
            .delete('/api/users/7')
            .set('Authorization', `Bearer ${carerToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Solo admin puede borrar usuarios');
    });

    // Tarea: Validación de errores
    it('Dado que un endpoint recibe datos inválidos entonces devuelve un error controlado', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'no-es-email', password: '1' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });
});