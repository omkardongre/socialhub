import { User } from "./user";

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  likes: Like[];
  user: User;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}
