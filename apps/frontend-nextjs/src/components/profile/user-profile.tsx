"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { ProfileEditForm } from "./profile-edit-form";
import { api } from "@/lib/axios";
import { FollowButton } from "./follow-button";

export function UserProfile({ user }: { user: User }) {
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState<User>(user);
  const [isMe, setIsMe] = useState(false);

  useEffect(() => {
    async function checkMe() {
      try {
        const res = await api.get("/profile/me");
        if (res.data?.data?.userId === user.userId) setIsMe(true);
      } catch {}
    }
    checkMe();
  }, [user.userId]);

  const handleProfileUpdated = (
    name: string,
    bio: string,
    avatarUrl: string
  ) => {
    setProfile((prev) => ({ ...prev, name, bio, avatarUrl }));
  };

  return (
    <Card className="max-w-xl mx-auto mt-6">
      <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
        <div className="relative">
          <Image
            src={profile.avatarUrl || "/default-avatar.png"}
            alt="Avatar"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full border object-cover"
          />
          {isMe && (
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full shadow"
              onClick={() => setEditOpen(true)}
              aria-label="Edit profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036A2.5 2.5 0 1117.5 8.5L7 19H3v-4l10.5-10.5z"
                />
              </svg>
            </Button>
          )}
        </div>
        <h2 className="text-xl font-semibold">
          {profile.name || "Unnamed User"}
        </h2>
        <p className="text-gray-600 whitespace-pre-line">
          {profile.bio || "No bio yet."}
        </p>
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="text-xs text-gray-500">
            Joined: {new Date(profile.createdAt).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-400">
            Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
          </span>
        </div>
        {/* Show Follow button if not viewing own profile */}
        {!isMe && (
          <div className="mt-2">
            <FollowButton
              userId={profile.userId}
              isFollowing={profile.isFollowing}
              onFollowChange={() =>
                setProfile((prev) => ({
                  ...prev,
                  isFollowing: !prev.isFollowing,
                }))
              }
            />
          </div>
        )}
        <ProfileEditForm
          open={editOpen}
          onOpenChange={setEditOpen}
          initialName={profile.name}
          initialBio={profile.bio}
          initialAvatarUrl={profile.avatarUrl}
          onProfileUpdated={handleProfileUpdated}
        />
      </CardContent>
    </Card>
  );
}
