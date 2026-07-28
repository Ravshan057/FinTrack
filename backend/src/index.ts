import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/env';
import { connection } from './config/db/client';
import { errorHandler } from './middleware/error';

// Routes
import authRoutes from './modules/auth/routes';
import incomeSourcesRoutes from './modules/auth/income-sources/routes';
import incomesRoutes from './modules/incomes/routes';
import categoriesRoutes from './modules/categories/routes';
import expensesRoutes from './modules/expenses/routes';
import summaryRoutes from './modules/summary/routes';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    email            TEXT    NOT NULL UNIQUE,
    password_hash    TEXT    NOT NULL,
    display_name     TEXT,
    default_currency TEXT    NOT NULL DEFAULT 'UZS',
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS income_sources (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    type       TEXT    NOT NULL DEFAULT 'salary'
               CHECK (type IN ('salary','freelance','other')),
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS incomes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_id    INTEGER REFERENCES income_sources(id) ON DELETE SET NULL,
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency     TEXT    NOT NULL DEFAULT 'UZS',
    received_at  TEXT    NOT NULL,
    note         TEXT,
    is_recurring INTEGER NOT NULL DEFAULT 0,
    recurrence   TEXT    CHECK (recurrence IN ('monthly','yearly')),
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name     TEXT    NOT NULL,
    kind     TEXT    NOT NULL DEFAULT 'other'
             CHECK (kind IN ('subscription','utility','groceries','rent','other')),
    icon     TEXT,
    color    TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id  INTEGER NOT NULL REFERENCES categories(id),
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency     TEXT    NOT NULL DEFAULT 'UZS',
    spent_at     TEXT    NOT NULL,
    description  TEXT,
    is_recurring INTEGER NOT NULL DEFAULT 0,
    recurrence   TEXT    CHECK (recurrence IN ('monthly','yearly')),
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON incomes(user_id, received_at)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, spent_at)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sources_user ON income_sources(user_id)`,
];

const SYSTEM_CATEGORIES = [
  { name: 'Подписки', kind: 'subscription', color: '#FF6384' },
  { name: 'Коммуналка', kind: 'utility', color: '#36A2EB' },
  { name: 'Продукты', kind: 'groceries', color: '#FFCE56' },
  { name: 'Аренда', kind: 'rent', color: '#4BC0C0' },
  { name: 'Прочее', kind: 'other', color: '#9966FF' },
];

let dbReady: Promise<void> | null = null;

async function initDb() {
  for (const sql of SCHEMA_STATEMENTS) {
    await connection.exec(sql);
  }
  const existing = await connection.get('SELECT COUNT(*) as cnt FROM categories WHERE user_id IS NULL');
  if (existing && existing.cnt === 0) {
    for (const cat of SYSTEM_CATEGORIES) {
      await connection.run(
        'INSERT INTO categories (user_id, name, kind, icon, color) VALUES (NULL, ?, ?, NULL, ?)',
        cat.name, cat.kind, cat.color
      );
    }
  }
}

function ensureDbReady() {
  if (!dbReady) {
    dbReady = initDb();
  }
  return dbReady;
}

const app = express();

// DB init middleware — FIRST, before all routes
app.use(async (_req, _res, next) => {
  try {
    await ensureDbReady();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Слишком много запросов, попробуйте позже' } },
});
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/income-sources', incomeSourcesRoutes);
app.use('/api/incomes', incomesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/summary', summaryRoutes);

app.use(errorHandler);

// Vercel: export the app. Local: start the server.
const isVercel = !!process.env.VERCEL;

if (!isVercel) {
  ensureDbReady().then(() => {
    app.listen(config.PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${config.PORT}`);
    });
  }).catch((err) => {
    console.error('❌ Ошибка запуска сервера:', err);
    process.exit(1);
  });
}

export default app;
