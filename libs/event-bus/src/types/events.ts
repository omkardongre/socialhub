export interface PostCreatedEvent {
  postId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
}

export interface UserFollowedEvent {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface MessageSentEvent {
  messageId: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}
