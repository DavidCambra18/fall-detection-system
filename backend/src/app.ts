import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/devices.routes';
import eventsRoutes from './routes/events.routes';
import usersRoutes from './routes/users.routes';
import chatgptRoutes from './routes/chatgpt.routes';
import telemetryRoutes from './routes/telemetry.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? [
        'https://betafalldetectionsystem.vercel.app',
        'https://falldetectionsystem.vercel.app',
        ...(process.env.FRONTEND_ORIGINS?.split(',') || [])
      ]
    : ['http://localhost:4200'];

// CORS MÁS PERMISIVO PARA ESP32
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (ESP32, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Permitir frontend
    if (FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // En producción, permitir todas las peticiones para debugging
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }

    return callback(new Error('No permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'NO ORIGIN'}`);
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Rutas (ORDEN IMPORTANTE)
app.use('/api/telemetry', telemetryRoutes); // SIN AUTENTICACIÓN
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/chatgpt', chatgptRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  console.log('404 - Ruta no encontrada:', req.path);
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', err);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

export default app;