import type { Request } from 'express';

export type IncomeSourceType = 'salary' | 'freelance' | 'other';
export type CategoryKind = 'subscription' | 'utility' | 'groceries' | 'rent' | 'other';
export type Recurrence = 'monthly' | 'yearly';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserDTO {
  id: number;
  email: string;
  displayName: string | null;
  defaultCurrency: string;
  createdAt: string;
}

export interface IncomeSourceRow {
  id: number;
  user_id: number;
  name: string;
  type: IncomeSourceType;
  is_active: number;
  created_at: string;
}

export interface IncomeSourceDTO {
  id: number;
  name: string;
  type: IncomeSourceType;
  isActive: boolean;
  createdAt: string;
}

export interface IncomeRow {
  id: number;
  user_id: number;
  source_id: number | null;
  amount_minor: number;
  currency: string;
  received_at: string;
  note: string | null;
  is_recurring: number;
  recurrence: Recurrence | null;
  created_at: string;
}

export interface IncomeDTO {
  id: number;
  sourceId: number | null;
  amountMinor: number;
  currency: string;
  receivedAt: string;
  note: string | null;
  isRecurring: boolean;
  recurrence: Recurrence | null;
  createdAt: string;
}

export interface CategoryRow {
  id: number;
  user_id: number | null;
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: string | null;
}

export interface CategoryDTO {
  id: number;
  userId: number | null;
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: string | null;
}

export interface ExpenseRow {
  id: number;
  user_id: number;
  category_id: number;
  amount_minor: number;
  currency: string;
  spent_at: string;
  description: string | null;
  is_recurring: number;
  recurrence: Recurrence | null;
  created_at: string;
}

export interface ExpenseDTO {
  id: number;
  categoryId: number;
  amountMinor: number;
  currency: string;
  spentAt: string;
  description: string | null;
  isRecurring: boolean;
  recurrence: Recurrence | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface AuthRequest extends Request {
  userId?: number;
}