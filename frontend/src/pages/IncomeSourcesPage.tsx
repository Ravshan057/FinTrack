import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  getIncomeSources,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
} from '../api/endpoints';
import type { IncomeSource, IncomeSourceType } from '../types';

const emptyForm = { name: '', type: 'salary' as IncomeSourceType };
const typeOptions: { value: IncomeSourceType; label: string }[] = [
  { value: 'salary', label: 'Зарплата' },
  { value: 'freelance', label: 'Фриланс' },
  { value: 'other', label: 'Другое' },
];

export default function IncomeSourcesPage() {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getIncomeSources();
      setSources(data);
    } catch {
      setError('Ошибка загрузки источников');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(source: IncomeSource) {
    setEditingId(source.id);
    setForm({ name: source.name, type: source.type });
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
        await updateIncomeSource(editingId, form);
      } else {
        await createIncomeSource(form);
      }
      closeForm();
      fetchSources();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
        : undefined;
      setError(msg || 'Ошибка сохранения');
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleToggleActive(source: IncomeSource) {
    try {
      await updateIncomeSource(source.id, { isActive: !source.isActive });
      fetchSources();
    } catch {
      setError('Ошибка обновления');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить источник дохода? Связанные доходы останутся без источника.')) return;
    try {
      await deleteIncomeSource(id);
      fetchSources();
    } catch {
      setError('Ошибка удаления');
    }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-dark-100 placeholder-dark-400 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">Источники дохода</h2>
        <button onClick={openCreateForm}
          className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.97] cursor-pointer">
          + Добавить источник
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
        <div className="bg-dark-800 border border-dark-600/50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600 bg-dark-700/50">
                {['Название', 'Тип', 'Активен', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-dark-300 font-medium text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-dark-400 italic">Нет источников</td></tr>
              ) : (
                sources.map((src) => (
                  <tr key={src.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors duration-150">
                    <td className="py-3 px-4 text-dark-100 font-medium">{src.name}</td>
                    <td className="py-3 px-4 text-dark-200">
                      {typeOptions.find((t) => t.value === src.type)?.label || src.type}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(src)}
                        className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${
                          src.isActive
                            ? 'bg-green-500/30 hover:bg-green-500/40'
                            : 'bg-dark-500 hover:bg-dark-400'
                        }`}
                        title={src.isActive ? 'Деактивировать' : 'Активировать'}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                            src.isActive
                              ? 'left-[22px] bg-green-400'
                              : 'left-0.5 bg-dark-300'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => openEditForm(src)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-accent-400 hover:bg-dark-600 transition-all duration-200 cursor-pointer" title="Редактировать">✏️</button>
                        <button onClick={() => handleDelete(src.id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer" title="Удалить">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeForm}>
          <div className="bg-dark-800 border border-dark-600/50 rounded-2xl shadow-2xl shadow-black/40 p-8 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-dark-100 mb-6">
              {editingId ? 'Редактировать источник' : 'Добавить источник'}
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
                <select value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as IncomeSourceType })}
                  className={inputCls}>
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
