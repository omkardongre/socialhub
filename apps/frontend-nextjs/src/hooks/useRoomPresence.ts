import { useEffect } from "react";
import { Socket } from "socket.io-client";

export function useRoomPresence(socket: Socket | null, roomId: string | null) {
  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join_room", { roomId });
    return () => {
      socket.emit("leave_room", { roomId });
    };
  }, [socket, roomId]);
}
