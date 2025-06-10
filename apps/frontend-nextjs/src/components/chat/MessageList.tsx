import React from "react";
import { useMessages } from "@/hooks/useMessages";
import { Message } from "@/types/message";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function MessageList({ roomId }: { roomId: string }) {
  const { data: messages = [], isLoading, error } = useMessages(roomId);

  console.log("messages", messages);

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div className="text-red-500">Error loading messages</div>;

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full">
      {messages.map((msg: Message) => (
        <Card key={msg.id} className="max-w-xs w-fit">
          <CardContent className="p-3 flex flex-col gap-2">
            <div className="text-xs text-gray-500 font-medium mb-1">
              {msg.senderId}
              <span className="ml-2 text-[10px] text-gray-400">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {msg.mediaUrl && (
              <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                <div className="relative w-full max-w-[320px] aspect-video mb-2 bg-white border rounded-md overflow-hidden">
                  <Image
                    src={msg.mediaUrl}
                    alt="chat media"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </a>
            )}
            {msg.content && (
              <div className="text-base text-gray-800 whitespace-pre-wrap break-words">
                {msg.content}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
