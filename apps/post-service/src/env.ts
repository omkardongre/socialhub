import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  USER_SERVICE_URL: str(),
  JWT_EXPIRES_IN: str(),
  PORT: port({ default: 3000 }),
});
