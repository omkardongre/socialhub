import { cleanEnv, str, port, url } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str(),
  JWT_REFRESH_SECRET: str(),
  JWT_REFRESH_EXPIRES_IN: str(),
  USER_SERVICE_URL: str(),
  NOTIFICATION_SERVICE_URL: str(),
  PORT: port({ default: 3000 }),
  SENDGRID_API_KEY: str(),
  FROM_EMAIL: str(),
  SIGNUP_SUCCESS_URL: str(),
});
