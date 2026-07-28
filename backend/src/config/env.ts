import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  CORS_ORIGIN: string;
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Переменная окружения ${name} не установлена`);
  }
  return value;
}

const config: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '4000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  TURSO_DATABASE_URL: getEnvVar('TURSO_DATABASE_URL'),
  TURSO_AUTH_TOKEN: getEnvVar('TURSO_AUTH_TOKEN', ''),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  BCRYPT_ROUNDS: parseInt(getEnvVar('BCRYPT_ROUNDS', '10'), 10),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
};

export default config;
