import type { Response, NextFunction } from 'express';
import * as service from './service';
import type { AuthRequest } from '../../types';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await service.getAll(req.userId!);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await service.create(req.userId!, req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await service.update(req.userId!, id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    await service.remove(req.userId!, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
