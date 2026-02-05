import { Request, Response } from 'express';
import { 
  createDevice, 
  getDevices, 
  getDeviceById, 
  updateDevice, 
  updateDeviceStatus, 
  deleteDevice 
} from '../services/devices.service';

export const createDeviceController = async (req: Request, res: Response) => {
  try {
    const device = await createDevice(req.body);
    res.status(201).json({ message: 'Dispositivo registrado', device });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getDevicesController = async (req: Request, res: Response) => {
  try {
    const devices = await getDevices();
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeviceController = async (req: Request, res: Response) => {
  try {
    const device = await getDeviceById(Number(req.params.id));
    if (!device) return res.status(404).json({ message: 'Dispositivo no encontrado' });
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeviceController = async (req: Request, res: Response) => {
  try {
    const device = await updateDevice(Number(req.params.id), req.body);
    res.json({ message: 'Dispositivo actualizado', device });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDeviceStatusController = async (req: Request, res: Response) => {
  try {
    const device = await updateDeviceStatus(Number(req.params.id), req.body.status);
    res.json({ message: 'Estado actualizado', device });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDeviceController = async (req: Request, res: Response) => {
  try {
    await deleteDevice(Number(req.params.id));
    res.json({ message: 'Dispositivo eliminado' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
