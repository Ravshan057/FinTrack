import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  kind: z.enum(['subscription', 'utility', 'groceries', 'rent', 'other']).default('other'),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  kind: z.enum(['subscription', 'utility', 'groceries', 'rent', 'other']).optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;