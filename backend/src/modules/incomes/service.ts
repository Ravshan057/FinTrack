import db from '../../config/db/client';
import { AppError } from '../../middleware/error';
import type { CreateIncomeInput, UpdateIncomeInput } from './schema';
import type { IncomeRow, IncomeDTO, PaginatedResponse } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function toDTO(row: AnyRow): IncomeDTO {
  return {
    id: row.id,
    sourceId: row.source_id,
    amountMinor: row.amount_minor,
    currency: row.currency,
    receivedAt: row.received_at,
    note: row.note,
    isRecurring: row.is_recurring === 1,
    recurrence: row.recurrence,
    createdAt: row.created_at,
  };
}

interface QueryParams {
  from?: string;
  to?: string;
  sourceId?: number;
  page: number;
  limit: number;
}

export async function getAll(userId: number, params: QueryParams): Promise<PaginatedResponse<IncomeDTO>> {
  const conditions: string[] = ['user_id = ?'];
  const values: (string | number)[] = [userId];

  if (params.from) {
    conditions.push('received_at >= ?');
    values.push(params.from);
  }
  if (params.to) {
    conditions.push('received_at < ?');
    values.push(params.to);
  }
  if (params.sourceId) {
    conditions.push('source_id = ?');
    values.push(params.sourceId);
  }

  const where = conditions.join(' AND ');

  const countRow = await db.prepare(
    `SELECT COUNT(*) as total FROM incomes WHERE ${where}`
  ).get(...values) as { total: number };

  const offset = (params.page - 1) * params.limit;
  const rows = await db.prepare(
    `SELECT * FROM incomes WHERE ${where} ORDER BY received_at DESC, created_at DESC LIMIT ? OFFSET ?`
  ).all(...values, params.limit, offset) as IncomeRow[];

  return {
    items: rows.map(toDTO),
    page: params.page,
    limit: params.limit,
    total: countRow.total,
  };
}

export async function getById(userId: number, id: number): Promise<IncomeDTO> {
  const row = await db.prepare(
    'SELECT * FROM incomes WHERE id = ? AND user_id = ?'
  ).get(id, userId) as IncomeRow | undefined;

  if (!row) {
    throw new AppError(404, 'NOT_FOUND', 'Доход не найден');
  }

  return toDTO(row);
}

export async function create(userId: number, input: CreateIncomeInput): Promise<IncomeDTO> {
  if (input.sourceId) {
    const source = await db.prepare(
      'SELECT id FROM income_sources WHERE id = ? AND user_id = ?'
    ).get(input.sourceId, userId);

    if (!source) {
      throw new AppError(404, 'NOT_FOUND', 'Источник дохода не найден');
    }
  }

  const result = await db.prepare(`
    INSERT INTO incomes (user_id, source_id, amount_minor, currency, received_at, note, is_recurring, recurrence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    input.sourceId ?? null,
    input.amountMinor,
    input.currency || 'UZS',
    input.receivedAt,
    input.note ?? null,
    input.isRecurring ? 1 : 0,
    input.isRecurring ? input.recurrence ?? null : null
  );

  const row = await db.prepare('SELECT * FROM incomes WHERE id = ?').get(result.lastInsertRowid) as IncomeRow;
  return toDTO(row);
}

export async function update(userId: number, id: number, input: UpdateIncomeInput): Promise<IncomeDTO> {
  const existing = await db.prepare(
    'SELECT * FROM incomes WHERE id = ? AND user_id = ?'
  ).get(id, userId) as IncomeRow | undefined;

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Доход не найден');
  }

  if (input.sourceId !== undefined && input.sourceId !== null) {
    const source = await db.prepare(
      'SELECT id FROM income_sources WHERE id = ? AND user_id = ?'
    ).get(input.sourceId, userId);

    if (!source) {
      throw new AppError(404, 'NOT_FOUND', 'Источник дохода не найден');
    }
  }

  const sourceId = input.sourceId !== undefined ? input.sourceId : existing.source_id;
  const amountMinor = input.amountMinor ?? existing.amount_minor;
  const currency = input.currency ?? existing.currency;
  const receivedAt = input.receivedAt ?? existing.received_at;
  const note = input.note !== undefined ? input.note : existing.note;
  const isRecurring = input.isRecurring !== undefined ? (input.isRecurring ? 1 : 0) : existing.is_recurring;
  const recurrence = input.recurrence !== undefined ? input.recurrence : existing.recurrence;

  await db.prepare(`
    UPDATE incomes
    SET source_id = ?, amount_minor = ?, currency = ?, received_at = ?, note = ?, is_recurring = ?, recurrence = ?
    WHERE id = ? AND user_id = ?
  `).run(sourceId, amountMinor, currency, receivedAt, note, isRecurring, recurrence, id, userId);

  const row = await db.prepare('SELECT * FROM incomes WHERE id = ?').get(id) as IncomeRow;
  return toDTO(row);
}

export async function remove(userId: number, id: number): Promise<void> {
  const existing = await db.prepare(
    'SELECT id FROM incomes WHERE id = ? AND user_id = ?'
  ).get(id, userId);

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Доход не найден');
  }

  await db.prepare('DELETE FROM incomes WHERE id = ? AND user_id = ?').run(id, userId);
}
