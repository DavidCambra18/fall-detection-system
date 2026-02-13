import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
    createDeviceController,
    getDevicesController,
    getDeviceController,
    updateDeviceController,
    updateDeviceStatusController,
    deleteDeviceController
} from '../controllers/devices.controller';
import { registerTelemetry } from '../services/devices.service';

const router = Router();

// IMPORTANTE: Esta ruta debe ir PRIMERO, antes de authenticateToken
router.post('/telemetry', async (req, res) => {
  console.log("-----------------------------------------");
  console.log("📡 Petición recibida desde el ESP32");
  console.log("Cuerpo recibido:", req.body);

  try {
    const report = await registerTelemetry(req.body);
    
    res.status(201).json({
      status: 'success',
      data: report
    });
    console.log("✅ Respuesta enviada al ESP32: 201 Created");
  } catch (error: any) {
    console.error("❌ Error en telemetría:", error.message);
    res.status(400).json({ message: error.message });
  }
  console.log("-----------------------------------------");
});

// DESPUÉS de telemetry, aplicamos autenticación
router.use(authenticateToken);

// Endpoints CRUD protegidos
router.post('/', createDeviceController);
router.get('/', getDevicesController);
router.get('/:id', getDeviceController);
router.put('/:id', updateDeviceController);
router.patch('/:id/status', updateDeviceStatusController);
router.delete('/:id', deleteDeviceController);

export default router;