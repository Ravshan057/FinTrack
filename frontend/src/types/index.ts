export type IncomeSourceType = 'salary' | 'freelance' | 'other';
export type CategoryKind = 'subscription' | 'utility' | 'groceries' | 'rent' | 'other';
export type Recurrence = 'monthly' | 'yearly';

export interface User {
  id: number;
  email: string;
  displayName: string | null;
  defaultCurrency: string;
  createdAt: string;
}

export interface IncomeSource {
  id: number;
  name: string;
  type: IncomeSourceType;
  isActive: boolean;
  createdAt: string;
}

export interface Income {
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

export interface Category {
  id: number;
  userId: number | null;
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: string | null;
}

export interface Expense {
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

export interface SummaryResponse {
  month: string;
  currency: string;
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  balanceMinor: number;
}

export interface SummaryByCategoryItem {
  categoryId: number;
  name: string;
  kind: CategoryKind;
  totalMinor: number;
}

export interface SummaryBySourceItem {
  sourceId: number;
  name: string;
  totalMinor: number;
}

export interface RecurringItem {
  type: 'expense' | 'income';
  categoryId?: number;
  sourceId?: number;
  name: string;
  amountMinor: number;
  recurrence: Recurrence;
}

export interface RecurringResponse {
  monthlyExpenseMinor: number;
  items: RecurringItem[];
}

export interface CreateIncomeSourceRequest {
  name: string;
  type: IncomeSourceType;
}

export interface UpdateIncomeSourceRequest {
  name?: string;
  type?: IncomeSourceType;
  isActive?: boolean;
}

export interface CreateIncomeRequest {
  sourceId?: number | null;
  amountMinor: number;
  currency?: string;
  receivedAt: string;
  note?: string | null;
  isRecurring?: boolean;
  recurrence?: Recurrence | null;
}

export interface UpdateIncomeRequest {
  sourceId?: number | null;
  amountMinor?: number;
  currency?: string;
  receivedAt?: string;
  note?: string | null;
  isRecurring?: boolean;
  recurrence?: Recurrence | null;
}

export interface CreateExpenseRequest {
  categoryId: number;
  amountMinor: number;
  currency?: string;
  spentAt: string;
  description?: string | null;
  isRecurring?: boolean;
  recurrence?: Recurrence | null;
}

export interface UpdateExpenseRequest {
  categoryId?: number;
  amountMinor?: number;
  currency?: string;
  spentAt?: string;
  description?: string | null;
  isRecurring?: boolean;
  recurrence?: Recurrence | null;
}

export interface CreateCategoryRequest {
  name: string;
  kind?: CategoryKind;
  icon?: string | null;
  color?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  kind?: CategoryKind;
  icon?: string | null;
  color?: string | null;
}