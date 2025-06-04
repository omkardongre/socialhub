"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function FollowButton({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return isFollowing
        ? await api.post(`users/${userId}/unfollow`)
        : await api.post(`users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
  });

  return (
    <Button
      onClick={() => mutation.mutate()}
      variant={isFollowing ? "secondary" : "default"}
      disabled={mutation.isPending}
    >
      {mutation.isPending
        ? isFollowing
          ? "Unfollowing..."
          : "Following..."
        : isFollowing
        ? "Unfollow"
        : "Follow"}
    </Button>
  );
}
