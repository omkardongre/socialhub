import { cleanEnv, str, port, num } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  PORT: port({ default: 3000 }),
  SENDGRID_API_KEY: str(),
  FROM_EMAIL: str(),
  REDIS_URL: str(),
});
