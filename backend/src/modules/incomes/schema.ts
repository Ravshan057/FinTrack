import { z } from 'zod';

export const createIncomeSchema = z.object({
  sourceId: z.number().int().positive().nullable().optional(),
  amountMinor: z.number().int().positive('Сумма должна быть положительным числом'),
  currency: z.string().length(3).default('UZS'),
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  note: z.string().max(500).nullable().optional(),
  isRecurring: z.boolean().default(false),
  recurrence: z.enum(['monthly', 'yearly']).nullable().optional(),
});

export const updateIncomeSchema = z.object({
  sourceId: z.number().int().positive().nullable().optional(),
  amountMinor: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().max(500).nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(['monthly', 'yearly']).nullable().optional(),
});

export const incomesQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sourceId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;