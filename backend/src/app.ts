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

const FRONTEND_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://falldetectionsystem.com'
  : 'http://localhost:4200';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
