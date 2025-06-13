"use client";
import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import dynamic from "next/dynamic";
import ChatLayout from "./ChatLayout";
import { Skeleton } from "@/components/ui/skeleton";

const ChatClient = dynamic(() => import("./ChatClient"), {
  loading: () => <Skeleton className="h-full w-full" />,
  ssr: false,
});
import { ChatRoom } from "@/types/chat";

export default function ChatShell({
  initialRooms,
  setRooms,
}: {
  initialRooms: ChatRoom[];
  setRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
}) {
  const [rooms, setLocalRooms] = useState<ChatRoom[]>(initialRooms);

  const handleNewRoom = (room: ChatRoom) => {
    setLocalRooms((prev) => [...prev, room]);
    setRooms((prev: ChatRoom[]) => [...prev, room]);
  };

  return (
    <ChatLayout
      sidebar={<ChatSidebar initialRooms={rooms} onNewRoom={handleNewRoom} />}
      chatWindow={<ChatClient />}
    />
  );
}
