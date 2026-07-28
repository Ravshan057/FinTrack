import { z } from 'zod';

export const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Формат месяца: YYYY-MM'),
});

export type MonthQuery = z.infer<typeof monthQuerySchema>;