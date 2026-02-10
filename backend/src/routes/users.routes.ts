import { Router } from 'express';
import { deleteUserController, getAllUsers, getCaredUsers, getMeController, getUserByIdController, getUserEventsController, updateUserController } from '../controllers/users.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/cared', authenticateToken, getCaredUsers);
router.get('/me', authenticateToken, getMeController);
router.get('/:id', authenticateToken, getUserByIdController);
router.get('/:id/events', authenticateToken, getUserEventsController);

router.put('/:id', authenticateToken, updateUserController);
router.delete('/:id', authenticateToken, deleteUserController);

export default router;
