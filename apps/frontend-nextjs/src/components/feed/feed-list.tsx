"use client";

import { useQuery } from "@tanstack/react-query";
import { PostCard } from "./post-card";
import { api } from "@/lib/axios";
import { Post } from "@/types/post";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function FeedList() {
  const { data, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => (await api.get("/posts/feed")).data,
    staleTime: 120000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((_, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </CardContent>
          </Card>
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
