// app/chat/page.tsx (Server Component)
import { cookies } from "next/headers";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatClient from "@/components/chat/ChatClient";
import { api } from "@/lib/axios";
import { ChatRoom } from "@/types/chat";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  console.log("token =", token);

  // Fetch rooms server-side
  const res = await api.get("/chat-rooms", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const rooms: ChatRoom[] = res.data.data;

  console.log("rooms ", rooms);

  return (
    <ChatLayout
      sidebar={<ChatSidebar initialRooms={rooms} />}
      chatWindow={<ChatClient token={token} />}
    />
  );
}
