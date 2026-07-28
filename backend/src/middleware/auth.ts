import type { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './error';
import type { AuthRequest } from '../types';

export function auth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Требуется авторизация'));
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return next(new AppError(401, 'UNAUTHORIZED', 'Недействительный токен'));
  }
}
