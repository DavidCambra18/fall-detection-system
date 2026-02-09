import { Request, Response, NextFunction } from 'express';
import { getUserById, getUsers, getUsersCaredByCarer } from '../services/users.service';
import { EventsService } from '../services/events.service';

// Listado de todos los usuarios (solo ADMIN)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (user.roleId !== 1) return res.status(403).json({ message: 'Acceso denegado' });

    const users = await getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Listado de usuarios asignados a un cuidador (solo CUIDADOR)
export async function getCaredUsers(req: Request, res: Response) {
  const user = (req as any).user;
  if (user.roleId !== 2) return res.status(403).json({ message: 'Acceso solo permitido a cuidadores' });

  try {
    const users = await getUsersCaredByCarer(user.id);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios asignados' });
  }
}

export async function getUserByIdController(req: Request, res: Response) {
  const requester = (req as any).user;
  const targetUserId = Number(req.params.id);

  if (isNaN(targetUserId)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const user = await getUserById(targetUserId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (requester.roleId === 1) return res.json(user);
    if (requester.roleId === 2 && user.carer_id === requester.id) return res.json(user);
    if (requester.roleId === 3 && requester.id === user.id) return res.json(user);

    return res.status(403).json({ message: 'Acceso no autorizado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getMeController(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user?.id) return res.status(401).json({ message: 'No autenticado' });

  try {
    const dbUser = await getUserById(user.id);
    if (!dbUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json(dbUser);
  } catch (err) {
    console.error('Error get /users/me:', err);
    console.log('USER FROM TOKEN:', (req as any).user);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getUserEventsController(req: Request, res: Response) {
  const requester = (req as any).user;
  const targetUserId = Number(req.params.id);

  if (isNaN(targetUserId)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const user = await getUserById(targetUserId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // ADMIN puede ver todos
    if (requester.roleId !== 1) {
      // CUIDADOR solo puede ver eventos de sus pacientes
      if (requester.roleId === 2 && user.carer_id !== requester.id) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
      }
      // USUARIO solo sus propios eventos
      if (requester.roleId === 3 && requester.id !== user.id) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
      }
    }

    const events = await EventsService.getAll({ user_id: targetUserId });
    return res.json(events);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}