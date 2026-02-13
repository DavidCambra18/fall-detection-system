import { Router } from 'express';
import { registerTelemetry } from '../services/devices.service';

const router = Router();

router.post('/', async (req, res) => {
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

export default router;