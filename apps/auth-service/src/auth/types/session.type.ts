export type Session = {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
};
