import db from '../../config/db/client';
import { AppError } from '../../middleware/error';
import type { CreateCategoryInput, UpdateCategoryInput } from './schema';
import type { CategoryRow, CategoryDTO } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function toDTO(row: AnyRow): CategoryDTO {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    kind: row.kind,
    icon: row.icon,
    color: row.color,
  };
}

export async function getAll(userId: number): Promise<CategoryDTO[]> {
  const rows = await db.prepare(
    'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY user_id IS NOT NULL, name ASC'
  ).all(userId) as CategoryRow[];
  return rows.map(toDTO);
}

export async function create(userId: number, input: CreateCategoryInput): Promise<CategoryDTO> {
  const result = await db.prepare(
    'INSERT INTO categories (user_id, name, kind, icon, color) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, input.name, input.kind, input.icon || null, input.color || null);
  const row = await db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as CategoryRow;
  return toDTO(row);
}

export async function update(userId: number, id: number, input: UpdateCategoryInput): Promise<CategoryDTO> {
  const existing = await db.prepare(
    'SELECT * FROM categories WHERE id = ?'
  ).get(id) as CategoryRow | undefined;

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Категория не найдена');
  }

  if (existing.user_id === null) {
    throw new AppError(403, 'FORBIDDEN', 'Нельзя изменить системную категорию');
  }

  if (existing.user_id !== userId) {
    throw new AppError(404, 'NOT_FOUND', 'Категория не найдена');
  }

  const name = input.name ?? existing.name;
  const kind = input.kind ?? existing.kind;
  const icon = input.icon !== undefined ? input.icon : existing.icon;
  const color = input.color !== undefined ? input.color : existing.color;

  await db.prepare(
    'UPDATE categories SET name = ?, kind = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?'
  ).run(name, kind, icon, color, id, userId);

  const row = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as CategoryRow;
  return toDTO(row);
}

export async function remove(userId: number, id: number): Promise<void> {
  const existing = await db.prepare(
    'SELECT * FROM categories WHERE id = ?'
  ).get(id) as CategoryRow | undefined;

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Категория не найдена');
  }

  if (existing.user_id === null) {
    throw new AppError(403, 'FORBIDDEN', 'Нельзя удалить системную категорию');
  }

  if (existing.user_id !== userId) {
    throw new AppError(404, 'NOT_FOUND', 'Категория не найдена');
  }

  const linkedExpenses = await db.prepare(
    'SELECT COUNT(*) as count FROM expenses WHERE category_id = ?'
  ).get(id) as { count: number };

  if (linkedExpenses.count > 0) {
    throw new AppError(409, 'CONFLICT', 'Нельзя удалить категорию, к которой привязаны расходы');
  }

  await db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(id, userId);
}
