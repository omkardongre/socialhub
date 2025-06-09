import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";

export function useReceiveMessage(socket: Socket | undefined, roomId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !roomId) return;

    const handler = (message: any) => {
      queryClient.setQueryData(["messages", roomId], (old: any) => [
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
