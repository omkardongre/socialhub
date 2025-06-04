import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { FollowButton } from "./follow-button";

// FollowButton will be implemented in the next step
export function UserProfile({ user }: { user: any }) {
  return (
    <Card className="max-w-xl mx-auto mt-6">
      <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
        <Image
          src={user.avatarUrl || "/default-avatar.png"}
          alt="Avatar"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full border"
        />
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-gray-600">{user.bio || "No bio yet."}</p>

        <div className="flex gap-6 text-sm text-gray-500">
          <div>
            <span className="font-bold">{user.followersCount}</span> Followers
          </div>
          <div>
            <span className="font-bold">{user.followingCount}</span> Following
          </div>
        </div>

        <FollowButton userId={user.userId} isFollowing={user.isFollowing} />
      </CardContent>
    </Card>
  );
}
