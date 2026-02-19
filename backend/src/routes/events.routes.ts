import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/export', authenticateToken, EventsController.exportCSV);

router.get('/', EventsController.getAll);
router.get('/:id', EventsController.getById);
router.post('/', EventsController.create);
router.patch('/:id/confirm', EventsController.confirm);

export default router;
