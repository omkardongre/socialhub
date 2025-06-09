import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function useMessages(roomId: string) {
  return useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await api.get(`/chat-rooms/${roomId}/messages`);
      return res.data.data;
    },
  });
}
