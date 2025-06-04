import { Card, CardContent } from "@/components/ui/card";

export function PostCard({ post }: { post: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold">
          {post.user?.name || post.user?.email || "Unknown User"}
        </div>
        <div className="text-gray-700 mt-1">{post.content}</div>
        {post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt="post media"
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
