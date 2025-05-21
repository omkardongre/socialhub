export class PostCreatedEventDto {
  postId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: Date;
}
