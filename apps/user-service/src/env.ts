import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str(),
  PORT: port({ default: 3000 }),
  RABBITMQ_URL: str(),
  RABBITMQ_QUEUE: str(),
});
