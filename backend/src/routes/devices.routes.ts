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

const router = Router();

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
