"use client";
import { useEffect, useState } from "react";
import ChatShell from "@/components/chat/ChatShell";
import { api } from "@/lib/axios";
import { ChatRoom } from "@/types/chat";

export default function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const res = await api.get("/chat-rooms");
        setRooms(res.data.data);
      } catch (e) {
        console.error("Failed to fetch chat rooms:", e);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <ChatShell initialRooms={rooms} setRooms={setRooms} />;
}
