import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (token: string) => {
  const socketRef = useRef<Socket>();

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:4000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef.current;
};
