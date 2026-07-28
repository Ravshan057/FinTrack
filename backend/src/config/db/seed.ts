import { connect } from '@tursodatabase/serverless';
import config from '../env';

const connection = connect({
  url: config.TURSO_DATABASE_URL,
  authToken: config.TURSO_AUTH_TOKEN || undefined,
});

async function seed() {
  const schemaStatements = [
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

  for (const sql of schemaStatements) {
    await connection.exec(sql);
  }

  const systemCategories = [
    { name: 'Подписки', kind: 'subscription', color: '#FF6384' },
    { name: 'Коммуналка', kind: 'utility', color: '#36A2EB' },
    { name: 'Продукты', kind: 'groceries', color: '#FFCE56' },
    { name: 'Аренда', kind: 'rent', color: '#4BC0C0' },
    { name: 'Прочее', kind: 'other', color: '#9966FF' },
  ];

  for (const cat of systemCategories) {
    await connection.run(
      `INSERT OR IGNORE INTO categories (user_id, name, kind, icon, color)
       VALUES (NULL, ?, ?, NULL, ?)`,
      cat.name, cat.kind, cat.color
    );
  }

  console.log('✅ Схема и системные категории созданы');
  await connection.close();
}

seed().catch((err) => {
  console.error('❌ Ошибка seed:', err);
  process.exit(1);
});
