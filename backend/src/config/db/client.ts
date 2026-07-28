import { connect, type Connection } from '@tursodatabase/serverless';
import config from '../env';

const connection: Connection = connect({
  url: config.TURSO_DATABASE_URL,
  authToken: config.TURSO_AUTH_TOKEN || undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

interface PreparedLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(...params: any[]): Promise<AnyRow | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all(...params: any[]): Promise<AnyRow[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(...params: any[]): Promise<{ changes: number; lastInsertRowid: number }>;
}

const db = {
  prepare(sql: string): PreparedLike {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async get(...params: any[]): Promise<AnyRow | undefined> {
        const row = params.length > 0
          ? await connection.get(sql, ...params)
          : await connection.get(sql);
        return row ?? undefined;
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async all(...params: any[]): Promise<AnyRow[]> {
        const result = params.length > 0
          ? await connection.all(sql, ...params)
          : await connection.all(sql);
        return Array.isArray(result) ? result : [];
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async run(...params: any[]): Promise<{ changes: number; lastInsertRowid: number }> {
        const result = params.length > 0
          ? await connection.run(sql, ...params)
          : await connection.run(sql);
        return {
          changes: result.rowsAffected ?? 0,
          lastInsertRowid: Number(result.lastInsertRowid ?? 0),
        };
      },
    };
  },

  async exec(sql: string) {
    await connection.exec(sql);
  },

  async execute(sql: string, args?: any[]) {
    return args
      ? connection.run(sql, ...args)
      : connection.run(sql);
  },

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return connection.transaction(fn)();
  },
};

export default db;
export { connection };
