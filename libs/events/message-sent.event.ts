import { BaseEvent } from "./base.event";

export const MESSAGE_SENT = "message_sent";

export interface MessageSentEventData {
  messageId: string;
  senderId: string;
  roomId: string;
  content: string;
  sentAt: string;
  mediaUrl?: string;
}

export interface MessageSentEvent extends BaseEvent<MessageSentEventData> {
  event: typeof MESSAGE_SENT;
  data: MessageSentEventData;
}

export const createMessageSentEvent = (
  data: MessageSentEventData
): MessageSentEvent => ({
  event: MESSAGE_SENT,
  data,
  timestamp: new Date().toISOString(),
  version: "1.0.0",
});
