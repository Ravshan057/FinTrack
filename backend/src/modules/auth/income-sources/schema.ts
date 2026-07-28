import { z } from 'zod';

export const createIncomeSourceSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  type: z.enum(['salary', 'freelance', 'other']).default('salary'),
});

export const updateIncomeSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['salary', 'freelance', 'other']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateIncomeSourceInput = z.infer<typeof createIncomeSourceSchema>;
export type UpdateIncomeSourceInput = z.infer<typeof updateIncomeSourceSchema>;