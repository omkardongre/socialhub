import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str(),
  S3_REGION: str(),
  S3_ACCESS_KEY: str(),
  S3_SECRET_KEY: str(),
  S3_BUCKET_NAME: str(),
  PORT: port({ default: 3000 }),
});
