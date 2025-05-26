// Event Types
export * from "./post-created.event";
export * from "./user-followed.event";
export * from "./user-unfollowed.event";
export * from "./message-sent.event";

// Import types for type definitions
import { PostCreatedEvent } from "./post-created.event";
import { UserFollowedEvent } from "./user-followed.event";
import { UserUnfollowedEvent } from "./user-unfollowed.event";
import { MessageSentEvent } from "./message-sent.event";

// Helper Types
export type EventTypes =
  | PostCreatedEvent
  | UserFollowedEvent
  | UserUnfollowedEvent
  | MessageSentEvent;

// Helper function to type guard events
export function isEventType<T extends EventTypes>(
  event: any,
  type: string
): event is T {
  return event?.event === type;
}
