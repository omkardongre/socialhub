export interface ChatRoom {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  participants: Array<{
    userId: string;
    lastSeen: string;
  }>;
  messages: Array<any>; // You can replace 'any' with a proper Message interface if available
}
