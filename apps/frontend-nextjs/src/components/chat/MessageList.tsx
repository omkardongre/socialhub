import React from "react";
import { useMessages } from "@/hooks/useMessages";

export default function MessageList({ roomId }: { roomId: string }) {
  const { data: messages = [], isLoading, error } = useMessages(roomId);

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div className="text-red-500">Error loading messages</div>;

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full">
      {messages.map((msg: any) => (
        <div key={msg.id} className="rounded bg-gray-100 p-2">
          <div className="text-xs text-gray-500">{msg.senderId}</div>
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  );
}
