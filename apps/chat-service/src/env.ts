import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  PORT: port({ default: 3000 }),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str(),
  USER_SERVICE_URL: str(),
  API_GATEWAY: str(),
});
