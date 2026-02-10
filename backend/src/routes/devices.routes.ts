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

router.post('/telemetry', async (req, res) => {
  // LOG PARA SABER SI LLEGA ALGO
  console.log("-----------------------------------------");
  console.log("📡 Petición recibida desde el ESP32");
  console.log("Cuerpo recibido:", req.body);

  try {
    // Pasamos req.body (solo los datos), no el objeto req completo
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

// Solo admin puede gestionar dispositivos
router.use(authenticateToken); // middleware global para todos

// Endpoints CRUD
router.post('/', createDeviceController);
router.get('/', getDevicesController);
router.get('/:id', getDeviceController);
router.put('/:id', updateDeviceController);
router.patch('/:id/status', updateDeviceStatusController);
router.delete('/:id', deleteDeviceController);

export default router;
