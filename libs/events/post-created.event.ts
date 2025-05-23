import { BaseEvent } from "./base.event";

export const POST_CREATED = "post_created";

export interface PostCreatedEventData {
  postId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface PostCreatedEvent extends BaseEvent<PostCreatedEventData> {
  event: typeof POST_CREATED;
  data: PostCreatedEventData;
}

export const createPostCreatedEvent = (
  data: PostCreatedEventData
): PostCreatedEvent => ({
  event: POST_CREATED,
  data,
  timestamp: new Date().toISOString(),
  version: "1.0.0",
});
