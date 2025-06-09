import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useChatSocket(roomId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!roomId) {
      setSocket(null);
      return;
    }

    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      path: "/socket.io",
      query: { roomId },
      transports: ["websocket"],
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [roomId]);

  return socket;
}
