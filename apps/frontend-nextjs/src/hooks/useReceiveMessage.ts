import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import { Message } from "@/types/message";

export function useReceiveMessage(
  socket: Socket | null,
  roomId: string | null
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !roomId) return;

    const handler = (message: Message) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[]) => [
        ...(old || []),
        message,
      ]);
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [socket, roomId, queryClient]);
}
