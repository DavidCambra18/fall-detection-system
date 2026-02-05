// import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth.routes';
import deviceRoutes from './routes/devices.routes';

dotenv.config();

const app = express();

// Middleware global
app.use(express.json());

// USAR SOLO EN DESARROLLO, COMENTAR EN PRODUCCION
// app.use(cors({
//   origin: 'http://localhost:5000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));

// Rutas
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente');
});

app.use('/api/devices', deviceRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
