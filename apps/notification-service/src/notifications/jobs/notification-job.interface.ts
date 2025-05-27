export interface NotificationJob {
  userEmail: string;
  type: 'POST_CREATED' | 'USER_FOLLOWED' | 'COMMENT_ADDED' | 'LIKE_ADDED';
  payload: {
    [key: string]: any;
  };
}
