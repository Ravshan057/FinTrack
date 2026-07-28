import db from '../../../config/db/client';
import { AppError } from '../../../middleware/error';
import type { CreateIncomeSourceInput, UpdateIncomeSourceInput } from './schema';
import type { IncomeSourceRow, IncomeSourceDTO } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function toDTO(row: AnyRow): IncomeSourceDTO {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export async function getAll(userId: number): Promise<IncomeSourceDTO[]> {
  const rows = await db.prepare(
    'SELECT * FROM income_sources WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId) as IncomeSourceRow[];
  return rows.map(toDTO);
}

export async function create(userId: number, input: CreateIncomeSourceInput): Promise<IncomeSourceDTO> {
  const result = await db.prepare(
    'INSERT INTO income_sources (user_id, name, type) VALUES (?, ?, ?)'
  ).run(userId, input.name, input.type);
  const row = await db.prepare('SELECT * FROM income_sources WHERE id = ?').get(result.lastInsertRowid) as IncomeSourceRow;
  return toDTO(row);
}

export async function update(userId: number, id: number, input: UpdateIncomeSourceInput): Promise<IncomeSourceDTO> {
  const existing = await db.prepare(
    'SELECT * FROM income_sources WHERE id = ? AND user_id = ?'
  ).get(id, userId) as IncomeSourceRow | undefined;

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Источник дохода не найден');
  }

  const name = input.name ?? existing.name;
  const type = input.type ?? existing.type;
  const isActive = input.isActive !== undefined ? (input.isActive ? 1 : 0) : existing.is_active;

  await db.prepare(
    'UPDATE income_sources SET name = ?, type = ?, is_active = ? WHERE id = ? AND user_id = ?'
  ).run(name, type, isActive, id, userId);

  const row = await db.prepare('SELECT * FROM income_sources WHERE id = ?').get(id) as IncomeSourceRow;
  return toDTO(row);
}

export async function remove(userId: number, id: number): Promise<void> {
  const existing = await db.prepare(
    'SELECT id FROM income_sources WHERE id = ? AND user_id = ?'
  ).get(id, userId);

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Источник дохода не найден');
  }

  await db.prepare('DELETE FROM income_sources WHERE id = ? AND user_id = ?').run(id, userId);
}
