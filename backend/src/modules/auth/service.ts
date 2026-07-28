import bcrypt from 'bcryptjs';
import db from '../../config/db/client';
import config from '../../config/env';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error';
import type { RegisterInput, LoginInput } from './schema';
import type { UserRow, UserDTO } from '../../types';

function toUserDTO(row: AnyRow): UserDTO {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    defaultCurrency: row.default_currency,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export async function register(input: RegisterInput): Promise<{ user: UserDTO; token: string }> {
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(input.email);
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Пользователь с таким email уже существует');
  }

  const passwordHash = bcrypt.hashSync(input.password, config.BCRYPT_ROUNDS);
  const displayName = input.displayName || null;

  const result = await db.prepare(`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (?, ?, ?)
  `).run(input.email, passwordHash, displayName);

  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as UserRow;
  const token = signToken(user.id);

  return { user: toUserDTO(user), token };
}

export async function login(input: LoginInput): Promise<{ user: UserDTO; token: string }> {
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(input.email) as UserRow | undefined;

  if (!user || !bcrypt.compareSync(input.password, user.password_hash)) {
    throw new AppError(401, 'UNAUTHORIZED', 'Неверный email или пароль');
  }

  const token = signToken(user.id);
  return { user: toUserDTO(user), token };
}

export async function getMe(userId: number): Promise<UserDTO> {
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'Пользователь не найден');
  }
  return toUserDTO(user);
}
