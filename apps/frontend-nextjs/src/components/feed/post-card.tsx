import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Post } from "@/types/post";

export function PostCard({ post }: { post: Post }) {
  const userName = post.user?.name || "Unknown User";
  const userInitial = userName.charAt(0).toUpperCase();
  const createdAt = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  return (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            {post.user?.avatarUrl ? (
              <AvatarImage src={post.user.avatarUrl} alt={userName} />
            ) : (
              <AvatarFallback>{userInitial}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-base text-gray-900">
              {userName}
            </span>
            <span className="text-xs text-gray-500">{createdAt}</span>
          </div>
        </div>
        <div className="text-gray-800 text-[15px] mb-3 whitespace-pre-line">
          {post.content}
        </div>
        {post.mediaUrl && (
          <div className="inline-flex justify-center bg-gray-100 rounded-lg overflow-hidden mb-2">
            <Image
              src={post.mediaUrl}
              alt="post media"
              width={350}
              height={250}
              className="rounded-lg object-contain"
              style={{ background: "#f3f4f6" }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
