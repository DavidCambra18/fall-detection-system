import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/devices.routes';
import eventsRoutes from './routes/events.routes';
import usersRoutes from './routes/users.routes';
import telemetryRoutes from './routes/telemetry.routes'; // NUEVO

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_ORIGINS =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_ORIGINS?.split(',') || []
    : ['http://localhost:4200'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, ESP32, etc.)
    if (!origin) return callback(null, true);

    if (FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('No permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // AÑADIR ESTO
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Rutas (ORDEN IMPORTANTE: telemetría ANTES de las protegidas)
app.use('/api/telemetry', telemetryRoutes); // SIN AUTENTICACIÓN
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);

// ...existing code...