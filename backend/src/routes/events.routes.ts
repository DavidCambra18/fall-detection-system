import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';

const router = Router();

router.get('/', EventsController.getAll);
router.get('/:id', EventsController.getById);
router.post('/', EventsController.create);
router.patch('/:id/confirm', EventsController.confirm);

export default router;
