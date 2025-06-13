import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  PORT: str(),
  CHAT_SERVICE_WS_URL: str(),
  AUTH_SERVICE_URL: str(),
  USER_SERVICE_URL: str(),
  PROFILE_SERVICE_URL: str(),
  POST_SERVICE_URL: str(),
  NOTIFICATION_SERVICE_URL: str(),
  CHAT_ROOMS_SERVICE_URL: str(),
  MEDIA_SERVICE_URL: str(),
  FRONTEND_URL: str(),
});
