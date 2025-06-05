import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { User } from "@/types/user";

// FollowButton will be implemented in the next step
export function UserProfile({ user }: { user: User }) {
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
      </CardContent>
    </Card>
  );
}
