"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

export function NewPostForm() {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: () => api.post("/posts", { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setContent("");
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />
      <div className="mt-2 text-right">
        <Button
          onClick={() => postMutation.mutate()}
          disabled={!content || postMutation.isPending}
        >
          {postMutation.isPending ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}
