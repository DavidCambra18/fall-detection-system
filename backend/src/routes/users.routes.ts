import { Router } from 'express';
import { getAllUsers, getCaredUsers, getMeController, getUserByIdController, getUserEventsController } from '../controllers/users.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/cared', authenticateToken, getCaredUsers);
router.get('/me', authenticateToken, getMeController);
router.get('/:id', authenticateToken, getUserByIdController);
router.get('/:id/events', authenticateToken, getUserEventsController);

export default router;
