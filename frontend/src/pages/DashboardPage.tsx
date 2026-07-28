import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  getMonthlySummary,
  getSummaryByCategory,
  getSummaryBySource,
  getRecurring,
} from '../api/endpoints';
import type {
  SummaryResponse,
  SummaryByCategoryItem,
  SummaryBySourceItem,
  RecurringResponse,
} from '../types';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

function formatAmount(minor: number, currency = 'UZS'): string {
  const major = minor / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency === 'UZS' ? 'UZS' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'UZS' ? 0 : 2,
  }).format(major).replace(/\s/g, ' ');
}

function getMonthString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(getMonthString(now));
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [byCategory, setByCategory] = useState<SummaryByCategoryItem[]>([]);
  const [bySource, setBySource] = useState<SummaryBySourceItem[]>([]);
  const [recurring, setRecurring] = useState<RecurringResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, cat, src, rec] = await Promise.all([
        getMonthlySummary(month),
        getSummaryByCategory(month),
        getSummaryBySource(month),
        getRecurring(),
      ]);
      setSummary(sum);
      setByCategory(cat.items);
      setBySource(src.items);
      setRecurring(rec);
    } catch (err) {
      console.error('Ошибка загрузки дашборда:', err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handlePrevMonth() {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() - 1);
    setMonth(getMonthString(d));
  }

  function handleNextMonth() {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() + 1);
    setMonth(getMonthString(d));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-400 rounded-full animate-spin" />
          <p className="text-dark-300 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={handlePrevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-dark-700 border border-dark-500 text-dark-200 hover:bg-dark-600 hover:text-dark-100 transition-all duration-200 active:scale-90 cursor-pointer"
        >
          &lt;
        </button>
        <h2 className="text-xl font-semibold text-dark-100 min-w-[100px] text-center tracking-tight">
          {month}
        </h2>
        <button
          onClick={handleNextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-dark-700 border border-dark-500 text-dark-200 hover:bg-dark-600 hover:text-dark-100 transition-all duration-200 active:scale-90 cursor-pointer"
        >
          &gt;
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-dark-800 border border-dark-600/50 rounded-2xl p-6 animate-slide-up transition-all duration-300 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5">
            <span className="text-sm text-dark-300">Доход</span>
            <strong className="block text-2xl font-bold text-green-400 mt-1">
              {formatAmount(summary.totalIncomeMinor, summary.currency)}
            </strong>
          </div>
          <div className="bg-dark-800 border border-dark-600/50 rounded-2xl p-6 animate-slide-up [animation-delay:80ms] transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5">
            <span className="text-sm text-dark-300">Расход</span>
            <strong className="block text-2xl font-bold text-red-400 mt-1">
              {formatAmount(summary.totalExpenseMinor, summary.currency)}
            </strong>
          </div>
          <div className="bg-dark-800 border border-dark-600/50 rounded-2xl p-6 animate-slide-up [animation-delay:160ms] transition-all duration-300 hover:border-accent-500/30 hover:shadow-lg hover:shadow-accent-500/5">
            <span className="text-sm text-dark-300">Баланс</span>
            <strong
              className={`block text-2xl font-bold mt-1 ${
                summary.balanceMinor >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatAmount(summary.balanceMinor, summary.currency)}
            </strong>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 border border-dark-600/50 rounded-2xl p-6 animate-slide-up [animation-delay:200ms] transition-all duration-300 hover:border-dark-500">
          <h3 className="text-sm font-medium text-dark-300 mb-4 uppercase tracking-wider">
            Расходы по категориям
          </h3>
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="totalMinor"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {byCategory.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => formatAmount(val)}
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2e2e3d',
                    borderRadius: '10px',
                    color: '#b0b0c8',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-dark-400 py-16">Нет данных за этот месяц</p>
          )}
        </div>

        <div className="bg-dark-800 border border-dark-600/50 rounded-2xl p-6 animate-slide-up [animation-delay:280ms] transition-all duration-300 hover:border-dark-500">
          <h3 className="text-sm font-medium text-dark-300 mb-4 uppercase tracking-wider">
            Доходы по источникам
          </h3>
          {bySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3d" />
                <XAxis dataKey="name" tick={{ fill: '#8888a4', fontSize: 12 }} />
                <YAxis tickFormatter={(val: number) => formatAmount(val)} tick={{ fill: '#8888a4', fontSize: 12 }} />
                <Tooltip
                  formatter={(val: number) => formatAmount(val)}
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2e2e3d',
                    borderRadius: '10px',
                    color: '#b0b0c8',
                  }}
                />
                <Legend wrapperStyle={{ color: '#8888a4' }} />
                <Bar dataKey="totalMinor" fill="#6366f1" name="Доход" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-dark-400 py-16">Нет данных за этот месяц</p>
          )}
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-600/50 rounded-2xl p-6 animate-slide-up [animation-delay:350ms] transition-all duration-300 hover:border-dark-500">
        <h3 className="text-sm font-medium text-dark-300 mb-4 uppercase tracking-wider">
          Постоянные обязательства
        </h3>
        {recurring && recurring.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-4 text-dark-300 font-medium text-xs uppercase tracking-wider">
                    Название
                  </th>
                  <th className="text-right py-3 px-4 text-dark-300 font-medium text-xs uppercase tracking-wider">
                    Сумма / мес
                  </th>
                  <th className="text-left py-3 px-4 text-dark-300 font-medium text-xs uppercase tracking-wider">
                    Тип
                  </th>
                </tr>
              </thead>
              <tbody>
                {recurring.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-dark-700/50 hover:bg-dark-700/40 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 text-dark-100">{item.name}</td>
                    <td className="py-3 px-4 text-right text-dark-200 font-medium">
                      {formatAmount(item.amountMinor)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.recurrence === 'monthly'
                            ? 'bg-accent-500/15 text-accent-400'
                            : 'bg-yellow-500/15 text-yellow-400'
                        }`}
                      >
                        {item.recurrence === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-dark-400 py-12">Нет постоянных платежей</p>
        )}
        {recurring && (
          <div className="mt-4 pt-4 border-t border-dark-700/50 text-right">
            <span className="text-sm text-dark-300">Всего в месяц: </span>
            <strong className="text-lg text-dark-100">
              {formatAmount(recurring.monthlyExpenseMinor)}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}
