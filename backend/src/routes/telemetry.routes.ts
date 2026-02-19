import { Router } from 'express';
import { registerTelemetry } from '../services/devices.service';

const router = Router();

// Endpoint para recibir telemetría del ESP32
router.post('/', async (req, res) => {
  console.log("=".repeat(50));
  console.log("📡 TELEMETRÍA RECIBIDA");
  console.log("Timestamp:", new Date().toISOString());
  console.log("IP Cliente:", req.ip);
  console.log("User-Agent:", req.get('user-agent'));
  console.log("Content-Type:", req.get('content-type'));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("=".repeat(50));

  try {
    // Validar que el body tenga los campos necesarios
    if (!req.body.deviceId) {
      throw new Error('Campo deviceId es requerido');
    }

    const report = await registerTelemetry(req.body);
    
    console.log("✅ Telemetría registrada exitosamente");
    
    res.status(201).json({
      status: 'success',
      message: 'Telemetría recibida',
      data: report
    });
  } catch (error: any) {
    console.error("❌ Error al procesar telemetría:", error.message);
    console.error("Stack:", error.stack);
    
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Endpoint de prueba
router.get('/', (req, res) => {
  res.json({ 
    message: 'Endpoint de telemetría activo',
    methods: ['POST'],
    example: {
      deviceId: "38182B841494",
      accX: 0.45,
      accY: -0.12,
      accZ: 9.81,
      fallDetected: false
    }
  });
});

export default router;