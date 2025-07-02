export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  mediaUrl: string | null;
  createdAt: string;
  senderName?: string;
}
