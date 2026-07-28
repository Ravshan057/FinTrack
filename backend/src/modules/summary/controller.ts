import type { Response, NextFunction } from 'express';
import * as service from './service';
import type { AuthRequest } from '../../types';

export async function monthlySummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getMonthlySummary(req.userId!, req.query.month as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function byCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getByCategory(req.userId!, req.query.month as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bySource(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getBySource(req.userId!, req.query.month as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function recurring(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getRecurring(req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
