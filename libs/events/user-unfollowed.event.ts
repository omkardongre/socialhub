import { BaseEvent } from "./base.event";

export const USER_UNFOLLOWED = "user_unfollowed";

export interface UserUnfollowedEventData {
  followerId: string;
  unfollowedId: string;
  unfollowedAt: string;
}

export interface UserUnfollowedEvent extends BaseEvent<UserUnfollowedEventData> {
  event: typeof USER_UNFOLLOWED;
  data: UserUnfollowedEventData;
}

export const createUserUnfollowedEvent = (
  data: UserUnfollowedEventData
): UserUnfollowedEvent => ({
  event: USER_UNFOLLOWED,
  data,
  timestamp: new Date().toISOString(),
});
