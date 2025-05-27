import { BaseEvent } from "./base.event";

export const USER_FOLLOWED = "user_followed";

export interface UserFollowedEventData {
  followerId: string;
  followedId: string;
  followerName: string;
  followedEmail: string;
  followedAt: string;
}

export interface UserFollowedEvent extends BaseEvent<UserFollowedEventData> {
  event: typeof USER_FOLLOWED;
  data: UserFollowedEventData;
}

export const createUserFollowedEvent = (
  data: UserFollowedEventData
): UserFollowedEvent => ({
  event: USER_FOLLOWED,
  data,
  timestamp: new Date().toISOString(),
  version: "1.0.0",
});
