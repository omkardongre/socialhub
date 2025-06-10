export interface Media {
  id: string;
  url: string;
  type: string;
  size: number;
  postId?: string | null;
  chatMessageId?: string | null;
  createdAt: string;
}
