"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatRoom } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
const NewChatModal = dynamic(() => import("./NewChatModal"), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
});
import { api } from "@/lib/axios";

export default function ChatSidebar({
  initialRooms,
  onNewRoom,
}: {
  initialRooms: ChatRoom[];
  onNewRoom?: (room: ChatRoom) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRoomId = searchParams.get("roomId");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateChat = async (participantIds: string[]) => {
    try {
      const res = await api.post("/chat-rooms", {
        participants: participantIds,
      });
      const newRoom = res.data.data;

      if (onNewRoom) {
        onNewRoom(newRoom);
      }
      router.push(`/chat?roomId=${newRoom.id}`, { scroll: false });
      setIsModalOpen(false);
    } catch (err) {
      // Log errors for monitoring and debugging
      console.error("[ChatSidebar] Error creating chat room:", err);
    }
  };

  return (
    <div className="space-y-4">
      <Button className="w-full" onClick={() => setIsModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> New Chat
      </Button>

      <div className="space-y-2">
        {initialRooms.map((room) => (
          <Card
            key={room.id}
            className={cn(
              "p-4 cursor-pointer transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              currentRoomId === room.id
                ? "bg-accent text-accent-foreground border-l-4 border-primary"
                : "bg-card"
            )}
            onClick={() => {
              router.push(`/chat?roomId=${room.id}`, { scroll: false });
            }}
          >
            <div className="font-medium">{room.name}</div>
          </Card>
        ))}
      </div>

      <NewChatModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateChat}
      />
    </div>
  );
}
