"use client";

import { useSearchParams } from "next/navigation";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useRoomPresence } from "@/hooks/useRoomPresence";

import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import { useReceiveMessage } from "@/hooks/useReceiveMessage";

export default function ChatClient() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const socket = useChatSocket(roomId);
  useRoomPresence(socket, roomId);
  useReceiveMessage(socket, roomId);

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="text-lg font-medium">
          Select a chat to start messaging
        </div>
        <p className="text-sm mt-2">or create a new one</p>
      </div>
    );
  }

  return (
    <>
      <MessageList roomId={roomId} />
      <ChatInput roomId={roomId} socket={socket} />
    </>
  );
}
