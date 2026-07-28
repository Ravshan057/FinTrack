import apiClient from './client';
import type {
  User,
  IncomeSource,
  Income,
  Category,
  Expense,
  PaginatedResponse,
  SummaryResponse,
  SummaryByCategoryItem,
  SummaryBySourceItem,
  RecurringResponse,
  CreateIncomeSourceRequest,
  UpdateIncomeSourceRequest,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types';

// --- Auth ---
export async function register(
  data: { email: string; password: string; displayName?: string }
): Promise<{ user: User; token: string }> {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
}

export async function login(
  data: { email: string; password: string }
): Promise<{ user: User; token: string }> {
  const res = await apiClient.post('/auth/login', data);
  return res.data;
}

export async function getMe(): Promise<{ user: User }> {
  const res = await apiClient.get('/auth/me');
  return res.data;
}

// --- Income Sources ---
export async function getIncomeSources(): Promise<IncomeSource[]> {
  const res = await apiClient.get('/income-sources');
  return res.data;
}

export async function createIncomeSource(
  data: CreateIncomeSourceRequest
): Promise<IncomeSource> {
  const res = await apiClient.post('/income-sources', data);
  return res.data;
}

export async function updateIncomeSource(
  id: number,
  data: UpdateIncomeSourceRequest
): Promise<IncomeSource> {
  const res = await apiClient.patch(`/income-sources/${id}`, data);
  return res.data;
}

export async function deleteIncomeSource(id: number): Promise<void> {
  await apiClient.delete(`/income-sources/${id}`);
}

// --- Incomes ---
export async function getIncomes(params?: {
  from?: string;
  to?: string;
  sourceId?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Income>> {
  const res = await apiClient.get('/incomes', { params });
  return res.data;
}

export async function getIncome(id: number): Promise<Income> {
  const res = await apiClient.get(`/incomes/${id}`);
  return res.data;
}

export async function createIncome(data: CreateIncomeRequest): Promise<Income> {
  const res = await apiClient.post('/incomes', data);
  return res.data;
}

export async function updateIncome(
  id: number,
  data: UpdateIncomeRequest
): Promise<Income> {
  const res = await apiClient.patch(`/incomes/${id}`, data);
  return res.data;
}

export async function deleteIncome(id: number): Promise<void> {
  await apiClient.delete(`/incomes/${id}`);
}

// --- Categories ---
export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get('/categories');
  return res.data;
}

export async function createCategory(
  data: CreateCategoryRequest
): Promise<Category> {
  const res = await apiClient.post('/categories', data);
  return res.data;
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryRequest
): Promise<Category> {
  const res = await apiClient.patch(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

// --- Expenses ---
export async function getExpenses(params?: {
  from?: string;
  to?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Expense>> {
  const res = await apiClient.get('/expenses', { params });
  return res.data;
}

export async function getExpense(id: number): Promise<Expense> {
  const res = await apiClient.get(`/expenses/${id}`);
  return res.data;
}

export async function createExpense(
  data: CreateExpenseRequest
): Promise<Expense> {
  const res = await apiClient.post('/expenses', data);
  return res.data;
}

export async function updateExpense(
  id: number,
  data: UpdateExpenseRequest
): Promise<Expense> {
  const res = await apiClient.patch(`/expenses/${id}`, data);
  return res.data;
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}

// --- Summary ---
export async function getMonthlySummary(
  month: string
): Promise<SummaryResponse> {
  const res = await apiClient.get('/summary', { params: { month } });
  return res.data;
}

export async function getSummaryByCategory(
  month: string
): Promise<{ month: string; items: SummaryByCategoryItem[] }> {
  const res = await apiClient.get('/summary/by-category', { params: { month } });
  return res.data;
}

export async function getSummaryBySource(
  month: string
): Promise<{ month: string; items: SummaryBySourceItem[] }> {
  const res = await apiClient.get('/summary/by-source', { params: { month } });
  return res.data;
}

export async function getRecurring(): Promise<RecurringResponse> {
  const res = await apiClient.get('/summary/recurring');
  return res.data;
}