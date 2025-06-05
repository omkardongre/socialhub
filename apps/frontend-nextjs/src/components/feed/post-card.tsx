import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Post } from "@/types/post";

export function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold">{post.user?.name || "Unknown User"}</div>
        <div className="text-gray-700 mt-1">{post.content}</div>
        {post.mediaUrl && (
          <Image
            src={post.mediaUrl}
            alt="post media"
            width={500}
            height={500}
            className="mt-2 rounded-lg max-h-72 object-cover"
          />
        )}
        <div className="text-xs text-gray-500 mt-2">
          {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
        </div>
      </CardContent>
    </Card>
  );
}
