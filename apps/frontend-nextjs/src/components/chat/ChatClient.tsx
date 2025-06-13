"use client";

import { useSearchParams } from "next/navigation";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useRoomPresence } from "@/hooks/useRoomPresence";

import MessageList from "@/components/chat/MessageList";
import { useAuth } from "@/context/AuthContext";
import ChatInput from "@/components/chat/ChatInput";
import { useReceiveMessage } from "@/hooks/useReceiveMessage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatClient() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const socket = useChatSocket(roomId);
  useRoomPresence(socket, roomId);
  useReceiveMessage(socket, roomId);

  const { user, loading: userLoading } = useAuth();

  if (!roomId) {
    return (
      <Card className="flex flex-col items-center justify-center h-full w-full">
        <CardHeader className="w-full text-center">
          <CardTitle className="w-full text-center">
            Select a chat to start messaging
          </CardTitle>
          <CardDescription className="w-full text-center">
            or create a new one
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="flex items-center justify-center h-full w-full">
        <CardHeader>
          <CardTitle>Please login to use chat.</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <MessageList roomId={roomId} userId={user.userId} />
      <ChatInput roomId={roomId} socket={socket} />
    </>
  );
}
