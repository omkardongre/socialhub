"use client";

import { useQuery } from "@tanstack/react-query";
import { PostCard } from "./post-card";
import { api } from "@/lib/axios";
import { Post } from "@/types/post";
import { Skeleton } from "@/components/ui/skeleton";

export function FeedList() {
  const { data, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => (await api.get("/posts/feed")).data,
  });

  if (isLoading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((_, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow p-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    );

  const posts = data?.data ?? [];

  return (
    <div className="space-y-4">
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
