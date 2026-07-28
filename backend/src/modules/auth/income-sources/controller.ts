import type { Response, NextFunction } from 'express';
import * as service from './service';
import type { AuthRequest } from '../../../types';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sources = await service.getAll(req.userId!);
    res.json(sources);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const source = await service.create(req.userId!, req.body);
    res.status(201).json(source);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const source = await service.update(req.userId!, id, req.body);
    res.json(source);
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
