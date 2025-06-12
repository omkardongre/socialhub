"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function FollowButton({
  userId,
  isFollowing,
  onFollowChange,
}: {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: () => void;
}) {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      setOptimistic(!isFollowing); // Optimistically update UI
      return isFollowing
        ? await api.delete(`users/${userId}/follow`)
        : await api.post(`users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      if (onFollowChange) onFollowChange();
      setOptimistic(null); // Reset optimistic state
    },
    onError: () => {
      setOptimistic(null); // Reset on error
    },
  });

  // Determine button state (real or optimistic)
  const following = optimistic !== null ? optimistic : isFollowing;

  return (
    <Button
      onClick={() => mutation.mutate()}
      variant={following ? "secondary" : "default"}
      disabled={mutation.isPending}
      className="transition-all duration-200"
    >
      {mutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {following ? "Unfollowing..." : "Following..."}
        </>
      ) : following ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </Button>
  );
}
