import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatWindow({
  messages,
}: {
  messages: Array<{ senderName: string; text: string }>;
}) {
  return (
    <ScrollArea className="flex-1 h-full pr-2">
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <Card key={i} className="bg-background">
            <CardContent className="py-2 px-4">
              <span className="font-bold mr-1">{msg.senderName}:</span>
              <span>{msg.text}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
