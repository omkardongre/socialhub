"use client";

import { useSearchParams } from "next/navigation";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useRoomPresence } from "@/hooks/useRoomPresence";

import MessageList from "@/components/chat/MessageList";
import { useAuth } from "@/context/AuthContext";
import ChatInput from "@/components/chat/ChatInput";
import { useReceiveMessage } from "@/hooks/useReceiveMessage";

export default function ChatClient() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const socket = useChatSocket(roomId);
  useRoomPresence(socket, roomId);
  useReceiveMessage(socket, roomId);

  const { user, loading: userLoading } = useAuth();

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

  if (userLoading) {
    return <div className="flex items-center justify-center h-full">Loading user...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-full">Please login to use chat.</div>;
  }

  return (
    <>
      <MessageList roomId={roomId} userId={user.userId} />
      <ChatInput roomId={roomId} socket={socket} />
    </>
  );
}
