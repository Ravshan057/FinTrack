import type { Response, NextFunction } from 'express';
import * as service from './service';
import type { AuthRequest } from '../../types';

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getAll(req.userId!, {
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const expense = await service.getById(req.userId!, id);
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const expense = await service.create(req.userId!, req.body);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const expense = await service.update(req.userId!, id, req.body);
    res.json(expense);
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
