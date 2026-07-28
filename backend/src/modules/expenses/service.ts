import db from '../../config/db/client';
import { AppError } from '../../middleware/error';
import type { CreateExpenseInput, UpdateExpenseInput } from './schema';
import type { ExpenseRow, ExpenseDTO, PaginatedResponse } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function toDTO(row: AnyRow): ExpenseDTO {
  return {
    id: row.id,
    categoryId: row.category_id,
    amountMinor: row.amount_minor,
    currency: row.currency,
    spentAt: row.spent_at,
    description: row.description,
    isRecurring: row.is_recurring === 1,
    recurrence: row.recurrence,
    createdAt: row.created_at,
  };
}

interface QueryParams {
  from?: string;
  to?: string;
  categoryId?: number;
  page: number;
  limit: number;
}

export async function getAll(userId: number, params: QueryParams): Promise<PaginatedResponse<ExpenseDTO>> {
  const conditions: string[] = ['user_id = ?'];
  const values: (string | number)[] = [userId];

  if (params.from) {
    conditions.push('spent_at >= ?');
    values.push(params.from);
  }
  if (params.to) {
    conditions.push('spent_at < ?');
    values.push(params.to);
  }
  if (params.categoryId) {
    conditions.push('category_id = ?');
    values.push(params.categoryId);
  }

  const where = conditions.join(' AND ');

  const countRow = await db.prepare(
    `SELECT COUNT(*) as total FROM expenses WHERE ${where}`
  ).get(...values) as { total: number };

  const offset = (params.page - 1) * params.limit;
  const rows = await db.prepare(
    `SELECT * FROM expenses WHERE ${where} ORDER BY spent_at DESC, created_at DESC LIMIT ? OFFSET ?`
  ).all(...values, params.limit, offset) as ExpenseRow[];

  return {
    items: rows.map(toDTO),
    page: params.page,
    limit: params.limit,
    total: countRow.total,
  };
}

export async function getById(userId: number, id: number): Promise<ExpenseDTO> {
  const row = await db.prepare(
    'SELECT * FROM expenses WHERE id = ? AND user_id = ?'
  ).get(id, userId) as ExpenseRow | undefined;

  if (!row) {
    throw new AppError(404, 'NOT_FOUND', 'Расход не найден');
  }

  return toDTO(row);
}

export async function create(userId: number, input: CreateExpenseInput): Promise<ExpenseDTO> {
  const category = await db.prepare(
    'SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)'
  ).get(input.categoryId, userId);

  if (!category) {
    throw new AppError(404, 'NOT_FOUND', 'Категория не найдена');
  }

  const result = await db.prepare(`
    INSERT INTO expenses (user_id, category_id, amount_minor, currency, spent_at, description, is_recurring, recurrence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    input.categoryId,
    input.amountMinor,
    input.currency || 'UZS',
    input.spentAt,
    input.description ?? null,
    input.isRecurring ? 1 : 0,
    input.isRecurring ? input.recurrence ?? null : null
  );

  const row = await db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as ExpenseRow;
  return toDTO(row);
}

export async function update(userId: number, id: number, input: UpdateExpenseInput): Promise<ExpenseDTO> {
  const existing = await db.prepare(
    'SELECT * FROM expenses WHERE id = ? AND user_id = ?'
  ).get(id, userId) as ExpenseRow | undefined;

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Расход не найден');
  }

  if (input.categoryId) {
    const category = await db.prepare(
      'SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)'
    ).get(input.categoryId, userId);

    if (!category) {
      throw new AppError(404, 'NOT_FOUND', 'Категория не найдена');
    }
  }

  const categoryId = input.categoryId ?? existing.category_id;
  const amountMinor = input.amountMinor ?? existing.amount_minor;
  const currency = input.currency ?? existing.currency;
  const spentAt = input.spentAt ?? existing.spent_at;
  const description = input.description !== undefined ? input.description : existing.description;
  const isRecurring = input.isRecurring !== undefined ? (input.isRecurring ? 1 : 0) : existing.is_recurring;
  const recurrence = input.recurrence !== undefined ? input.recurrence : existing.recurrence;

  await db.prepare(`
    UPDATE expenses
    SET category_id = ?, amount_minor = ?, currency = ?, spent_at = ?, description = ?, is_recurring = ?, recurrence = ?
    WHERE id = ? AND user_id = ?
  `).run(categoryId, amountMinor, currency, spentAt, description, isRecurring, recurrence, id, userId);

  const row = await db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as ExpenseRow;
  return toDTO(row);
}

export async function remove(userId: number, id: number): Promise<void> {
  const existing = await db.prepare(
    'SELECT id FROM expenses WHERE id = ? AND user_id = ?'
  ).get(id, userId);

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Расход не найден');
  }

  await db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
}
