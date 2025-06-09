import { Socket } from "socket.io-client";

export function sendMessage(
  socket: Socket | undefined,
  roomId: string,
  content: string
) {
  if (!socket) return;
  socket.emit("send_message", {
    roomId,
    content,
  });
}
