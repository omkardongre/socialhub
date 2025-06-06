import React from "react";

export default function ChatWindow({
  messages,
}: {
  messages: Array<{ senderName: string; text: string }>;
}) {
  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {messages.map((msg, i) => (
        <div key={i} className="text-sm">
          <span className="font-bold">{msg.senderName}: </span>
          {msg.text}
        </div>
      ))}
    </div>
  );
}
