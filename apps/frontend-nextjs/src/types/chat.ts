import { Message } from "./message";

export interface ChatRoom {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  participants: Array<{
    userId: string;
    lastSeen: string;
  }>;
  messages: Array<Message>;
}
