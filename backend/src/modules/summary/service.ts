import db from '../../config/db/client';

function getMonthRange(month: string): { from: string; to: string } {
  const [year, mon] = month.split('-').map(Number);
  const from = `${month}-01`;
  const to = mon === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(mon + 1).padStart(2, '0')}-01`;
  return { from, to };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export async function getMonthlySummary(userId: number, month: string) {
  const { from, to } = getMonthRange(month);

  const incomeRow = await db.prepare(
    'SELECT COALESCE(SUM(amount_minor), 0) as total FROM incomes WHERE user_id = ? AND received_at >= ? AND received_at < ?'
  ).get(userId, from, to) as { total: number };

  const expenseRow = await db.prepare(
    'SELECT COALESCE(SUM(amount_minor), 0) as total FROM expenses WHERE user_id = ? AND spent_at >= ? AND spent_at < ?'
  ).get(userId, from, to) as { total: number };

  return {
    month,
    currency: 'UZS',
    totalIncomeMinor: incomeRow.total,
    totalExpenseMinor: expenseRow.total,
    balanceMinor: incomeRow.total - expenseRow.total,
  };
}

export async function getByCategory(userId: number, month: string) {
  const { from, to } = getMonthRange(month);

  const rows = await db.prepare(`
    SELECT e.category_id as categoryId, c.name, c.kind, SUM(e.amount_minor) as totalMinor
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    WHERE e.user_id = ? AND e.spent_at >= ? AND e.spent_at < ?
    GROUP BY e.category_id, c.name, c.kind
    ORDER BY totalMinor DESC
  `).all(userId, from, to) as Array<AnyRow>;

  return { month, items: rows };
}

export async function getBySource(userId: number, month: string) {
  const { from, to } = getMonthRange(month);

  const rows = await db.prepare(`
    SELECT i.source_id as sourceId, COALESCE(s.name, 'Без источника') as name, SUM(i.amount_minor) as totalMinor
    FROM incomes i
    LEFT JOIN income_sources s ON s.id = i.source_id
    WHERE i.user_id = ? AND i.received_at >= ? AND i.received_at < ?
    GROUP BY i.source_id, s.name
    ORDER BY totalMinor DESC
  `).all(userId, from, to) as Array<AnyRow>;

  return { month, items: rows };
}

export async function getRecurring(userId: number) {
  const expenseRows = await db.prepare(`
    SELECT e.category_id as categoryId, e.amount_minor as amountMinor, e.recurrence,
           c.name
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    WHERE e.user_id = ? AND e.is_recurring = 1
  `).all(userId) as Array<AnyRow>;

  const items = expenseRows.map((row) => ({
    type: 'expense' as const,
    categoryId: row.categoryId,
    name: row.name,
    amountMinor: row.amountMinor,
    recurrence: row.recurrence as 'monthly' | 'yearly',
  }));

  const monthlyTotal = expenseRows.reduce((sum, row) => {
    if (row.recurrence === 'monthly') {
      return sum + row.amountMinor;
    }
    if (row.recurrence === 'yearly') {
      return sum + Math.round(row.amountMinor / 12);
    }
    return sum;
  }, 0);

  return {
    monthlyExpenseMinor: monthlyTotal,
    items,
  };
}
