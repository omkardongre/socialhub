import React from "react";
import { useMessages } from "@/hooks/useMessages";
import { Message } from "@/types/message";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface MessageListProps {
  roomId: string;
  userId: string;
}

export default function MessageList({ roomId, userId }: MessageListProps) {
  const { data: messages = [], isLoading, error } = useMessages(roomId);

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div className="text-red-500">Error loading messages</div>;

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full">
      {messages.map((msg: Message) => {
        const isMe = msg.senderId === userId;
        return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-md w-full ${
                isMe
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-100 text-gray-900 mr-auto"
              }`}
            >
              <CardContent className="p-3 flex flex-col gap-2">
                <div
                  className={`text-xs font-medium mb-1 ${
                    isMe ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {isMe ? "You" : msg.senderId}
                  <span className="ml-2 text-[10px] text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {msg.mediaUrl && (
                  <a
                    href={msg.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                  <div className="text-base whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
