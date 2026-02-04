import express from 'express';
import authRoutes from './routes/auth.routes'; // <--- sin .js
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware global
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
