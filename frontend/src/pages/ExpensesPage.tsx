import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  getExpenses,
  getCategories,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../api/endpoints';
import type {
  Expense,
  Category,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../types';

function formatAmount(minor: number): string {
  const major = minor / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(major).replace(/\s/g, ' ');
}

interface FormData {
  categoryId: string;
  amountMajor: string;
  spentAt: string;
  description: string;
  isRecurring: boolean;
  recurrence: string;
}

const emptyForm: FormData = {
  categoryId: '',
  amountMajor: '',
  spentAt: new Date().toISOString().slice(0, 10),
  description: '',
  isRecurring: false,
  recurrence: '',
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  const limit = 10;

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Не удалось загрузить категории', err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit };
      if (from) params.from = from;
      if (to) params.to = to;
      if (categoryFilter) params.categoryId = Number(categoryFilter);
      const res = await getExpenses(params);
      setExpenses(res.items);
      setTotal(res.total);
    } catch {
      setError('Ошибка загрузки расходов');
    } finally {
      setLoading(false);
    }
  }, [page, from, to, categoryFilter]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(expense: Expense) {
    setEditingId(expense.id);
    setForm({
      categoryId: String(expense.categoryId),
      amountMajor: String(expense.amountMinor / 100),
      spentAt: expense.spentAt,
      description: expense.description || '',
      isRecurring: expense.isRecurring,
      recurrence: expense.recurrence || '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const amountMinor = Math.round(parseFloat(form.amountMajor) * 100);
      if (isNaN(amountMinor) || amountMinor <= 0) {
        setError('Некорректная сумма');
        setSubmitLoading(false);
        return;
      }
      const payload: CreateExpenseRequest = {
        categoryId: Number(form.categoryId),
        amountMinor,
        spentAt: form.spentAt,
        description: form.description || null,
        isRecurring: form.isRecurring,
        recurrence: form.isRecurring && form.recurrence ? (form.recurrence as 'monthly' | 'yearly') : null,
      };

      if (editingId) {
        await updateExpense(editingId, payload as UpdateExpenseRequest);
      } else {
        await createExpense(payload);
      }
      closeForm();
      fetchExpenses();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
        : undefined;
      setError(msg || 'Ошибка сохранения');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить этот расход?')) return;
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch {
      setError('Ошибка удаления');
    }
  }

  const totalPages = Math.ceil(total / limit);
  const inputCls = 'w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 placeholder-dark-400 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">Расходы</h2>
        <button onClick={openCreateForm}
          className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.97] cursor-pointer">
          + Добавить расход
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-dark-300">От:</span>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-dark-300">До:</span>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-dark-300">Категория:</span>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20">
            <option value="">Все</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-slide-down">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent-500/30 border-t-accent-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-dark-800 border border-dark-600/50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 bg-dark-700/50">
                  {['Дата', 'Сумма', 'Категория', 'Описание', 'Повтор', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-dark-300 font-medium text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-dark-400 italic">Нет расходов</td></tr>
                ) : (
                  expenses.map((exp) => {
                    const catName = categories.find((c) => c.id === exp.categoryId)?.name || '—';
                    return (
                      <tr key={exp.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors duration-150">
                        <td className="py-3 px-4 text-dark-200">{exp.spentAt}</td>
                        <td className="py-3 px-4 text-red-400 font-medium">{formatAmount(exp.amountMinor)}</td>
                        <td className="py-3 px-4 text-dark-200">{catName}</td>
                        <td className="py-3 px-4 text-dark-300">{exp.description || '—'}</td>
                        <td className="py-3 px-4">
                          {exp.isRecurring ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-500/15 text-accent-400">
                              {exp.recurrence === 'monthly' ? 'Ежемес.' : 'Ежегод.'}
                            </span>
                          ) : <span className="text-dark-400">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => openEditForm(exp)}
                              className="p-1.5 rounded-lg text-dark-400 hover:text-accent-400 hover:bg-dark-600 transition-all duration-200 cursor-pointer" title="Редактировать">✏️</button>
                            <button onClick={() => handleDelete(exp.id)}
                              className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer" title="Удалить">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-4 py-1.5 text-sm font-medium text-dark-300 border border-dark-500 rounded-xl hover:bg-dark-700 hover:text-dark-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                Назад
              </button>
              <span className="text-sm text-dark-400">{page} из {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1.5 text-sm font-medium text-dark-300 border border-dark-500 rounded-xl hover:bg-dark-700 hover:text-dark-100 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                Вперёд
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeForm}>
          <div className="bg-dark-800 border border-dark-600/50 rounded-2xl shadow-2xl shadow-black/40 p-8 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-dark-100 mb-6">
              {editingId ? 'Редактировать расход' : 'Добавить расход'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Категория</label>
                <select value={form.categoryId} required
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={inputCls}>
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Сумма (в сумах)</label>
                <input type="number" step="0.01" min="0.01" value={form.amountMajor}
                  onChange={(e) => setForm({ ...form, amountMajor: e.target.value })}
                  required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Дата</label>
                <input type="date" value={form.spentAt}
                  onChange={(e) => setForm({ ...form, spentAt: e.target.value })}
                  required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Описание</label>
                <input type="text" value={form.description} maxLength={500}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls} placeholder="Необязательно" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-accent-500 focus:ring-accent-500/30" />
                <span className="text-sm text-dark-200">Повторяющийся</span>
              </label>
              {form.isRecurring && (
                <div className="animate-slide-down">
                  <label className="block text-sm font-medium text-dark-200 mb-1.5">Периодичность</label>
                  <select value={form.recurrence} required={form.isRecurring}
                    onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
                    className={inputCls}>
                    <option value="">Выберите</option>
                    <option value="monthly">Ежемесячно</option>
                    <option value="yearly">Ежегодно</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-2.5 text-sm font-medium text-dark-300 border border-dark-500 rounded-xl hover:bg-dark-700 hover:text-dark-100 transition-all duration-200 cursor-pointer">
                  Отмена
                </button>
                <button type="submit" disabled={submitLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                  {submitLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
