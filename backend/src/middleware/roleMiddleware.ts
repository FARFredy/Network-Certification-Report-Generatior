import { Request, Response, NextFunction } from 'express';

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, requiere admin' });
  }
  next();
};