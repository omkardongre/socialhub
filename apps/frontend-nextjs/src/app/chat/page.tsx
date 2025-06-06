"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  // TODO: Replace with real token from auth context or cookie
  const token = "";
  const socket = useSocket(token);

  const [rooms, setRooms] = useState([
    { id: "general", name: "General" },
    // Add more rooms as needed
  ]);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Optional: fetch rooms from server
    // setRooms([...]);
    // setCurrentRoom(...);

    return () => {
      socket.off("message");
    };
  }, [socket]);

  const handleSend = (text: string) => {
    if (!socket || !currentRoom) return;
    socket.emit("message", {
      roomId: currentRoom,
      text,
    });
  };

  return (
    <ChatLayout
      sidebar={<ChatSidebar rooms={rooms} onSelect={setCurrentRoom} />}
      chatWindow={
        <>
          <ChatWindow messages={messages} />
          <ChatInput onSend={handleSend} />
        </>
      }
    />
  );
}
