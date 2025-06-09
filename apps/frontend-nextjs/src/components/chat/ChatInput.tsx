import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";
import { sendMessage } from "@/lib/chatSocket";

export default function ChatInput({
  roomId,
  socket,
}: {
  roomId: string;
  socket: Socket | undefined;
}) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(socket, roomId, text);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
}
