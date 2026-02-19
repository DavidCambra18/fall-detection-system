import { Request, Response } from 'express';
import { EventsService } from '../services/events.service';

export class EventsController {

  static async getAll(req: Request, res: Response) {
    try {
      const filters = {
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        device_id: req.query.device_id ? Number(req.query.device_id) : undefined,
        start: req.query.start as string,
        end: req.query.end as string
      };
      const events = await EventsService.getAll(filters);
      res.json(events);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener eventos' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const event = await EventsService.getById(id);
      if (!event) return res.status(404).json({ message: 'Evento no encontrado' });
      res.json(event);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al obtener evento' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const event = await EventsService.create(req.body);
      res.status(201).json(event);
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ message: err.message || 'Error al crear evento' });
    }
  }

  static async confirm(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { confirmed } = req.body;
      const event = await EventsService.confirmEvent(id, confirmed);
      if (!event) return res.status(404).json({ message: 'Evento no encontrado' });
      res.json(event);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al actualizar evento' });
    }
  }

  static async exportCSV(req: Request, res: Response) {
    try {
      const filters = {
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        device_id: req.query.device_id ? Number(req.query.device_id) : undefined,
        start: req.query.start as string,
        end: req.query.end as string
      };

      const events = await EventsService.getAll(filters);

      if (events.length === 0) {
        return res.status(404).json({ message: 'No hay datos para exportar' });
      }

      const csvHeaders = 'ID,User_ID,Device_ID,Acc_X,Acc_Y,Acc_Z,Fall_Detected,Date,Confirmed\n';
      
      const csvRows = events.map(e => 
        `${e.id},${e.user_id},${e.device_id},${e.acc_x},${e.acc_y},${e.acc_z},${e.fall_detected},"${e.date_rep}",${e.confirmed}`
      ).join('\n');

      const csvContent = csvHeaders + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=historial_caidas.csv');
      
      return res.status(200).send(csvContent);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al generar el CSV' });
    }
  }
}