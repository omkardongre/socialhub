"use client";

import { useParams } from "next/navigation";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useRoomPresence } from "@/hooks/useRoomPresence";

import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatClient({ token }: { token: string }) {
  const params = useParams();
  const roomId = params.roomId as string | undefined;

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

  const socket = useChatSocket(token, roomId);
  useRoomPresence(socket, roomId);


  return (
    <>
      <MessageList roomId={roomId} />
      <ChatInput roomId={roomId} socket={socket} />
    </>
  );
}
