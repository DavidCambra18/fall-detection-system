import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/devices.routes';
import eventsRoutes from './routes/events.routes';
import usersRoutes from './routes/users.routes';

dotenv.config();

const app = express();

// AHORA USA EL PUERTO 3000 POR DEFECTO (Para coincidir con tu ESP32)
const PORT = process.env.PORT || 3000;

const FRONTEND_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://falldetectionsystem.com'
  : 'http://localhost:4200';

// CORS mejorado: Permite frontend Y dispositivos ESP32
app.use(cors({
  origin: (origin, callback) => {
    // Permitir sin origin (Postman, ESP32, etc.) o desde el frontend
    if (!origin || origin === FRONTEND_ORIGIN) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir cualquier origen (desarrollo)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Middleware global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// --- EL CAMBIO CLAVE ESTÁ AQUÍ ABAJO ---
// 1. Añadimos '0.0.0.0' para que escuche en toda la red, no solo en localhost.
// 2. Usamos el PORT 3000 que definimos arriba.
app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`🚀 Servidor accesible externamente en http://0.0.0.0:${PORT}`);
});