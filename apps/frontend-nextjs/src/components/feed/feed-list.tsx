"use client";

import { useQuery } from "@tanstack/react-query";
import { PostCard } from "./post-card";
import { api } from "@/lib/axios";
import { Post } from "@/types/post";

export function FeedList() {
  const { data, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => (await api.get("/posts/feed")).data,
  });

  if (isLoading) return <p>Loading feed...</p>;

  const posts = data?.data ?? [];

  return (
    <div className="space-y-4">
      {posts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
