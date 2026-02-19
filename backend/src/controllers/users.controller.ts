import { NextFunction, Request, Response } from 'express';
import { EventsService } from '../services/events.service';
import { deleteUserById, getUserById, getUsers, getUsersCaredByCarer, updateUserById } from '../services/users.service';

// Listado de todos los usuarios (solo ADMIN)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (user.role_id !== 1) return res.status(403).json({ message: 'Acceso denegado' });

    const users = await getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Listado de usuarios asignados a un cuidador (solo CUIDADOR)
export async function getCaredUsers(req: Request, res: Response) {
  const user = (req as any).user;
  if (user.role_id !== 2) return res.status(403).json({ message: 'Acceso solo permitido a cuidadores' });

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

    if (requester.role_id === 1) return res.json(user);
    if (requester.role_id === 2 && user.carer_id === requester.id) return res.json(user);
    if (requester.role_id === 3 && requester.id === user.id) return res.json(user);

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
    if (requester.role_id !== 1) {
      // CUIDADOR solo puede ver eventos de sus pacientes
      if (requester.role_id === 2 && user.carer_id !== requester.id) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
      }
      // USUARIO solo sus propios eventos
      if (requester.role_id === 3 && requester.id !== user.id) {
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

export async function updateUserController(req: Request, res: Response) {
  const requester = (req as any).user;
  const targetUserId = Number(req.params.id);

  if (isNaN(targetUserId)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (req.body.role_id !== undefined && requester.role_id !== 1) {
      return res.status(403).json({ 
        message: 'No tienes permisos para modificar el rol de usuario' 
      });
    }

    if (requester.role_id === 1) {
      // Admin puede editar a cualquiera
    } else if (requester.role_id === 2 && targetUser.carer_id === requester.id) {
      // Cuidador puede editar solo a sus usuarios
    } else if (requester.role_id === 3 && requester.id === targetUserId) {
      // Usuario puede editar solo su propia cuenta
    } else {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const updatedUser = await updateUserById(
      targetUserId,
      req.body,
      requester.role_id
    );
    return res.json(updatedUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Borrar usuario
export async function deleteUserController(req: Request, res: Response) {
  const requester = (req as any).user;
  const targetUserId = Number(req.params.id);

  if (requester.role_id !== 1) return res.status(403).json({ message: 'Solo admin puede borrar usuarios' });

  try {
    const deleted = await deleteUserById(targetUserId);
    if (!deleted) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ message: 'Usuario borrado correctamente', id: deleted.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}