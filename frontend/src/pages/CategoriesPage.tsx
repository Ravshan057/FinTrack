import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/endpoints';
import type { Category, CategoryKind } from '../types';

const emptyForm = { name: '', kind: 'other' as CategoryKind, color: '#6366f1' };
const kindOptions: { value: CategoryKind; label: string }[] = [
  { value: 'subscription', label: 'Подписки' },
  { value: 'utility', label: 'Коммуналка' },
  { value: 'groceries', label: 'Продукты' },
  { value: 'rent', label: 'Аренда' },
  { value: 'other', label: 'Прочее' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function isSystem(cat: Category) {
    return cat.userId === null;
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, kind: cat.kind, color: cat.color || '#6366f1' });
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
      if (editingId) {
        await updateCategory(editingId, { name: form.name, kind: form.kind, color: form.color });
      } else {
        await createCategory({ name: form.name, kind: form.kind, color: form.color });
      }
      closeForm();
      fetchCategories();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
        : undefined;
      setError(msg || 'Ошибка сохранения');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Удалить категорию "${name}"?`)) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
        : undefined;
      setError(msg || 'Ошибка удаления. Возможно, есть связанные расходы.');
    }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 placeholder-dark-400 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">Категории расходов</h2>
        <button onClick={openCreateForm}
          className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.97] cursor-pointer">
          + Добавить категорию
        </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`group bg-dark-800 border rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 animate-slide-up ${
                isSystem(cat)
                  ? 'border-dark-600/30 opacity-75'
                  : 'border-dark-600/50 hover:border-dark-500 hover:scale-[1.01]'
              }`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div
                className="w-3 h-12 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: cat.color || '#5a5a7a' }}
              />
              <div className="flex-1 min-w-0">
                <strong className="block text-sm font-semibold text-dark-100 truncate">{cat.name}</strong>
                <span className="text-xs text-dark-300">
                  {kindOptions.find((k) => k.value === cat.kind)?.label || cat.kind}
                </span>
                {isSystem(cat) && (
                  <span className="inline-block mt-1 text-[10px] text-dark-400 bg-dark-700 px-2 py-0.5 rounded-full">
                    Системная
                  </span>
                )}
              </div>
              {!isSystem(cat) && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => openEditForm(cat)}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-accent-400 hover:bg-dark-600 transition-all duration-200 cursor-pointer" title="Редактировать">✏️</button>
                  <button onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer" title="Удалить">🗑️</button>
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="col-span-full text-center text-dark-400 py-16 italic">Нет категорий</p>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeForm}>
          <div className="bg-dark-800 border border-dark-600/50 rounded-2xl shadow-2xl shadow-black/40 p-8 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-dark-100 mb-6">
              {editingId ? 'Редактировать категорию' : 'Добавить категорию'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Название</label>
                <input type="text" value={form.name} required maxLength={100}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Тип</label>
                <select value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as CategoryKind })}
                  className={inputCls}>
                  {kindOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Цвет</label>
                <input type="color" value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full h-11 px-2 bg-dark-700 border border-dark-500 rounded-xl cursor-pointer transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" />
              </div>
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
