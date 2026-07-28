import { z } from 'zod';

export const createExpenseSchema = z.object({
  categoryId: z.number().int().positive('Категория обязательна'),
  amountMinor: z.number().int().positive('Сумма должна быть положительным числом'),
  currency: z.string().length(3).default('UZS'),
  spentAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  description: z.string().max(500).nullable().optional(),
  isRecurring: z.boolean().default(false),
  recurrence: z.enum(['monthly', 'yearly']).nullable().optional(),
});

export const updateExpenseSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  amountMinor: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  spentAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().max(500).nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(['monthly', 'yearly']).nullable().optional(),
});

export const expensesQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  categoryId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;