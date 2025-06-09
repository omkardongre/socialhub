"use client";
import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatClient from "./ChatClient";
import ChatLayout from "./ChatLayout";
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
